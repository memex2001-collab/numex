import SwiftUI
import UIKit

/// Der einzige Bildschirm der App: Format oben, Sucher, Auslöser.
struct CameraScreen: View {
    @State private var model = CameraModel()
    @State private var flashOpacity = 0.0
    @State private var dragStartBias: Float?
    @AppStorage("didLearnFilterSwipe") private var didLearnFilterSwipe = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            switch model.state {
            case .cameraDenied:
                PermissionView()
            case .failed(let text):
                Text(text).font(.callout).foregroundStyle(.white).padding(32)
            case .starting, .running:
                cameraLayout
            }
        }
        .statusBarHidden()
        .persistentSystemOverlays(.hidden)
        .preferredColorScheme(.dark)
        .task { await model.start() }
        .sensoryFeedback(.selection, trigger: model.filterIndex)
        .sensoryFeedback(.selection, trigger: model.aspect)
        .sensoryFeedback(.impact(weight: .medium), trigger: model.shutterCount)
        .onChange(of: model.shutterCount) { playShutterAnimation() }
    }

    private var cameraLayout: some View {
        VStack(spacing: 0) {
            FormatToggle(aspect: model.aspect, rotation: model.interfaceRotation, action: { model.toggleAspect() })
                .frame(height: 52)

            viewfinder
                .aspectRatio(3.0 / 4.0, contentMode: .fit)

            ShutterButton { model.capture() }
                .frame(maxHeight: .infinity)
        }
    }

    private var viewfinder: some View {
        GeometryReader { geo in
            let size = geo.size
            ZStack {
                if let renderer = model.renderer {
                    ViewfinderView(renderer: renderer, onHardwareShutter: { model.capture() })
                } else {
                    Color.black
                }

                SquareMask(barHeight: model.aspect == .square ? (size.height - size.width) / 2 : 0)
                    .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: model.aspect)

                if let point = model.focusPoint {
                    FocusMarker(isLocked: model.isFocusLocked, exposureBias: model.exposureBias)
                        .position(x: point.x * size.width, y: point.y * size.height)
                        .transition(.opacity)
                }

                overlays

                Color.black.opacity(flashOpacity).allowsHitTesting(false)
            }
            .clipped()
            .contentShape(Rectangle())
            .onTapGesture(coordinateSpace: .local) { location in
                model.focus(at: CGPoint(x: location.x / size.width, y: location.y / size.height))
            }
            .onLongPressGesture(minimumDuration: 0.6) { model.lockFocus() }
            .gesture(swipeAndExposure)
            .accessibilityElement()
            .accessibilityLabel("Sucher")
            .accessibilityValue("Filter \(model.currentFilter.name), \(model.filterIndex + 1) von \(model.filters.count), Format \(model.aspect.spokenLabel)")
            .accessibilityHint("Nach oben oder unten wischen, um den Filter zu wechseln.")
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: model.nextFilter()
                case .decrement: model.previousFilter()
                @unknown default: break
                }
            }
        }
    }

    private var overlays: some View {
        VStack(spacing: 12) {
            if let message = model.message {
                Text(message)
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 14).padding(.vertical, 8)
                    .background(.black.opacity(0.6), in: Capsule())
                    .padding(.top, 12)
            }
            Spacer()
            if !didLearnFilterSwipe && model.state == .running {
                Text("←  WISCHEN FÜR FILTER  →")
                    .font(.system(.caption, design: .monospaced))
                    .tracking(2)
                    .foregroundStyle(.white.opacity(0.8))
            }
            FilterIndicator(filters: model.filters, selectedIndex: model.filterIndex)
                .rotationEffect(model.interfaceRotation)
                .opacity(model.isIndicatorVisible ? 1 : 0)
                .animation(.easeInOut(duration: 0.3), value: model.isIndicatorVisible)
                .padding(.bottom, 16)
        }
        .animation(.easeInOut(duration: 0.3), value: model.message)
        .allowsHitTesting(false)
    }

    /// Waagerecht wischen = Filter wechseln, senkrecht ziehen = Belichtungskorrektur.
    private var swipeAndExposure: some Gesture {
        DragGesture(minimumDistance: 20)
            .onChanged { value in
                let t = value.translation
                guard dragStartBias != nil || abs(t.height) > abs(t.width) else { return }
                if dragStartBias == nil { dragStartBias = model.exposureBias }
                model.setExposureBias((dragStartBias ?? 0) - Float(t.height / 150))
            }
            .onEnded { value in
                let wasExposureDrag = dragStartBias != nil
                dragStartBias = nil
                let t = value.translation
                guard !wasExposureDrag, abs(t.width) > abs(t.height), abs(t.width) > 40 else { return }
                if t.width < 0 { model.nextFilter() } else { model.previousFilter() }
                didLearnFilterSwipe = true
            }
    }

    private func playShutterAnimation() {
        guard !reduceMotion else { return }
        withAnimation(.easeIn(duration: 0.05)) {
            flashOpacity = 1
        } completion: {
            withAnimation(.easeOut(duration: 0.2)) { flashOpacity = 0 }
        }
    }
}

// MARK: - Bausteine

/// Schwarze Balken oben und unten für das quadratische Format.
private struct SquareMask: View {
    let barHeight: CGFloat

    var body: some View {
        VStack(spacing: 0) {
            Color.black.frame(height: max(barHeight, 0))
            Spacer(minLength: 0)
            Color.black.frame(height: max(barHeight, 0))
        }
        .allowsHitTesting(false)
    }
}

private struct FocusMarker: View {
    let isLocked: Bool
    let exposureBias: Float

    var body: some View {
        ZStack {
            Rectangle()
                .stroke(.white, lineWidth: 1.5)
                .frame(width: 64, height: 64)
            if isLocked {
                Text("AE/AF-SPERRE")
                    .font(.system(.caption2, design: .monospaced))
                    .tracking(1)
                    .foregroundStyle(.white)
                    .offset(y: -48)
            }
            if exposureBias != 0 {
                Text(exposureBias.formatted(.number.precision(.fractionLength(1)).sign(strategy: .always())))
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.white)
                    .offset(x: 56)
            }
        }
        .allowsHitTesting(false)
        .accessibilityHidden(true)
    }
}

private struct PermissionView: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("KEIN KAMERAZUGRIFF")
                .font(.system(.headline, design: .monospaced))
                .tracking(3)
            Text("Cappuccino braucht die Kamera, um Schwarz-Weiß-Fotos aufzunehmen.")
                .font(.callout)
                .multilineTextAlignment(.center)
                .foregroundStyle(.white.opacity(0.7))
            Button("Einstellungen öffnen") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            .buttonStyle(.bordered)
            .tint(.white)
        }
        .foregroundStyle(.white)
        .padding(40)
    }
}
