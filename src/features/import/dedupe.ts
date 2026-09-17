import { db } from '../../db/schema'

export function rowHash(date: string, amountGross: number, description: string): string {
  return `${date}|${amountGross.toFixed(2)}|${description.trim().toLowerCase()}`
}

/** Haalt hashes van alle al opgeslagen transacties op, om dubbele imports te herkennen. */
export async function loadExistingHashes(): Promise<Set<string>> {
  const existing = await db.transactions.toArray()
  return new Set(existing.map((t) => rowHash(t.date, t.amountGross, t.description)))
}
