import { extractFields, type ExtractedFields } from './extractFields'
import { extractPdfText } from './extractPdfText'
import { convertHeicToJpeg, isHeic } from './heic'
import { ocrImage } from './ocr'

export interface ProcessedReceipt extends ExtractedFields {
  displayBlob: Blob
  rawText: string
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
}

/** Zet een geüpload bestand om naar een toonbare afbeelding + herkende tekst + voorgestelde velden. */
export async function processReceipt(file: File): Promise<ProcessedReceipt> {
  if (isPdf(file)) {
    const rawText = await extractPdfText(file)
    return { displayBlob: file, rawText, ...extractFields(rawText) }
  }

  const displayBlob = isHeic(file) ? await convertHeicToJpeg(file) : file
  const rawText = await ocrImage(displayBlob)
  return { displayBlob, rawText, ...extractFields(rawText) }
}
