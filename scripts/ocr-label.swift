import AppKit
import Foundation
import Vision

guard CommandLine.arguments.count >= 2 else {
    fputs("usage: swift scripts/ocr-label.swift <image> [--json]\n", stderr)
    exit(2)
}

let imagePath = CommandLine.arguments[1]
let outputsJSON = CommandLine.arguments.contains("--json")
guard let image = NSImage(contentsOfFile: imagePath),
      let imageData = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: imageData),
      let cgImage = bitmap.cgImage else {
    fputs("unable to load image: \(imagePath)\n", stderr)
    exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["ko-KR", "en-US"]
request.usesLanguageCorrection = true

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
do {
    try handler.perform([request])
} catch {
    fputs("OCR failed: \(error.localizedDescription)\n", stderr)
    exit(1)
}

let observations = (request.results ?? []).sorted { left, right in
    let verticalDifference = abs(left.boundingBox.midY - right.boundingBox.midY)
    if verticalDifference > 0.012 {
        return left.boundingBox.midY > right.boundingBox.midY
    }
    return left.boundingBox.minX < right.boundingBox.minX
}

if outputsJSON {
    let rows = observations.compactMap { observation -> [String: Any]? in
        guard let candidate = observation.topCandidates(1).first else { return nil }
        return [
            "text": candidate.string,
            "x": observation.boundingBox.minX,
            "y": observation.boundingBox.minY,
            "width": observation.boundingBox.width,
            "height": observation.boundingBox.height,
            "confidence": candidate.confidence,
        ]
    }
    let data = try JSONSerialization.data(withJSONObject: rows, options: [])
    print(String(decoding: data, as: UTF8.self))
} else {
    for observation in observations {
        if let candidate = observation.topCandidates(1).first {
            print(candidate.string)
        }
    }
}
