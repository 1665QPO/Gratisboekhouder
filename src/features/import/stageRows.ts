import type { Transaction } from '../btw/types'
import { parseDate } from '../../lib/date'
import { createId } from '../../lib/id'
import { resolveSignedAmount, type ColumnMapping } from './columnMapping'
import { rowHash } from './dedupe'

export interface StagedRow {
  rowIndex: number
  date: string | null
  description: string
  counterparty?: string
  amountGross: number | null
  direction: 'in' | 'out'
  isDuplicate: boolean
  error: string | null
}

/**
 * Zet ruwe, nog-niet-getypeerde rijen om naar genormaliseerde rijen, met foutmelding en
 * dubbele-import-detectie. `directionOverride` negeert het teken van het bedrag volledig — handig
 * voor een eigen lijstje dat geen +/- gebruikt en bijvoorbeeld altijd alleen kosten bevat.
 */
export function stageRows(
  rows: Record<string, unknown>[],
  mapping: ColumnMapping,
  existingHashes: Set<string>,
  directionOverride?: 'in' | 'out',
): StagedRow[] {
  if (!mapping.date || !mapping.description || !mapping.amount) {
    throw new Error('Mapping is niet compleet')
  }
  const dateColumn = mapping.date
  const descriptionColumn = mapping.description
  const amountColumn = mapping.amount

  const seenInBatch = new Set<string>()

  return rows.map((row, rowIndex) => {
    const description = String(row[descriptionColumn] ?? '').trim()
    const counterpartyRaw = mapping.counterparty ? row[mapping.counterparty] : undefined
    const counterparty = counterpartyRaw != null ? String(counterpartyRaw).trim() : undefined

    let date: string | null = null
    let error: string | null = null
    try {
      const rawDate = row[dateColumn]
      if (rawDate == null || rawDate === '') throw new Error('leeg')
      date = parseDate(rawDate as string | number | Date)
    } catch {
      error = 'Datum niet te interpreteren'
    }

    let amountGross: number | null = null
    const rawAmount = row[amountColumn]
    const indicator = mapping.debitCreditIndicator ? row[mapping.debitCreditIndicator] : null
    if (rawAmount == null || rawAmount === '') {
      error = error ?? 'Bedrag ontbreekt'
    } else {
      const signed = resolveSignedAmount(rawAmount, indicator)
      if (Number.isNaN(signed)) {
        error = error ?? 'Bedrag niet te interpreteren'
      } else {
        amountGross = signed
      }
    }

    const direction: 'in' | 'out' = directionOverride ?? ((amountGross ?? 0) >= 0 ? 'in' : 'out')

    let isDuplicate = false
    if (date && amountGross !== null) {
      const hash = rowHash(date, Math.abs(amountGross), description)
      isDuplicate = existingHashes.has(hash) || seenInBatch.has(hash)
      seenInBatch.add(hash)
    }

    return { rowIndex, date, description, counterparty, amountGross, direction, isDuplicate, error }
  })
}

/** Zet een geldige, bevestigde rij om naar een op te slane Transaction (nog niet gecategoriseerd). */
export function stagedRowToTransaction(row: StagedRow, importBatchId: string): Transaction {
  if (row.date === null || row.amountGross === null) {
    throw new Error('Kan onvolledige rij niet omzetten naar een transactie')
  }
  const amountGross = Math.abs(row.amountGross)
  return {
    id: createId(),
    date: row.date,
    description: row.description,
    counterparty: row.counterparty,
    amountGross,
    direction: row.direction,
    isPrivate: false,
    businessPortion: 1,
    btwRate: null,
    btwAmount: 0,
    netAmount: amountGross,
    rubriek: null,
    source: 'import',
    importBatchId,
    needsReview: true,
  }
}
