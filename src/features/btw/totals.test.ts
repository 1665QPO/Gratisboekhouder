import { describe, expect, it } from 'vitest'
import type { Transaction } from './types'
import { calculateTotals } from './totals'

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: crypto.randomUUID(),
    date: '2026-01-01',
    description: 'test',
    amountGross: 121,
    direction: 'in',
    isPrivate: false,
    businessPortion: 1,
    btwRate: 21,
    btwAmount: 21,
    netAmount: 100,
    rubriek: '1a',
    source: 'manual',
    needsReview: false,
    ...overrides,
  }
}

describe('calculateTotals', () => {
  it('telt bedragen per rubriek op', () => {
    const transactions = [
      makeTransaction({ rubriek: '1a', netAmount: 100, btwAmount: 21 }),
      makeTransaction({ rubriek: '1a', netAmount: 50, btwAmount: 10.5 }),
      makeTransaction({ rubriek: '5b', direction: 'out', netAmount: 30, btwAmount: 6.3 }),
    ]

    const totals = calculateTotals(transactions)

    expect(totals).toEqual([
      { rubriek: '1a', net: 150, btw: 31.5, count: 2 },
      { rubriek: '5b', net: 30, btw: 6.3, count: 1 },
    ])
  })

  it('negeert privé-transacties en transacties zonder rubriek', () => {
    const transactions = [
      makeTransaction({ isPrivate: true, rubriek: '1a' }),
      makeTransaction({ rubriek: null, needsReview: true }),
    ]

    expect(calculateTotals(transactions)).toEqual([])
  })
})
