import AVKit
import MetalKit
import SwiftUI

/// Der Live-Sucher. Lautstärketasten lösen ebenfalls aus (iOS 17.2+).
struct ViewfinderView: UIViewRepresentable {
    let renderer: PreviewRenderer
    let onHardwareShutter: () -> Void

    func makeUIView(context: Context) -> MTKView {
        let view = MTKView(frame: .zero, device: renderer.device)
        view.delegate = renderer
        view.framebufferOnly = false          // Core Image schreibt per Compute in die Textur
        view.colorPixelFormat = .bgra8Unorm
        view.preferredFramesPerSecond = 60
        view.enableSetNeedsDisplay = false
        view.isPaused = false
        view.autoResizeDrawable = true
        view.backgroundColor = .black
        view.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 1)
        view.isAccessibilityElement = false

        if #available(iOS 17.2, *) {
            let shutter = onHardwareShutter
            view.addInteraction(AVCaptureEventInteraction { event in
                if event.phase == .ended { shutter() }
            })
        }
        return view
    }

    func updateUIView(_ uiView: MTKView, context: Context) {}
}
