import SwiftUI

/// Kleines Label oben: „4:3“ oder „1:1“. Tippen schaltet um.
struct FormatToggle: View {
    let aspect: AspectRatio
    let rotation: Angle
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(aspect.label)
                .font(.system(.subheadline, design: .monospaced).weight(.medium))
                .tracking(2)
                .foregroundStyle(.white.opacity(0.85))
                .frame(width: 64, height: 44)
                .contentShape(Rectangle())
                .rotationEffect(rotation)
                .animation(.easeInOut(duration: 0.25), value: rotation)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Format")
        .accessibilityValue(aspect.spokenLabel)
        .accessibilityHint("Wechselt zwischen 4 zu 3 und quadratisch.")
    }
}
