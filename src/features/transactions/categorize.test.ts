import { describe, expect, it } from 'vitest'
import type { Transaction } from '../btw/types'
import { categorize } from './categorize'

function makeTransaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: 't1',
    date: '2026-03-13',
    description: 'test',
    amountGross: 121,
    direction: 'in',
    isPrivate: false,
    businessPortion: 1,
    btwRate: null,
    btwAmount: 0,
    netAmount: 121,
    rubriek: null,
    source: 'import',
    needsReview: true,
    ...overrides,
  }
}

describe('categorize', () => {
  it('zet een transactie op privé zonder rubriek of btw', () => {
    const result = categorize(makeTransaction({}), { isPrivate: true, btwRate: null })
    expect(result).toEqual({
      isPrivate: true,
      btwRate: null,
      btwAmount: 0,
      netAmount: 121,
      rubriek: null,
    })
  })

  it('categoriseert zakelijke omzet met 21% naar 1a en splitst het bedrag', () => {
    const result = categorize(makeTransaction({ amountGross: 121, direction: 'in' }), {
      isPrivate: false,
      btwRate: 21,
    })
    expect(result.rubriek).toBe('1a')
    expect(result.netAmount).toBeCloseTo(100)
    expect(result.btwAmount).toBeCloseTo(21)
  })

  it('categoriseert zakelijke kosten naar 5b', () => {
    const result = categorize(makeTransaction({ amountGross: 121, direction: 'out' }), {
      isPrivate: false,
      btwRate: 21,
    })
    expect(result.rubriek).toBe('5b')
  })

  it('houdt rekening met een EU-tegenpartij', () => {
    const result = categorize(makeTransaction({ direction: 'in' }), {
      isPrivate: false,
      btwRate: 21,
      tegenpartij: 'eu',
    })
    expect(result.rubriek).toBe('3b')
  })
})
