import { describe, expect, it } from 'vitest'
import { parseAmount } from './currency'

describe('parseAmount', () => {
  it('parseert NL-notatie (punt=duizendtal, komma=decimaal)', () => {
    expect(parseAmount('1.234,56')).toBeCloseTo(1234.56)
    expect(parseAmount('-12,50')).toBeCloseTo(-12.5)
    expect(parseAmount('0,50')).toBeCloseTo(0.5)
  })

  it('parseert EN-notatie (komma=duizendtal, punt=decimaal)', () => {
    expect(parseAmount('1,234.56')).toBeCloseTo(1234.56)
  })

  it('parseert platte getallen zonder scheidingsteken', () => {
    expect(parseAmount('1234.56')).toBeCloseTo(1234.56)
    expect(parseAmount('1234')).toBe(1234)
  })

  it('behandelt een enkel duizendtal-scheidingsteken (3 cijfers erna) als geheel getal', () => {
    expect(parseAmount('1.234')).toBe(1234)
  })

  it('ondersteunt euroteken, spaties, plusteken en haakjes als negatief', () => {
    expect(parseAmount('€ 1.234,56')).toBeCloseTo(1234.56)
    expect(parseAmount('+12,50')).toBeCloseTo(12.5)
    expect(parseAmount('(12,50)')).toBeCloseTo(-12.5)
  })

  it('geeft getallen ongewijzigd door', () => {
    expect(parseAmount(42.5)).toBe(42.5)
  })
})
