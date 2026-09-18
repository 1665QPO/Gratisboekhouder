import { describe, expect, it } from 'vitest'
import type { Transaction } from '../btw/types'
import { isLikelyMatch } from './matchTransaction'

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 't1',
    date: '2026-03-13',
    description: 'test',
    amountGross: 28.13,
    direction: 'out',
    isPrivate: false,
    businessPortion: 1,
    btwRate: null,
    btwAmount: 0,
    netAmount: 28.13,
    rubriek: null,
    source: 'import',
    needsReview: true,
    ...overrides,
  }
}

describe('isLikelyMatch', () => {
  it('matcht op nagenoeg gelijk bedrag en dezelfde datum', () => {
    expect(isLikelyMatch(makeTransaction({}), 28.13, '2026-03-13')).toBe(true)
  })

  it('matcht niet bij een ander bedrag', () => {
    expect(isLikelyMatch(makeTransaction({}), 30, '2026-03-13')).toBe(false)
  })

  it('matcht nog binnen een kleine datumtolerantie', () => {
    expect(isLikelyMatch(makeTransaction({}), 28.13, '2026-03-15')).toBe(true)
  })

  it('matcht niet als de datum te ver uit elkaar ligt', () => {
    expect(isLikelyMatch(makeTransaction({}), 28.13, '2026-04-01')).toBe(false)
  })

  it('negeert de datum als die niet herkend is', () => {
    expect(isLikelyMatch(makeTransaction({ date: '2020-01-01' }), 28.13, null)).toBe(true)
  })
})
