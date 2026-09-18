export function isHeic(file: File): boolean {
  return (
    /\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif'
  )
}

/** iPhone-foto's zijn vaak HEIC — geen browser kan dat native tonen of OCR'en, dus eerst omzetten. */
export async function convertHeicToJpeg(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default
  const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 })
  return Array.isArray(result) ? result[0] : result
}
