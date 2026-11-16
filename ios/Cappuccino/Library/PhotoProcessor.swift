import CoreImage
import ImageIO

/// „Entwickelt“ ein aufgenommenes Foto: zuschneiden, Filter anwenden, als Graustufen-HEIC kodieren.
/// Die Farbdaten werden danach verworfen.
enum PhotoProcessor {
    enum ProcessingError: Error { case unreadable, encodingFailed }

    private static let context = CIContext(options: [.cacheIntermediates: false])
    private static let gray = CGColorSpace(name: CGColorSpace.genericGrayGamma2_2)!
    private static let srgb = CGColorSpace(name: CGColorSpace.sRGB)!

    static func develop(_ data: Data, filter: MonoFilter, aspect: AspectRatio) throws -> Data {
        guard let source = CIImage(data: data, options: [.applyOrientationProperty: true]) else {
            throw ProcessingError.unreadable
        }

        // Zuschnitt vor dem Filter: nur die Pixel verarbeiten, die auch gespeichert werden.
        let cropped = source.cropped(to: aspect.cropRect(in: source.extent))
        let origin = cropped.extent.origin
        let normalized = cropped.transformed(by: CGAffineTransform(translationX: -origin.x, y: -origin.y))

        let developed = FilterEngine.apply(filter, to: normalized)
        let output = developed.settingProperties(
            metadata(from: source.properties, filter: filter, aspect: aspect, size: developed.extent.size))

        let quality = CIImageRepresentationOption(rawValue: kCGImageDestinationLossyCompressionQuality as String)
        let options: [CIImageRepresentationOption: Any] = [quality: 0.9]

        // Bevorzugt echtes Graustufen-HEIC; Fallbacks, falls das Gerät das nicht kodieren kann.
        if let heic = context.heifRepresentation(of: output, format: .L8, colorSpace: gray, options: options) {
            return heic
        }
        if let heic = context.heifRepresentation(of: output, format: .RGBA8, colorSpace: gray, options: options) {
            return heic
        }
        if let heic = context.heifRepresentation(of: output, format: .RGBA8, colorSpace: srgb, options: options) {
            return heic
        }
        throw ProcessingError.encodingFailed
    }

    /// Übernimmt Belichtungsdaten, entfernt Ortsdaten und vermerkt Filter und Format.
    static func metadata(from original: [String: Any], filter: MonoFilter, aspect: AspectRatio, size: CGSize) -> [String: Any] {
        var properties = original
        // Die Ausrichtung wurde bereits in die Pixel übernommen.
        properties[kCGImagePropertyOrientation as String] = 1
        for key in [kCGImagePropertyGPSDictionary, kCGImagePropertyMakerAppleDictionary,
                    kCGImagePropertyPixelWidth, kCGImagePropertyPixelHeight,
                    kCGImagePropertyColorModel, kCGImagePropertyProfileName, kCGImagePropertyDepth] {
            properties.removeValue(forKey: key as String)
        }

        var tiff = properties[kCGImagePropertyTIFFDictionary as String] as? [String: Any] ?? [:]
        tiff[kCGImagePropertyTIFFOrientation as String] = 1
        tiff[kCGImagePropertyTIFFSoftware as String] = "Cappuccino"
        properties[kCGImagePropertyTIFFDictionary as String] = tiff

        var exif = properties[kCGImagePropertyExifDictionary as String] as? [String: Any] ?? [:]
        exif[kCGImagePropertyExifUserComment as String] = "Cappuccino · \(filter.name) · \(aspect.label)"
        exif[kCGImagePropertyExifPixelXDimension as String] = Int(size.width)
        exif[kCGImagePropertyExifPixelYDimension as String] = Int(size.height)
        properties[kCGImagePropertyExifDictionary as String] = exif

        return properties
    }
}
