import { parseAmount } from '../../lib/currency'
import { parseDate } from '../../lib/date'

export interface ExtractedFields {
  amount: number | null
  date: string | null
}

/**
 * Herkent alleen bedrag en datum uit ruwe (OCR- of PDF-)tekst. Betaalt zich niet uit om ook de
 * winkelnaam te raden: die staat op bonnen vaak als logo-afbeelding (dus niet als tekst) en is
 * niet betrouwbaar te herkennen — de gebruiker vult die zelf in.
 */
export function extractFields(rawText: string): ExtractedFields {
  return {
    amount: extractAmount(rawText),
    date: extractDate(rawText),
  }
}

// Een geldbedrag heeft altijd precies 2 decimalen; dat onderscheidt "28,13" van bijv. "3.5" of
// ordernummers als "4432457" (geen scheidingsteken) of datums (scheidingsteken is "-", niet ,/.).
const AMOUNT_PATTERN = /\d{1,3}(?:[.,]\d{3})*[.,]\d{2}/g

function extractAmount(text: string): number | null {
  const matches = text.match(AMOUNT_PATTERN) ?? []
  const amounts = matches.map((m) => parseAmount(m)).filter((n) => Number.isFinite(n) && n > 0)
  if (amounts.length === 0) return null
  // Het totaalbedrag is op een bon vrijwel altijd het grootste bedrag dat erop staat.
  return Math.max(...amounts)
}

const NUMERIC_DATE_PATTERN = /\b\d{1,2}[-/.]\d{1,2}[-/.]\d{4}\b/

const DUTCH_MONTHS: Record<string, string> = {
  januari: '01',
  februari: '02',
  maart: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  augustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  december: '12',
}

const WORDED_DATE_PATTERN = new RegExp(
  `\\b(\\d{1,2})\\s+(${Object.keys(DUTCH_MONTHS).join('|')})\\s+(\\d{4})\\b`,
  'i',
)

function extractDate(text: string): string | null {
  const numeric = text.match(NUMERIC_DATE_PATTERN)?.[0]
  if (numeric) {
    try {
      return parseDate(numeric)
    } catch {
      // val door naar de woordelijke datum-check hieronder
    }
  }

  const worded = text.match(WORDED_DATE_PATTERN)
  if (worded) {
    const [, day, monthName, year] = worded
    const month = DUTCH_MONTHS[monthName.toLowerCase()]
    return `${year}-${month}-${day.padStart(2, '0')}`
  }

  return null
}
