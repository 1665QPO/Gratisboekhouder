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

  it('houdt rekening met een EU-tegenpartij en splitst het bedrag niet (geen Nederlandse btw)', () => {
    // Rubriek 3a/3b heeft geen btw-kolom op de aangifte: het volledige bedrag is omzet.
    const result = categorize(makeTransaction({ amountGross: 800, direction: 'in' }), {
      isPrivate: false,
      btwRate: 21,
      tegenpartij: 'eu',
    })
    expect(result.rubriek).toBe('3b')
    expect(result.netAmount).toBe(800)
    expect(result.btwAmount).toBe(0)
    expect(result.btwRate).toBeNull()
  })

  it('splitst het bedrag ook niet bij een levering buiten de EU (3a)', () => {
    const result = categorize(makeTransaction({ amountGross: 500, direction: 'in' }), {
      isPrivate: false,
      btwRate: 21,
      tegenpartij: 'buiten-eu',
    })
    expect(result.rubriek).toBe('3a')
    expect(result.netAmount).toBe(500)
    expect(result.btwAmount).toBe(0)
  })

  it('slaat costType op bij zakelijke uitgaven', () => {
    const result = categorize(makeTransaction({ direction: 'out' }), {
      isPrivate: false,
      btwRate: 21,
      costType: 'investering',
    })
    expect(result.costType).toBe('investering')
  })

  it('negeert costType bij omzet (inkomsten)', () => {
    const result = categorize(makeTransaction({ direction: 'in' }), {
      isPrivate: false,
      btwRate: 21,
      costType: 'investering',
    })
    expect(result.costType).toBeUndefined()
  })

  it('negeert costType bij privé-transacties', () => {
    const result = categorize(makeTransaction({ direction: 'out' }), {
      isPrivate: true,
      btwRate: null,
      costType: 'investering',
    })
    expect(result.costType).toBeUndefined()
  })
})
