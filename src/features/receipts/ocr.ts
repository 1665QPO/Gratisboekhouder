/** Herkent tekst in een foto, volledig lokaal in de browser (WASM) — er wordt geen foto verstuurd. */
export async function ocrImage(blob: Blob): Promise<string> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('nld')
  try {
    const {
      data: { text },
    } = await worker.recognize(blob)
    return text
  } finally {
    await worker.terminate()
  }
}
