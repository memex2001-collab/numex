import AVFoundation
import CoreImage

/// Kapselt die AVFoundation-Kamera: nur Rückkamera (Weitwinkel), Live-Bilder für den Sucher
/// und Fotoaufnahme in voller Auflösung. Alle Session-Zugriffe laufen auf `sessionQueue`.
final class CameraService: NSObject, @unchecked Sendable {
    enum CameraError: Error {
        case noCamera, cannotAddInput, cannotAddOutput, notRunning, noImageData
    }

    /// Wird auf der Video-Queue mit jedem neuen Vorschaubild aufgerufen.
    var onPreviewFrame: (@Sendable (CIImage) -> Void)?

    private let session = AVCaptureSession()
    private let sessionQueue = DispatchQueue(label: "cappuccino.camera.session")
    private let videoQueue = DispatchQueue(label: "cappuccino.camera.video", qos: .userInteractive)
    private let videoOutput = AVCaptureVideoDataOutput()
    private let photoOutput = AVCapturePhotoOutput()
    private var device: AVCaptureDevice?
    private var rotationCoordinator: AVCaptureDevice.RotationCoordinator?
    private var inFlightCaptures: [Int64: PhotoCaptureDelegate] = [:]
    private var isConfigured = false

    // MARK: Berechtigung

    static func requestAccess() async -> Bool {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized: return true
        case .notDetermined: return await AVCaptureDevice.requestAccess(for: .video)
        default: return false
        }
    }

    // MARK: Start

    func start() async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            sessionQueue.async {
                do {
                    try self.configureIfNeeded()
                    if !self.session.isRunning { self.session.startRunning() }
                    continuation.resume()
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    private func configureIfNeeded() throws {
        guard !isConfigured else { return }
        session.beginConfiguration()
        defer { session.commitConfiguration() }

        session.sessionPreset = .photo

        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back) else {
            throw CameraError.noCamera
        }
        let input = try AVCaptureDeviceInput(device: device)
        guard session.canAddInput(input) else { throw CameraError.cannotAddInput }
        session.addInput(input)

        // Foto-Ausgang
        guard session.canAddOutput(photoOutput) else { throw CameraError.cannotAddOutput }
        session.addOutput(photoOutput)
        if let largest = device.activeFormat.supportedMaxPhotoDimensions
            .max(by: { Int($0.width) * Int($0.height) < Int($1.width) * Int($1.height) }) {
            photoOutput.maxPhotoDimensions = largest
        }
        photoOutput.maxPhotoQualityPrioritization = .balanced
        if photoOutput.isZeroShutterLagSupported { photoOutput.isZeroShutterLagEnabled = true }
        if photoOutput.isResponsiveCaptureSupported { photoOutput.isResponsiveCaptureEnabled = true }

        // Video-Ausgang für den Live-Sucher
        videoOutput.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]
        videoOutput.alwaysDiscardsLateVideoFrames = true
        videoOutput.setSampleBufferDelegate(self, queue: videoQueue)
        guard session.canAddOutput(videoOutput) else { throw CameraError.cannotAddOutput }
        session.addOutput(videoOutput)
        // Die Oberfläche ist im Hochformat fixiert: Vorschaubilder immer im Hochformat liefern.
        if let connection = videoOutput.connection(with: .video), connection.isVideoRotationAngleSupported(90) {
            connection.videoRotationAngle = 90
        }

        rotationCoordinator = AVCaptureDevice.RotationCoordinator(device: device, previewLayer: nil)
        self.device = device
        isConfigured = true
    }

    // MARK: Fokus & Belichtung

    /// - Parameter lock: `true` fokussiert/belichtet einmal und hält die Werte dann fest (AE/AF-Sperre).
    func focus(at devicePoint: CGPoint, lock: Bool) {
        sessionQueue.async {
            guard let device = self.device, (try? device.lockForConfiguration()) != nil else { return }
            defer { device.unlockForConfiguration() }
            let focusMode: AVCaptureDevice.FocusMode = lock ? .autoFocus : .continuousAutoFocus
            let exposureMode: AVCaptureDevice.ExposureMode = lock ? .autoExpose : .continuousAutoExposure
            if device.isFocusPointOfInterestSupported { device.focusPointOfInterest = devicePoint }
            if device.isFocusModeSupported(focusMode) { device.focusMode = focusMode }
            if device.isExposurePointOfInterestSupported { device.exposurePointOfInterest = devicePoint }
            if device.isExposureModeSupported(exposureMode) { device.exposureMode = exposureMode }
            device.setExposureTargetBias(0, completionHandler: nil)
        }
    }

    /// Belichtungskorrektur in EV, wird auf den vom Gerät unterstützten Bereich begrenzt.
    func setExposureBias(_ bias: Float) {
        sessionQueue.async {
            guard let device = self.device, (try? device.lockForConfiguration()) != nil else { return }
            defer { device.unlockForConfiguration() }
            let clamped = min(max(bias, device.minExposureTargetBias), device.maxExposureTargetBias)
            device.setExposureTargetBias(clamped, completionHandler: nil)
        }
    }

    // MARK: Aufnahme

    /// Nimmt ein Foto auf und liefert die (noch farbigen) Bilddaten. Sie existieren nur im Arbeitsspeicher.
    func capturePhoto() async throws -> Data {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Data, Error>) in
            sessionQueue.async {
                guard self.session.isRunning else {
                    continuation.resume(throwing: CameraError.notRunning)
                    return
                }
                let settings: AVCapturePhotoSettings
                if self.photoOutput.availablePhotoCodecTypes.contains(.hevc) {
                    settings = AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.hevc])
                } else {
                    settings = AVCapturePhotoSettings()
                }
                settings.maxPhotoDimensions = self.photoOutput.maxPhotoDimensions
                settings.photoQualityPrioritization = .balanced
                settings.flashMode = .off

                // Foto aufrecht zur Horizontlage aufnehmen (Hoch- oder Querformat).
                if let connection = self.photoOutput.connection(with: .video),
                   let angle = self.rotationCoordinator?.videoRotationAngleForHorizonLevelCapture,
                   connection.isVideoRotationAngleSupported(angle) {
                    connection.videoRotationAngle = angle
                }

                let id = settings.uniqueID
                let delegate = PhotoCaptureDelegate { [weak self] result in
                    self?.sessionQueue.async { self?.inFlightCaptures[id] = nil }
                    continuation.resume(with: result)
                }
                self.inFlightCaptures[id] = delegate
                self.photoOutput.capturePhoto(with: settings, delegate: delegate)
            }
        }
    }
}

// MARK: - Live-Bilder

extension CameraService: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        onPreviewFrame?(CIImage(cvPixelBuffer: pixelBuffer))
    }
}

// MARK: - Foto-Delegate

private final class PhotoCaptureDelegate: NSObject, AVCapturePhotoCaptureDelegate {
    private let completion: (Result<Data, Error>) -> Void
    private var didComplete = false

    init(completion: @escaping (Result<Data, Error>) -> Void) {
        self.completion = completion
    }

    private func finish(_ result: Result<Data, Error>) {
        guard !didComplete else { return }
        didComplete = true
        completion(result)
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error {
            finish(.failure(error))
        } else if let data = photo.fileDataRepresentation() {
            finish(.success(data))
        } else {
            finish(.failure(CameraService.CameraError.noImageData))
        }
    }

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishCaptureFor resolvedSettings: AVCaptureResolvedPhotoSettings, error: Error?) {
        finish(.failure(error ?? CameraService.CameraError.noImageData))
    }
}
