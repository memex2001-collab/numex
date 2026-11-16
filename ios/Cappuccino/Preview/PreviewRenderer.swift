import CoreImage
import Metal
import MetalKit

/// Rendert die Kamerabilder mit dem aktiven Filter in eine `MTKView` (GPU, ohne CPU-Kopien).
final class PreviewRenderer: NSObject, MTKViewDelegate, @unchecked Sendable {
    let device: MTLDevice
    /// Aktiver Filter. Nur auf dem Main Thread setzen – `MTKView` zeichnet ebenfalls dort.
    var filter: MonoFilter

    private let commandQueue: MTLCommandQueue
    private let context: CIContext
    private let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
    private let lock = NSLock()
    private var pendingFrame: CIImage?

    init?(filter: MonoFilter) {
        guard let device = MTLCreateSystemDefaultDevice(), let queue = device.makeCommandQueue() else { return nil }
        self.device = device
        self.commandQueue = queue
        self.context = CIContext(mtlCommandQueue: queue, options: [.cacheIntermediates: false])
        self.filter = filter
        super.init()
    }

    /// Von der Video-Queue aufgerufen; es wird immer nur das neueste Bild behalten.
    func enqueue(_ frame: CIImage) {
        lock.lock()
        pendingFrame = frame
        lock.unlock()
    }

    private func takePendingFrame() -> CIImage? {
        lock.lock()
        defer { lock.unlock() }
        let frame = pendingFrame
        pendingFrame = nil
        return frame
    }

    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    func draw(in view: MTKView) {
        guard let frame = takePendingFrame() else { return }
        let size = view.drawableSize
        guard size.width > 0, size.height > 0,
              let drawable = view.currentDrawable,
              let commandBuffer = commandQueue.makeCommandBuffer() else { return }

        // Erst auf Displaygröße skalieren (Aspect Fill), dann filtern – das spart Rechenzeit.
        let target = CGRect(origin: .zero, size: size)
        let scale = max(size.width / frame.extent.width, size.height / frame.extent.height)
        let scaled = frame.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
        let centered = scaled.transformed(by: CGAffineTransform(
            translationX: (size.width - scaled.extent.width) / 2 - scaled.extent.minX,
            y: (size.height - scaled.extent.height) / 2 - scaled.extent.minY))

        let offset = CGPoint(x: CGFloat.random(in: 0..<512).rounded(), y: CGFloat.random(in: 0..<512).rounded())
        let filtered = FilterEngine.apply(filter, to: centered.cropped(to: target), grainOffset: offset)
        let output = filtered.composited(over: CIImage(color: .black).cropped(to: target))

        let destination = CIRenderDestination(width: Int(size.width), height: Int(size.height),
                                              pixelFormat: view.colorPixelFormat,
                                              commandBuffer: commandBuffer) { drawable.texture }
        destination.colorSpace = colorSpace
        do {
            try context.startTask(toRender: output, to: destination)
        } catch {
            return
        }
        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}
