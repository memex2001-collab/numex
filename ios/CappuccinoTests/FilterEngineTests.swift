import CoreImage
import XCTest
@testable import Cappuccino

/// Rendert einzelne Farbpixel durch die echte Core-Image-Pipeline (läuft im Simulator).
final class FilterEngineTests: XCTestCase {
    private let context = CIContext()
    private let linear = CGColorSpace(name: CGColorSpace.linearSRGB)!

    private func render(_ filter: MonoFilter, red: CGFloat, green: CGFloat, blue: CGFloat) -> [Float] {
        let input = CIImage(color: CIColor(red: red, green: green, blue: blue))
            .cropped(to: CGRect(x: 0, y: 0, width: 1, height: 1))
        let output = FilterEngine.apply(filter, to: input)
        var pixel = [Float](repeating: 0, count: 4)
        context.render(output, toBitmap: &pixel, rowBytes: 16,
                       bounds: CGRect(x: 0, y: 0, width: 1, height: 1), format: .RGBAf, colorSpace: linear)
        return pixel
    }

    func testEveryFilterProducesNeutralGray() {
        for filter in MonoFilter.all {
            for color in [(1.0, 0.0, 0.0), (0.0, 1.0, 0.0), (0.0, 0.0, 1.0), (0.8, 0.5, 0.3)] {
                let p = render(filter, red: color.0, green: color.1, blue: color.2)
                XCTAssertEqual(p[0], p[1], accuracy: 0.002, filter.name)
                XCTAssertEqual(p[1], p[2], accuracy: 0.002, filter.name)
            }
        }
    }

    func testNeutralUsesLuminanceWeights() {
        XCTAssertEqual(render(.neutral, red: 1, green: 0, blue: 0)[0], 0.2126, accuracy: 0.01)
        XCTAssertEqual(render(.neutral, red: 0, green: 1, blue: 0)[0], 0.7152, accuracy: 0.01)
    }

    func testRedFilterBrightensRedAndDarkensBlue() {
        XCTAssertGreaterThan(render(.red, red: 1, green: 0, blue: 0)[0], render(.neutral, red: 1, green: 0, blue: 0)[0])
        XCTAssertLessThan(render(.red, red: 0, green: 0, blue: 1)[0], render(.neutral, red: 0, green: 0, blue: 1)[0])
    }

    func testWhiteStaysWhiteAndBlackStaysBlack() {
        for filter in MonoFilter.all where filter.grain == 0 && filter.id != "soft" {
            XCTAssertEqual(render(filter, red: 1, green: 1, blue: 1)[0], 1, accuracy: 0.01, filter.name)
            XCTAssertEqual(render(filter, red: 0, green: 0, blue: 0)[0], 0, accuracy: 0.01, filter.name)
        }
    }
}
