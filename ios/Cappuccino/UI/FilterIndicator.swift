import SwiftUI

/// Punkte für alle Filter plus Name des aktiven Filters. Blendet nach dem Wechsel wieder aus.
struct FilterIndicator: View {
    let filters: [MonoFilter]
    let selectedIndex: Int

    var body: some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                ForEach(filters.indices, id: \.self) { index in
                    let isSelected = index == selectedIndex
                    Circle()
                        .fill(.white.opacity(isSelected ? 1 : 0.35))
                        .frame(width: isSelected ? 7 : 5, height: isSelected ? 7 : 5)
                }
            }
            Text(filters[selectedIndex].name.uppercased())
                .font(.system(.subheadline, design: .monospaced).weight(.medium))
                .tracking(3)
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.black.opacity(0.35), in: Capsule())
        .accessibilityHidden(true)
    }
}
