import { db } from '../../db/schema'
import { createId } from '../../lib/id'
import type { CounterpartyRule, Transaction } from '../btw/types'
import { categorize, type CategorizeAnswers } from './categorize'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

/**
 * Alle sleutels waarop een transactie herkend kan worden: de omschrijving (altijd aanwezig) en,
 * indien aanwezig, de tegenrekening/IBAN. Een transactie kan op *elke* van deze sleutels matchen,
 * want dezelfde tegenpartij heeft niet altijd hetzelfde veld ingevuld (een handmatige of uit een
 * bonnetje aangemaakte transactie heeft bijvoorbeeld geen IBAN, een bank-import meestal wel).
 */
export function counterpartyKeys(
  transaction: Pick<Transaction, 'counterparty' | 'description'>,
): string[] {
  const keys = new Set<string>()
  const description = normalize(transaction.description)
  if (description) keys.add(description)
  if (transaction.counterparty) {
    const counterparty = normalize(transaction.counterparty)
    if (counterparty) keys.add(counterparty)
  }
  return Array.from(keys)
}

/** Enkele sleutel voor UI-doeleinden (bijv. "onthoud voor {label}") — welke exact maakt daar niet uit. */
export function counterpartyKey(
  transaction: Pick<Transaction, 'counterparty' | 'description'>,
): string {
  return counterpartyKeys(transaction)[0] ?? ''
}

export async function findRuleFor(transaction: Transaction): Promise<CounterpartyRule | undefined> {
  const keys = counterpartyKeys(transaction)
  if (keys.length === 0) return undefined
  const matches = await db.counterpartyRules.where('matchOn').anyOf(keys).toArray()
  return matches[0]
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
    const rule = counterpartyKeys(t)
      .map((key) => ruleByKey.get(key))
      .find((r): r is CounterpartyRule => r !== undefined)
    if (!rule) return t
    return { ...t, ...categorize(t, answersFromRule(rule)), needsReview: false }
  })
}

/**
 * Onthoudt deze categorisering voor de tegenpartij, en past 'm meteen toe op alle andere nog
 * niet-gecategoriseerde transacties van dezelfde tegenpartij (niet alleen toekomstige imports).
 * De regel wordt onder elke sleutel van deze transactie opgeslagen, zodat een latere transactie
 * van dezelfde tegenpartij ook matcht als die toevallig een ander veld (wel/geen IBAN) heeft.
 */
export async function saveRuleAndApplyToExisting(
  transaction: Transaction,
  answers: CategorizeAnswers,
): Promise<number> {
  const keys = counterpartyKeys(transaction)
  if (keys.length === 0) return 0

  const result = categorize(transaction, answers)

  return db.transaction('rw', db.counterpartyRules, db.transactions, async () => {
    await db.counterpartyRules.where('matchOn').anyOf(keys).delete()
    await db.counterpartyRules.bulkAdd(
      keys.map((key) => ({
        id: createId(),
        matchOn: key,
        btwRate: answers.btwRate,
        rubriek: result.rubriek,
        isPrivate: answers.isPrivate,
      })),
    )

    await db.transactions.update(transaction.id, { ...result, needsReview: false })

    const others = (await db.transactions.toArray()).filter(
      (t) =>
        t.id !== transaction.id &&
        t.needsReview &&
        counterpartyKeys(t).some((key) => keys.includes(key)),
    )

    // costType is per aankoop verschillend (een investering bij deze ene aankoop betekent niet dat
    // alles van deze tegenpartij een investering is), dus die nemen we niet klakkeloos over.
    const answersForOthers: CategorizeAnswers = { ...answers, costType: undefined }
    for (const other of others) {
      const applied = categorize(other, answersForOthers)
      await db.transactions.update(other.id, { ...applied, needsReview: false })
    }

    return others.length
  })
}
