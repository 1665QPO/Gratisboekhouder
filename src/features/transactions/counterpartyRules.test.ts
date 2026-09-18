import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../db/schema'
import type { Transaction } from '../btw/types'
import {
  applyExistingRules,
  counterpartyKeys,
  findRuleFor,
  saveRuleAndApplyToExisting,
} from './counterpartyRules'

function makeTransaction(overrides: Partial<Transaction> & { id: string }): Transaction {
  return {
    date: '2026-01-01',
    description: 'Test',
    amountGross: 100,
    direction: 'out',
    isPrivate: false,
    businessPortion: 1,
    btwRate: null,
    btwAmount: 0,
    netAmount: 100,
    rubriek: null,
    source: 'import',
    needsReview: true,
    ...overrides,
  }
}

async function getTransaction(id: string): Promise<Transaction> {
  const found = await db.transactions.get(id)
  if (!found) throw new Error(`transactie ${id} niet gevonden`)
  return found
}

beforeEach(async () => {
  await db.transactions.clear()
  await db.counterpartyRules.clear()
})

describe('counterpartyKeys', () => {
  it('gebruikt de omschrijving, en de tegenrekening als die er is', () => {
    expect(counterpartyKeys({ description: 'KPN', counterparty: undefined })).toEqual(['kpn'])
    expect(counterpartyKeys({ description: 'KPN', counterparty: 'NL01ABC' })).toEqual([
      'kpn',
      'nl01abc',
    ])
  })
})

describe('saveRuleAndApplyToExisting + findRuleFor', () => {
  it('matcht een latere transactie zonder tegenrekening op de omschrijving, ook als de regel oorspronkelijk via de tegenrekening is opgeslagen', async () => {
    // Reproduceert een echte bug: transactie A heeft wél een tegenrekening (regel wordt dus mede
    // daarop opgeslagen), transactie B (andere bron, bijv. eigen Excel) heeft dat veld niet.
    const withCounterparty = makeTransaction({
      id: 'a',
      description: 'KPN Zakelijk Internet',
      counterparty: 'NL56ABNA0001112223',
    })
    await db.transactions.add(withCounterparty)
    await saveRuleAndApplyToExisting(withCounterparty, { isPrivate: false, btwRate: 21 })

    const withoutCounterparty = makeTransaction({
      id: 'b',
      description: 'KPN Zakelijk Internet',
    })
    const rule = await findRuleFor(withoutCounterparty)

    expect(rule).toBeDefined()
    expect(rule?.rubriek).toBe('5b')
  })

  it('past de regel meteen toe op de transactie die net gecategoriseerd is', async () => {
    const t = makeTransaction({ id: 'a', description: 'Kantoorhuur' })
    await db.transactions.add(t)

    await saveRuleAndApplyToExisting(t, { isPrivate: false, btwRate: 21 })

    const updated = await getTransaction('a')
    expect(updated.needsReview).toBe(false)
    expect(updated.rubriek).toBe('5b')
  })

  it('past de regel toe op andere nog niet-gecategoriseerde transacties van dezelfde tegenpartij', async () => {
    const a = makeTransaction({ id: 'a', description: 'KPN' })
    const b = makeTransaction({ id: 'b', description: 'KPN' })
    const c = makeTransaction({ id: 'c', description: 'KPN', needsReview: false, rubriek: '1a' })
    await db.transactions.bulkAdd([a, b, c])

    const appliedCount = await saveRuleAndApplyToExisting(a, { isPrivate: false, btwRate: 21 })

    expect(appliedCount).toBe(1)
    expect((await getTransaction('b')).needsReview).toBe(false)
    // c was al gecategoriseerd (needsReview: false) en had geen behandeling nodig, dus ongewijzigd.
    expect((await getTransaction('c')).rubriek).toBe('1a')
  })

  it('neemt costType niet over naar andere transacties, want dat is aankoop-specifiek', async () => {
    const a = makeTransaction({ id: 'a', description: 'Bol.com' })
    const b = makeTransaction({ id: 'b', description: 'Bol.com' })
    await db.transactions.bulkAdd([a, b])

    await saveRuleAndApplyToExisting(a, { isPrivate: false, btwRate: 21, costType: 'investering' })

    expect((await getTransaction('a')).costType).toBe('investering')
    expect((await getTransaction('b')).costType).toBeUndefined()
  })

  it('overschrijft een eerdere regel voor dezelfde tegenpartij in plaats van te dupliceren', async () => {
    const a = makeTransaction({ id: 'a', description: 'KPN' })
    await db.transactions.add(a)

    await saveRuleAndApplyToExisting(a, { isPrivate: false, btwRate: 21 })
    await saveRuleAndApplyToExisting(a, { isPrivate: false, btwRate: 9 })

    const rules = await db.counterpartyRules.toArray()
    expect(rules).toHaveLength(1)
    expect(rules[0].btwRate).toBe(9)
  })
})

describe('applyExistingRules', () => {
  it('categoriseert een nieuw te importeren transactie automatisch op basis van een bestaande regel', async () => {
    const existing = makeTransaction({
      id: 'a',
      description: 'KPN',
      counterparty: 'NL56ABNA0001112223',
    })
    await db.transactions.add(existing)
    await saveRuleAndApplyToExisting(existing, { isPrivate: false, btwRate: 21 })

    const incoming = makeTransaction({ id: 'new', description: 'KPN' })
    const [applied] = await applyExistingRules([incoming])

    expect(applied.needsReview).toBe(false)
    expect(applied.rubriek).toBe('5b')
  })

  it('laat transacties zonder matchende regel ongewijzigd', async () => {
    const incoming = makeTransaction({ id: 'new', description: 'Onbekende partij' })
    const [applied] = await applyExistingRules([incoming])

    expect(applied.needsReview).toBe(true)
    expect(applied.rubriek).toBeNull()
  })
})
