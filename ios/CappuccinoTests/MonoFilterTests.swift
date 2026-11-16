import XCTest
@testable import Cappuccino

final class MonoFilterTests: XCTestCase {
    func testEightFiltersWithUniqueIDs() {
        XCTAssertEqual(MonoFilter.all.count, 8)
        XCTAssertEqual(Set(MonoFilter.all.map(\.id)).count, 8)
    }

    func testChannelWeightsPreserveBrightness() {
        for filter in MonoFilter.all {
            XCTAssertEqual(filter.red + filter.green + filter.blue, 1, accuracy: 0.0001, filter.name)
        }
    }

    func testToneCurvesAreMonotonicAndInRange() {
        for filter in MonoFilter.all {
            let samples = ToneCurve.sample(filter.toneCurve, count: ToneCurve.tableSize)
            XCTAssertEqual(samples.count, ToneCurve.tableSize)
            XCTAssertTrue(samples.allSatisfy { (0...1).contains($0) }, filter.name)
            XCTAssertTrue(zip(samples, samples.dropFirst()).allSatisfy { $0 <= $1 + 1e-9 }, filter.name)
        }
    }

    func testLinearCurveIsIdentity() {
        let samples = ToneCurve.sample(ToneCurve.linear, count: 11)
        for (k, value) in samples.enumerated() {
            XCTAssertEqual(value, Double(k) / 10, accuracy: 1e-9)
        }
    }

    func testCurveDataHasRGBTripletsForEveryEntry() {
        let expectedBytes = ToneCurve.tableSize * 3 * MemoryLayout<Float>.size
        for filter in MonoFilter.all {
            XCTAssertEqual(filter.curveData.count, expectedBytes)
        }
    }
}

final class AspectRatioTests: XCTestCase {
    func testStandardKeepsFullFrame() {
        let extent = CGRect(x: 0, y: 0, width: 4032, height: 3024)
        XCTAssertEqual(AspectRatio.standard.cropRect(in: extent), extent)
    }

    func testSquareCropsCenterOfLandscapeImage() {
        let crop = AspectRatio.square.cropRect(in: CGRect(x: 0, y: 0, width: 4032, height: 3024))
        XCTAssertEqual(crop, CGRect(x: 504, y: 0, width: 3024, height: 3024))
    }

    func testSquareCropsCenterOfPortraitImage() {
        let crop = AspectRatio.square.cropRect(in: CGRect(x: 0, y: 0, width: 3024, height: 4032))
        XCTAssertEqual(crop, CGRect(x: 0, y: 504, width: 3024, height: 3024))
    }

    func testToggle() {
        XCTAssertEqual(AspectRatio.standard.toggled, .square)
        XCTAssertEqual(AspectRatio.square.toggled, .standard)
    }

    func testDevicePointMapping() {
        // Oben links im Hochformat entspricht oben rechts im Sensor-Querformat.
        XCTAssertEqual(CameraGeometry.devicePoint(fromViewPoint: CGPoint(x: 0, y: 0)), CGPoint(x: 0, y: 1))
        XCTAssertEqual(CameraGeometry.devicePoint(fromViewPoint: CGPoint(x: 0.5, y: 0.5)), CGPoint(x: 0.5, y: 0.5))
        XCTAssertEqual(CameraGeometry.devicePoint(fromViewPoint: CGPoint(x: 1, y: 0.25)), CGPoint(x: 0.25, y: 0))
    }
}
