import Foundation

/// Definition eines Schwarz-Weiß-Filters.
///
/// Ein Filter besteht aus drei Stufen, die nacheinander angewendet werden:
/// 1. **Kanalmischer** – gewichtet Rot, Grün und Blau (im linearen Farbraum) zu einem Grauwert.
///    So wirkt er wie ein optischer Farbfilter vor dem Objektiv bei analogem S/W-Film.
/// 2. **Tonkurve** – formt den Kontrast (im Gamma-kodierten sRGB-Raum).
/// 3. **Korn** – optionales, multiplikatives Filmkorn.
struct MonoFilter: Identifiable, Equatable, Sendable {
    let id: String
    let name: String
    /// Kanalgewichte, Summe = 1,0 (erhält die Gesamthelligkeit).
    let red: Double
    let green: Double
    let blue: Double
    /// Stützpunkte der Tonkurve: Ausgabewerte bei Eingabe 0, 0,25, 0,5, 0,75 und 1.
    let toneCurve: [Double]
    /// Kornstärke als relative Helligkeitsschwankung (0 = kein Korn, 0,15 = ±15 %).
    let grain: Double
    /// Vorberechnete Kurventabelle für `CIColorCurves` (Float-RGB-Tripel).
    let curveData: Data

    init(id: String, name: String, red: Double, green: Double, blue: Double, toneCurve: [Double], grain: Double = 0) {
        self.id = id
        self.name = name
        self.red = red
        self.green = green
        self.blue = blue
        self.toneCurve = toneCurve
        self.grain = grain
        let samples = ToneCurve.sample(toneCurve, count: ToneCurve.tableSize)
        let triplets = samples.flatMap { value -> [Float] in
            let v = Float(value)
            return [v, v, v]
        }
        self.curveData = triplets.withUnsafeBufferPointer { Data(buffer: $0) }
    }
}

// MARK: - Die acht Filter

extension MonoFilter {
    static let neutral = MonoFilter(id: "neutral", name: "Neutral",
                                    red: 0.2126, green: 0.7152, blue: 0.0722,
                                    toneCurve: ToneCurve.linear)
    static let yellow = MonoFilter(id: "yellow", name: "Gelb",
                                   red: 0.35, green: 0.55, blue: 0.10,
                                   toneCurve: ToneCurve.gentleS)
    static let orange = MonoFilter(id: "orange", name: "Orange",
                                   red: 0.50, green: 0.42, blue: 0.08,
                                   toneCurve: ToneCurve.s)
    static let red = MonoFilter(id: "red", name: "Rot",
                                red: 0.85, green: 0.15, blue: 0.00,
                                toneCurve: ToneCurve.strongS)
    static let green = MonoFilter(id: "green", name: "Grün",
                                  red: 0.15, green: 0.80, blue: 0.05,
                                  toneCurve: ToneCurve.gentleS)
    static let hard = MonoFilter(id: "hard", name: "Hart",
                                 red: 0.30, green: 0.60, blue: 0.10,
                                 toneCurve: ToneCurve.hard)
    static let soft = MonoFilter(id: "soft", name: "Weich",
                                 red: 0.25, green: 0.65, blue: 0.10,
                                 toneCurve: ToneCurve.soft)
    static let grainy = MonoFilter(id: "grain", name: "Korn",
                                   red: 0.30, green: 0.60, blue: 0.10,
                                   toneCurve: ToneCurve.s, grain: 0.15)

    /// Reihenfolge, in der die Filter im Sucher durchgewischt werden.
    static let all: [MonoFilter] = [.neutral, .yellow, .orange, .red, .green, .hard, .soft, .grainy]
}

// MARK: - Tonkurven

enum ToneCurve {
    static let tableSize = 256

    static let linear: [Double]  = [0.00, 0.25, 0.50, 0.75, 1.00]
    static let gentleS: [Double] = [0.00, 0.22, 0.50, 0.78, 1.00]
    static let s: [Double]       = [0.00, 0.19, 0.50, 0.81, 1.00]
    static let strongS: [Double] = [0.00, 0.14, 0.50, 0.86, 1.00]
    /// Sehr steil, tiefe Schwarztöne.
    static let hard: [Double]    = [0.00, 0.06, 0.45, 0.92, 1.00]
    /// Flach, angehobene Schatten, gedämpfte Lichter.
    static let soft: [Double]    = [0.10, 0.32, 0.53, 0.74, 0.93]

    /// Tastet eine Kurve durch gleichmäßig verteilte Stützpunkte ab.
    ///
    /// Verwendet monotone kubische Hermite-Interpolation (Fritsch–Carlson): weich wie ein Spline,
    /// aber ohne Überschwingen – eine steigende Kurve bleibt steigend.
    static func sample(_ points: [Double], count: Int) -> [Double] {
        precondition(points.count >= 2 && count >= 2)
        let n = points.count
        let h = 1.0 / Double(n - 1)
        let delta = (0..<(n - 1)).map { (points[$0 + 1] - points[$0]) / h }

        var m = [Double](repeating: 0, count: n)
        m[0] = delta[0]
        m[n - 1] = delta[n - 2]
        for i in 1..<(n - 1) {
            m[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2
        }
        for i in 0..<(n - 1) {
            if delta[i] == 0 {
                m[i] = 0
                m[i + 1] = 0
                continue
            }
            let a = m[i] / delta[i]
            let b = m[i + 1] / delta[i]
            let s = a * a + b * b
            if s > 9 {
                let t = 3 / s.squareRoot()
                m[i] = t * a * delta[i]
                m[i + 1] = t * b * delta[i]
            }
        }

        return (0..<count).map { k in
            let x = Double(k) / Double(count - 1)
            let i = min(Int(x / h), n - 2)
            let t = (x - Double(i) * h) / h
            let t2 = t * t, t3 = t2 * t
            let h00 = 2 * t3 - 3 * t2 + 1
            let h10 = t3 - 2 * t2 + t
            let h01 = -2 * t3 + 3 * t2
            let h11 = t3 - t2
            let y = h00 * points[i] + h10 * h * m[i] + h01 * points[i + 1] + h11 * h * m[i + 1]
            return min(max(y, 0), 1)
        }
    }
}
