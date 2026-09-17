import type { Rubriek, Transaction } from './types'

export interface RubriekTotal {
  rubriek: Rubriek
  net: number
  btw: number
  count: number
}

/** Telt netto- en btw-bedragen per rubriek op. Privé en niet-gecategoriseerde transacties tellen niet mee. */
export function calculateTotals(transactions: Transaction[]): RubriekTotal[] {
  const totals = new Map<Rubriek, RubriekTotal>()

  for (const t of transactions) {
    if (t.isPrivate || !t.rubriek) continue
    const entry = totals.get(t.rubriek) ?? { rubriek: t.rubriek, net: 0, btw: 0, count: 0 }
    entry.net += t.netAmount
    entry.btw += t.btwAmount
    entry.count += 1
    totals.set(t.rubriek, entry)
  }

  return Array.from(totals.values()).sort((a, b) => a.rubriek.localeCompare(b.rubriek))
}
