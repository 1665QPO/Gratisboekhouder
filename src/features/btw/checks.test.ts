import { describe, expect, it } from 'vitest'
import { runAangifteChecks } from './checks'
import type { Transaction } from './types'

function makeTransaction(overrides: Partial<Transaction> & { id: string }): Transaction {
  return {
    date: '2026-01-15',
    description: 'Test',
    amountGross: 100,
    direction: 'out',
    isPrivate: false,
    businessPortion: 1,
    btwRate: 21,
    btwAmount: 17.36,
    netAmount: 82.64,
    rubriek: '5b',
    costType: 'kosten',
    source: 'import',
    needsReview: false,
    ...overrides,
  }
}

describe('runAangifteChecks', () => {
  it('geeft geen meldingen bij een schone set transacties', () => {
    const transactions = [
      makeTransaction({ id: 'a', amountGross: 50 }),
      makeTransaction({ id: 'b', date: '2026-02-01', amountGross: 75 }),
    ]
    expect(runAangifteChecks(transactions)).toEqual([])
  })

  it('signaleert twee transacties met dezelfde datum en hetzelfde bedrag als mogelijk dubbel', () => {
    const transactions = [
      makeTransaction({ id: 'a', date: '2026-01-10', amountGross: 89 }),
      makeTransaction({ id: 'b', date: '2026-01-10', amountGross: 89 }),
    ]
    const checks = runAangifteChecks(transactions)
    expect(checks).toHaveLength(1)
    expect(checks[0].transactionIds).toEqual(['a', 'b'])
  })

  it('signaleert geen dubbel bij hetzelfde bedrag op een andere datum', () => {
    const transactions = [
      makeTransaction({ id: 'a', date: '2026-01-10', amountGross: 89 }),
      makeTransaction({ id: 'b', date: '2026-02-10', amountGross: 89 }),
    ]
    expect(runAangifteChecks(transactions)).toEqual([])
  })

  it('signaleert een grote aankoop die als kosten in plaats van investering is geboekt', () => {
    const transactions = [
      makeTransaction({ id: 'a', description: 'MacBook Pro', amountGross: 2000, costType: 'kosten' }),
    ]
    const checks = runAangifteChecks(transactions)
    expect(checks).toHaveLength(1)
    expect(checks[0].message).toContain('MacBook Pro')
  })

  it('signaleert niets als de grote aankoop al als investering is geboekt', () => {
    const transactions = [
      makeTransaction({ id: 'a', amountGross: 2000, costType: 'investering' }),
    ]
    expect(runAangifteChecks(transactions)).toEqual([])
  })

  it('negeert privé- en correctietransacties voor de investeringscheck', () => {
    const transactions = [
      makeTransaction({ id: 'a', amountGross: 2000, isPrivate: true, costType: undefined }),
      makeTransaction({ id: 'b', amountGross: 2000, isCorrection: true }),
    ]
    expect(runAangifteChecks(transactions)).toEqual([])
  })
})
