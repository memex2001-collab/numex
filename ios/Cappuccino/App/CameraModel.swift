import Observation
import SwiftUI
import UIKit

/// Zustand und Abläufe des einen Bildschirms.
@MainActor
@Observable
final class CameraModel {
    enum State: Equatable {
        case starting, running, cameraDenied, failed(String)
    }

    private enum Keys {
        static let filter = "selectedFilterID"
        static let aspect = "selectedAspectRatio"
    }

    let filters = MonoFilter.all
    let renderer: PreviewRenderer?

    private(set) var state: State = .starting
    private(set) var filterIndex: Int
    private(set) var aspect: AspectRatio
    private(set) var isIndicatorVisible = false
    private(set) var shutterCount = 0
    private(set) var exposureBias: Float = 0
    /// Fokuspunkt, normiert im Sucher (0…1, oben links).
    private(set) var focusPoint: CGPoint?
    private(set) var isFocusLocked = false
    private(set) var message: String?
    /// Drehung der Beschriftungen, wenn das iPhone quer gehalten wird.
    private(set) var interfaceRotation: Angle = .zero

    private let camera = CameraService()
    @ObservationIgnored private var indicatorTask: Task<Void, Never>?
    @ObservationIgnored private var focusTask: Task<Void, Never>?
    @ObservationIgnored private var messageTask: Task<Void, Never>?

    var currentFilter: MonoFilter { filters[filterIndex] }

    init() {
        let defaults = UserDefaults.standard
        let index = MonoFilter.all.firstIndex { $0.id == defaults.string(forKey: Keys.filter) } ?? 0
        filterIndex = index
        aspect = AspectRatio(rawValue: defaults.string(forKey: Keys.aspect) ?? "") ?? .standard
        renderer = PreviewRenderer(filter: MonoFilter.all[index])
    }

    // MARK: Start

    func start() async {
        guard state == .starting else { return }
        observeOrientation()
        guard await CameraService.requestAccess() else {
            state = .cameraDenied
            return
        }
        if let renderer {
            camera.onPreviewFrame = { @Sendable frame in renderer.enqueue(frame) }
        }
        do {
            try await camera.start()
            state = .running
            showIndicator()
        } catch {
            state = .failed("Die Kamera konnte nicht gestartet werden.")
        }
    }

    // MARK: Filter & Format

    func nextFilter() { selectFilter(at: (filterIndex + 1) % filters.count) }
    func previousFilter() { selectFilter(at: (filterIndex - 1 + filters.count) % filters.count) }

    func selectFilter(at index: Int) {
        guard filters.indices.contains(index) else { return }
        filterIndex = index
        renderer?.filter = filters[index]
        UserDefaults.standard.set(filters[index].id, forKey: Keys.filter)
        showIndicator()
    }

    func toggleAspect() {
        aspect = aspect.toggled
        UserDefaults.standard.set(aspect.rawValue, forKey: Keys.aspect)
    }

    private func showIndicator() {
        isIndicatorVisible = true
        indicatorTask?.cancel()
        indicatorTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(1.5))
            guard !Task.isCancelled else { return }
            self?.isIndicatorVisible = false
        }
    }

    // MARK: Fokus & Belichtung

    func focus(at point: CGPoint, lock: Bool = false) {
        guard state == .running else { return }
        focusPoint = point
        isFocusLocked = lock
        exposureBias = 0
        camera.focus(at: CameraGeometry.devicePoint(fromViewPoint: point), lock: lock)
        scheduleFocusMarkerHide()
    }

    func lockFocus() {
        focus(at: focusPoint ?? CGPoint(x: 0.5, y: 0.5), lock: true)
    }

    func setExposureBias(_ bias: Float) {
        guard state == .running else { return }
        exposureBias = min(max(bias, -2), 2)
        if focusPoint == nil { focusPoint = CGPoint(x: 0.5, y: 0.5) }
        camera.setExposureBias(exposureBias)
        scheduleFocusMarkerHide()
    }

    private func scheduleFocusMarkerHide() {
        focusTask?.cancel()
        guard !isFocusLocked else { return }
        focusTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(1.5))
            guard !Task.isCancelled else { return }
            self?.focusPoint = nil
        }
    }

    // MARK: Aufnahme

    func capture() {
        guard state == .running else { return }
        shutterCount += 1
        let filter = currentFilter
        let aspect = aspect
        Task {
            do {
                let raw = try await camera.capturePhoto()
                guard await PhotoLibrary.requestAddAccess() else {
                    show("Kein Zugriff auf Fotos – bitte in den Einstellungen erlauben.")
                    return
                }
                let developed = try await Task.detached(priority: .userInitiated) {
                    try PhotoProcessor.develop(raw, filter: filter, aspect: aspect)
                }.value
                try await PhotoLibrary.save(developed)
            } catch {
                show("Das Foto konnte nicht gespeichert werden.")
            }
        }
    }

    private func show(_ text: String) {
        message = text
        messageTask?.cancel()
        messageTask = Task { [weak self] in
            try? await Task.sleep(for: .seconds(3))
            guard !Task.isCancelled else { return }
            self?.message = nil
        }
    }

    // MARK: Ausrichtung

    private func observeOrientation() {
        UIDevice.current.beginGeneratingDeviceOrientationNotifications()
        updateRotation()
        Task { [weak self] in
            for await _ in NotificationCenter.default.notifications(named: UIDevice.orientationDidChangeNotification) {
                self?.updateRotation()
            }
        }
    }

    private func updateRotation() {
        switch UIDevice.current.orientation {
        case .portrait: interfaceRotation = .degrees(0)
        case .landscapeLeft: interfaceRotation = .degrees(90)
        case .landscapeRight: interfaceRotation = .degrees(-90)
        default: break
        }
    }
}
