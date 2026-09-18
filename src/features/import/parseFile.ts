import Papa from 'papaparse'
import { readSheet } from 'read-excel-file/browser'

export interface ParsedFile {
  headers: string[]
  rows: Record<string, unknown>[]
}

export async function parseImportFile(file: File): Promise<ParsedFile> {
  if (/\.xlsx$/i.test(file.name)) return parseXlsx(file)
  return parseCsv(file)
}

async function parseCsv(file: File): Promise<ParsedFile> {
  const text = await file.text()
  const result = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true })
  // Bank-CSV's hebben vrijwel altijd een koppenrij; we vertrouwen daarop, maar herstellen wel
  // lege of dubbele koppen zodat geen enkele kolom stilletjes een andere overschrijft.
  const [headerRow, ...dataRows] = result.data
  const headers = dedupeHeaders((headerRow ?? []).map((h, i) => cellLabel(h, i)))
  return { headers, rows: toObjectRows(headers, dataRows) }
}

async function parseXlsx(file: File): Promise<ParsedFile> {
  const rawRows = await readSheet(file)
  return rowsToParsedFile(rawRows)
}

/**
 * Zet ruwe (getypeerde) rijen om naar headers + objectrijen. Losstaand van het inlezen van het
 * bestand zelf, zodat dit puur getest kan worden op de lastige gevallen: lege rijen ertussen, en
 * bestanden zonder koppenrij (bijv. een eigen bijhoudlijstje dat direct met data begint).
 */
export function rowsToParsedFile(rawRows: unknown[][]): ParsedFile {
  const nonEmptyRows = rawRows.filter((row) => row.some((cell) => !isBlankCell(cell)))
  if (nonEmptyRows.length === 0) return { headers: [], rows: [] }

  const [firstRow, ...rest] = nonEmptyRows
  // Een bestand zonder koppenrij begint direct met data: dat herken je eraan dat de eerste rij
  // al getallen/datums bevat, niet alleen tekstlabels.
  const hasHeaderRow = looksLikeHeaderRow(firstRow)
  const headerRow = hasHeaderRow ? firstRow : []
  const dataRows = hasHeaderRow ? rest : nonEmptyRows

  const headers = dedupeHeaders(firstRow.map((_, i) => cellLabel(headerRow[i], i)))
  return { headers, rows: toObjectRows(headers, dataRows) }
}

function toObjectRows(headers: string[], rows: unknown[][]): Record<string, unknown>[] {
  return rows
    .filter((row) => row.some((cell) => !isBlankCell(cell)))
    .map((row) => {
      const obj: Record<string, unknown> = {}
      headers.forEach((header, i) => {
        obj[header] = row[i]
      })
      return obj
    })
}

function isBlankCell(cell: unknown): boolean {
  return cell === null || cell === undefined || String(cell).trim() === ''
}

function looksLikeHeaderRow(row: unknown[]): boolean {
  const hasTextLabel = row.some((cell) => typeof cell === 'string' && cell.trim() !== '')
  const hasTypedValue = row.some((cell) => typeof cell === 'number' || cell instanceof Date)
  return hasTextLabel && !hasTypedValue
}

/** Spreadsheet-stijl kolomletters (A, B, ... Z, AA, AB, ...) als vervanging voor een lege kop. */
function columnLabel(index: number): string {
  let n = index
  let label = ''
  do {
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return `Kolom ${label}`
}

function cellLabel(cell: unknown, index: number): string {
  const trimmed = isBlankCell(cell) ? '' : String(cell).trim()
  return trimmed || columnLabel(index)
}

function dedupeHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>()
  return headers.map((header) => {
    const count = seen.get(header) ?? 0
    seen.set(header, count + 1)
    return count === 0 ? header : `${header} (${count + 1})`
  })
}
