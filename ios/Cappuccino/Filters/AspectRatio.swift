import Foundation

/// Seitenverhältnis der Aufnahme. Die Wahl fällt – wie der Filter – vor dem Auslösen.
enum AspectRatio: String, CaseIterable, Sendable {
    case standard = "4:3"
    case square = "1:1"

    var label: String { rawValue }

    var spokenLabel: String {
        switch self {
        case .standard: return "4 zu 3"
        case .square: return "quadratisch"
        }
    }

    var toggled: AspectRatio { self == .standard ? .square : .standard }

    /// Mittiger Bildausschnitt für dieses Format innerhalb von `extent` (ganzzahlige Pixel).
    func cropRect(in extent: CGRect) -> CGRect {
        switch self {
        case .standard:
            return extent
        case .square:
            let side = min(extent.width, extent.height).rounded(.down)
            let x = extent.minX + ((extent.width - side) / 2).rounded(.down)
            let y = extent.minY + ((extent.height - side) / 2).rounded(.down)
            return CGRect(x: x, y: y, width: side, height: side)
        }
    }
}

enum CameraGeometry {
    /// Wandelt einen normierten Punkt im Hochformat-Sucher (0…1, Ursprung oben links) in den
    /// Koordinatenraum von `AVCaptureDevice` um (Querformat, Home-Taste rechts, Ursprung oben links).
    static func devicePoint(fromViewPoint p: CGPoint) -> CGPoint {
        CGPoint(x: clamp(p.y), y: clamp(1 - p.x))
    }

    private static func clamp(_ v: CGFloat) -> CGFloat { min(max(v, 0), 1) }
}
