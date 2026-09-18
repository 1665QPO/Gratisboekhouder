import { parseAmount } from '../../lib/currency'

export interface ColumnMapping {
  date: string | null
  description: string | null
  amount: string | null
  counterparty: string | null
  /** Optionele kolom met 'Af'/'Bij', 'Debit'/'Credit' e.d. — nodig als het bedrag zelf geen teken heeft. */
  debitCreditIndicator: string | null
}

export const EMPTY_MAPPING: ColumnMapping = {
  date: null,
  description: null,
  amount: null,
  counterparty: null,
  debitCreditIndicator: null,
}

const KEYWORDS: Record<Exclude<keyof ColumnMapping, 'amount'>, string[]> = {
  date: ['datum', 'date', 'transactiedatum', 'boekdatum'],
  description: ['omschrijving', 'naam / omschrijving', 'mededeling', 'description', 'toelichting'],
  counterparty: ['naam tegenpartij', 'tegenrekening', 'tegenpartij', 'counterparty', 'iban'],
  debitCreditIndicator: ['af bij', 'af/bij', 'debit/credit', 'bij/af'],
}

const AMOUNT_KEYWORDS = ['bedrag (eur)', 'bedrag', 'amount', 'totaal', 'total']

/** " ex "/" ex."/"excl" als afzonderlijk woord/afkorting, niet als toevallige deelstring. */
function mentionsExclBtw(header: string): boolean {
  const padded = ` ${header.toLowerCase()} `
  return padded.includes('excl') || padded.includes(' ex ') || padded.includes(' ex.')
}

function mentionsInclBtw(header: string): boolean {
  const padded = ` ${header.toLowerCase()} `
  return padded.includes('incl') || padded.includes(' in ') || padded.includes(' in.')
}

/**
 * Als een bestand zowel een excl.- als incl.-btw-bedragkolom heeft, willen we altijd de incl.-kolom
 * (deze app rekent met het brutobedrag) — anders komt elk bedrag stilzwijgend te laag te staan.
 */
function guessAmountColumn(headers: string[], used: Set<string>): string | null {
  const candidates = headers.filter(
    (h) => !used.has(h) && AMOUNT_KEYWORDS.some((k) => h.toLowerCase().includes(k)),
  )
  if (candidates.length === 0) return null
  return (
    candidates.find(mentionsInclBtw) ?? candidates.find((h) => !mentionsExclBtw(h)) ?? candidates[0]
  )
}

/** Stelt op basis van kolomnamen een mapping voor. De gebruiker bevestigt/corrigeert dit altijd zelf. */
export function guessColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = { ...EMPTY_MAPPING }
  const used = new Set<string>()

  for (const field of Object.keys(KEYWORDS) as (keyof typeof KEYWORDS)[]) {
    const keywords = KEYWORDS[field]
    const exact = headers.find((h) => !used.has(h) && keywords.includes(h.toLowerCase().trim()))
    const partial = headers.find(
      (h) => !used.has(h) && keywords.some((k) => h.toLowerCase().includes(k)),
    )
    const match = exact ?? partial
    if (match) {
      mapping[field] = match
      used.add(match)
    }
  }

  const amountMatch = guessAmountColumn(headers, used)
  if (amountMatch) mapping.amount = amountMatch

  return mapping
}

export function isMappingComplete(mapping: ColumnMapping): boolean {
  return Boolean(mapping.date && mapping.description && mapping.amount)
}

const DEBIT_VALUES = new Set(['af', 'debit', 'd', '-'])
const CREDIT_VALUES = new Set(['bij', 'credit', 'c', '+'])

/** Bepaalt het getekende bedrag: gebruikt de indicatorkolom als die er is, anders het teken van het bedrag zelf. */
export function resolveSignedAmount(rawAmount: unknown, rawIndicator: unknown): number {
  const parsed = parseAmount(String(rawAmount ?? ''))
  if (rawIndicator == null || rawIndicator === '') return parsed

  const indicator = String(rawIndicator).trim().toLowerCase()
  const magnitude = Math.abs(parsed)
  if (DEBIT_VALUES.has(indicator)) return -magnitude
  if (CREDIT_VALUES.has(indicator)) return magnitude
  return parsed
}
