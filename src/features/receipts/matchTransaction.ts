import { db } from '../../db/schema'
import type { Transaction } from '../btw/types'

const AMOUNT_TOLERANCE = 0.01
const DAYS_TOLERANCE = 5

function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(`${isoA}T00:00:00Z`).getTime()
  const b = new Date(`${isoB}T00:00:00Z`).getTime()
  return Math.abs(a - b) / 86_400_000
}

/** Een bonnetje hoort waarschijnlijk bij een transactie als het bedrag (nagenoeg) gelijk is en de datum dichtbij ligt. */
export function isLikelyMatch(
  transaction: Transaction,
  amount: number,
  date: string | null,
): boolean {
  const amountMatches = Math.abs(transaction.amountGross - amount) < AMOUNT_TOLERANCE
  if (!amountMatches) return false
  if (!date) return true
  return daysBetween(transaction.date, date) <= DAYS_TOLERANCE
}

export async function findMatchingTransactions(
  amount: number | null,
  date: string | null,
): Promise<Transaction[]> {
  if (amount === null) return []
  const all = await db.transactions.toArray()
  return all.filter((t) => isLikelyMatch(t, amount, date))
}
