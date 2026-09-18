import { db } from '../../db/schema'
import { createId } from '../../lib/id'
import type { CounterpartyRule, Transaction } from '../btw/types'
import { categorize, type CategorizeAnswers } from './categorize'

/** Sleutel om terugkerende tegenpartijen te herkennen: rekeningnummer als die er is, anders de omschrijving. */
export function counterpartyKey(
  transaction: Pick<Transaction, 'counterparty' | 'description'>,
): string {
  return (transaction.counterparty?.trim() || transaction.description.trim()).toLowerCase()
}

export async function findRuleFor(transaction: Transaction): Promise<CounterpartyRule | undefined> {
  const key = counterpartyKey(transaction)
  if (!key) return undefined
  return db.counterpartyRules.get({ matchOn: key })
}

export function answersFromRule(rule: CounterpartyRule): CategorizeAnswers {
  return { isPrivate: rule.isPrivate, btwRate: rule.btwRate }
}

/** Past bestaande tegenpartij-regels toe op net geïmporteerde transacties, vóór opslag. */
export async function applyExistingRules(transactions: Transaction[]): Promise<Transaction[]> {
  const rules = await db.counterpartyRules.toArray()
  if (rules.length === 0) return transactions
  const ruleByKey = new Map(rules.map((r) => [r.matchOn, r]))

  return transactions.map((t) => {
    const rule = ruleByKey.get(counterpartyKey(t))
    if (!rule) return t
    return { ...t, ...categorize(t, answersFromRule(rule)), needsReview: false }
  })
}

/**
 * Onthoudt deze categorisering voor de tegenpartij, en past 'm meteen toe op alle andere nog
 * niet-gecategoriseerde transacties van dezelfde tegenpartij (niet alleen toekomstige imports).
 */
export async function saveRuleAndApplyToExisting(
  transaction: Transaction,
  answers: CategorizeAnswers,
): Promise<number> {
  const key = counterpartyKey(transaction)
  if (!key) return 0

  const result = categorize(transaction, answers)
  const rule: CounterpartyRule = {
    id: createId(),
    matchOn: key,
    btwRate: answers.btwRate,
    rubriek: result.rubriek,
    isPrivate: answers.isPrivate,
  }

  return db.transaction('rw', db.counterpartyRules, db.transactions, async () => {
    await db.counterpartyRules.where('matchOn').equals(key).delete()
    await db.counterpartyRules.add(rule)

    await db.transactions.update(transaction.id, { ...result, needsReview: false })

    const others = (await db.transactions.toArray()).filter(
      (t) => t.id !== transaction.id && t.needsReview && counterpartyKey(t) === key,
    )

    for (const other of others) {
      const applied = categorize(other, answers)
      await db.transactions.update(other.id, { ...applied, needsReview: false })
    }

    return others.length
  })
}
