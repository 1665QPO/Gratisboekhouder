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
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })
  return { headers: result.meta.fields ?? [], rows: result.data }
}

async function parseXlsx(file: File): Promise<ParsedFile> {
  const rows = await readSheet(file)
  const [headerRow, ...dataRows] = rows
  const headers = (headerRow ?? []).map((h) => String(h ?? '').trim())

  const objectRows = dataRows
    .filter((row) => row.some((cell) => cell !== null && String(cell).trim() !== ''))
    .map((row) => {
      const obj: Record<string, unknown> = {}
      headers.forEach((header, i) => {
        obj[header] = row[i]
      })
      return obj
    })

  return { headers, rows: objectRows }
}
