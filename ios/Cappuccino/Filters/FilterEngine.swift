import CoreImage
import CoreImage.CIFilterBuiltins

/// Wendet einen `MonoFilter` auf ein Bild an.
///
/// Dieselbe Funktion wird für die Live-Vorschau und für das gespeicherte Foto verwendet –
/// so entspricht das Ergebnis exakt dem, was der Sucher zeigt. Core Image fasst die
/// einzelnen Schritte zu einem GPU-Durchlauf zusammen.
enum FilterEngine {
    private static let curveColorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
    private static let noise = CIFilter.randomGenerator().outputImage!

    /// - Parameters:
    ///   - grainOffset: Verschiebt das Kornmuster. In der Vorschau pro Bild zufällig, damit das Korn „lebt“.
    static func apply(_ filter: MonoFilter, to image: CIImage, grainOffset: CGPoint = .zero) -> CIImage {
        let extent = image.extent

        // 1. Kanalmischer: R = G = B = gewichtete Summe. Der Arbeitsfarbraum von Core Image ist linear,
        //    die Mischung verhält sich daher wie ein echter optischer Farbfilter.
        let weights = CIVector(x: filter.red, y: filter.green, z: filter.blue, w: 0)
        let mixer = CIFilter.colorMatrix()
        mixer.inputImage = image
        mixer.rVector = weights
        mixer.gVector = weights
        mixer.bVector = weights
        mixer.aVector = CIVector(x: 0, y: 0, z: 0, w: 1)
        mixer.biasVector = CIVector(x: 0, y: 0, z: 0, w: 0)
        var output = mixer.outputImage ?? image

        // 2. Tonkurve im Gamma-kodierten sRGB-Raum (dort sind Kontrastkurven intuitiv).
        if let curves = CIFilter(name: "CIColorCurves", parameters: [
            kCIInputImageKey: output,
            "inputCurvesData": filter.curveData,
            "inputCurvesDomain": CIVector(x: 0, y: 1),
            "inputColorSpace": curveColorSpace,
        ]), let curved = curves.outputImage {
            output = curved
        }

        // 3. Korn: Helligkeit wird mit (1 ± grain) multipliziert – Grau bleibt Grau.
        if filter.grain > 0 {
            output = addGrain(to: output, amount: filter.grain, extent: extent, offset: grainOffset)
        }

        return output.cropped(to: extent)
    }

    private static func addGrain(to image: CIImage, amount: Double, extent: CGRect, offset: CGPoint) -> CIImage {
        // Korngröße relativ zur Bildgröße, damit Vorschau und Foto gleich wirken.
        let grainSize = max(extent.width, extent.height) / 2000
        let scaled = noise
            .transformed(by: CGAffineTransform(translationX: offset.x, y: offset.y))
            .transformed(by: CGAffineTransform(scaleX: grainSize, y: grainSize))

        // Rauschen n ∈ [0, 1] → Faktor 1 + amount · (2n − 1)
        let factor = CIFilter.colorMatrix()
        factor.inputImage = scaled
        let s = CIVector(x: 2 * amount, y: 0, z: 0, w: 0)
        factor.rVector = s
        factor.gVector = s
        factor.bVector = s
        factor.aVector = CIVector(x: 0, y: 0, z: 0, w: 0)
        factor.biasVector = CIVector(x: 1 - amount, y: 1 - amount, z: 1 - amount, w: 1)
        guard let grain = factor.outputImage?.cropped(to: extent) else { return image }

        let multiply = CIFilter.multiplyCompositing()
        multiply.inputImage = grain
        multiply.backgroundImage = image
        return multiply.outputImage ?? image
    }
}
