/** Zet een UTC-Date om naar een ISO-datumstring (yyyy-mm-dd) zonder tijdzone-verschuiving. */
function toIso(date: Date): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const EXCEL_EPOCH_UTC_MS = Date.UTC(1899, 11, 30)

/**
 * Parseert een datum uit een bank- of Excel-export naar ISO (yyyy-mm-dd).
 * Ondersteunt: ISO, dd-mm-jjjj / dd/mm/jjjj / dd.mm.jjjj, jjjjmmdd (ING-stijl),
 * Excel-serienummers, en Date-objecten (zoals read-excel-file die teruggeeft).
 */
export function parseDate(raw: string | number | Date): string {
  if (raw instanceof Date) return toIso(raw)

  if (typeof raw === 'number') {
    if (raw >= 10_000_000) return parseDate(String(raw))
    return toIso(new Date(EXCEL_EPOCH_UTC_MS + raw * 86_400_000))
  }

  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d{8}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`

  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (dmy) {
    const [, d, m, y] = dmy
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return toIso(parsed)

  throw new Error(`Kan datum niet interpreteren: "${raw}"`)
}
