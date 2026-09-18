import { INVESTERING_DREMPEL } from './constants'
import type { Transaction } from './types'

export interface AangifteCheck {
  message: string
  transactionIds: string[]
}

/**
 * Simpele controles op de gecategoriseerde transacties van een tijdvak, vóórdat je aangifte doet.
 * Vervangt geen boekhoudkundige controle, maar vangt de meest voorkomende slordigheden op: een
 * kwartaal tweemaal geïmporteerd, of een grote aankoop die als kosten in plaats van investering is
 * geboekt.
 */
export function runAangifteChecks(transactions: Transaction[]): AangifteCheck[] {
  const checks: AangifteCheck[] = []

  const byDateAmount = new Map<string, Transaction[]>()
  for (const t of transactions) {
    if (t.isPrivate) continue
    const key = `${t.date}|${t.amountGross}|${t.direction}`
    const group = byDateAmount.get(key) ?? []
    group.push(t)
    byDateAmount.set(key, group)
  }
  for (const group of byDateAmount.values()) {
    if (group.length < 2) continue
    checks.push({
      message: `${group.length} transacties op ${group[0].date} met hetzelfde bedrag (€${group[0].amountGross.toFixed(2)}): mogelijk per ongeluk dubbel geïmporteerd.`,
      transactionIds: group.map((t) => t.id),
    })
  }

  for (const t of transactions) {
    if (
      t.direction === 'out' &&
      !t.isPrivate &&
      !t.isCorrection &&
      t.costType === 'kosten' &&
      t.amountGross >= INVESTERING_DREMPEL
    ) {
      checks.push({
        message: `"${t.description}" (€${t.amountGross.toFixed(2)}) is geboekt als kosten, maar is groter dan de investeringsgrens van €${INVESTERING_DREMPEL}: controleer of dit een investering moet zijn.`,
        transactionIds: [t.id],
      })
    }
  }

  return checks
}
