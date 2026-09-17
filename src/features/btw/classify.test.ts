import { describe, expect, it } from 'vitest'
import { classifyTransaction, splitAmount } from './classify'

describe('classifyTransaction', () => {
  it('classificeert privé-transacties nooit als rubriek', () => {
    expect(classifyTransaction({ isPrivate: true, direction: 'in', btwRate: 21 })).toBeNull()
    expect(classifyTransaction({ isPrivate: true, direction: 'out', btwRate: null })).toBeNull()
  })

  it('classificeert omzet naar hoog/laag/nul tarief', () => {
    expect(classifyTransaction({ isPrivate: false, direction: 'in', btwRate: 21 })).toBe('1a')
    expect(classifyTransaction({ isPrivate: false, direction: 'in', btwRate: 9 })).toBe('1b')
    expect(classifyTransaction({ isPrivate: false, direction: 'in', btwRate: 0 })).toBe('1e')
    expect(classifyTransaction({ isPrivate: false, direction: 'in', btwRate: null })).toBe('1e')
  })

  it('geeft verlegde btw op inkomsten voorrang boven het tarief', () => {
    expect(
      classifyTransaction({ isPrivate: false, direction: 'in', btwRate: 21, btwVerlegd: true }),
    ).toBe('2a')
  })

  it('classificeert grensoverschrijdende omzet', () => {
    expect(
      classifyTransaction({ isPrivate: false, direction: 'in', btwRate: 21, tegenpartij: 'eu' }),
    ).toBe('3b')
    expect(
      classifyTransaction({
        isPrivate: false,
        direction: 'in',
        btwRate: 21,
        tegenpartij: 'buiten-eu',
      }),
    ).toBe('3a')
  })

  it('classificeert binnenlandse kosten als voorbelasting (5b)', () => {
    expect(classifyTransaction({ isPrivate: false, direction: 'out', btwRate: 21 })).toBe('5b')
  })

  it('classificeert grensoverschrijdende inkopen', () => {
    expect(
      classifyTransaction({ isPrivate: false, direction: 'out', btwRate: 21, tegenpartij: 'eu' }),
    ).toBe('4b')
    expect(
      classifyTransaction({
        isPrivate: false,
        direction: 'out',
        btwRate: 21,
        tegenpartij: 'buiten-eu',
      }),
    ).toBe('4a')
  })
})

describe('splitAmount', () => {
  it('splitst een bedrag zonder btw volledig als netto', () => {
    expect(splitAmount(100, null)).toEqual({ net: 100, btw: 0 })
  })

  it('splitst een bedrag met 21% btw correct', () => {
    const { net, btw } = splitAmount(121, 21)
    expect(net).toBeCloseTo(100, 2)
    expect(btw).toBeCloseTo(21, 2)
  })

  it('splitst een bedrag met 9% btw correct', () => {
    const { net, btw } = splitAmount(109, 9)
    expect(net).toBeCloseTo(100, 2)
    expect(btw).toBeCloseTo(9, 2)
  })

  it('rondt af op centen', () => {
    const { net, btw } = splitAmount(10, 21)
    expect(net + btw).toBeCloseTo(10, 2)
  })
})
