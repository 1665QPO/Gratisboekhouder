import { describe, expect, it } from 'vitest'
import { calculateAangifteTotaal } from './aangifte'
import type { RubriekTotal } from './totals'

function total(overrides: Partial<RubriekTotal>): RubriekTotal {
  return { rubriek: '1a', net: 0, btw: 0, count: 0, ...overrides }
}

describe('calculateAangifteTotaal', () => {
  it('berekent 5a als som van de btw uit 1a, 1b, 2a, 4a en 4b', () => {
    const totals: RubriekTotal[] = [
      total({ rubriek: '1a', btw: 100 }),
      total({ rubriek: '1b', btw: 20 }),
      total({ rubriek: '2a', btw: 5 }),
      total({ rubriek: '4a', btw: 7 }),
      total({ rubriek: '4b', btw: 3 }),
      total({ rubriek: '5b', btw: 50 }),
    ]

    const result = calculateAangifteTotaal(totals)

    expect(result.verschuldigd).toBe(135)
    expect(result.voorbelasting).toBe(50)
    expect(result.saldo).toBe(85)
  })

  it('negeert rubrieken zonder btw-kolom (1e, 3a, 3b) voor de verschuldigde btw', () => {
    const totals: RubriekTotal[] = [
      total({ rubriek: '1e', net: 500, btw: 0 }),
      total({ rubriek: '3a', net: 200, btw: 0 }),
      total({ rubriek: '3b', net: 300, btw: 0 }),
      total({ rubriek: '1a', btw: 21 }),
    ]

    expect(calculateAangifteTotaal(totals).verschuldigd).toBe(21)
  })

  it('geeft een negatief saldo (teruggaaf) als de voorbelasting hoger is dan de verschuldigde btw', () => {
    // Voorbeeld uit de Belastingdienst-toelichting (zonnepanelen): 5a = 60, 5b = 800 -> -740.
    const totals: RubriekTotal[] = [
      total({ rubriek: '1a', btw: 60 }),
      total({ rubriek: '5b', btw: 800 }),
    ]

    const result = calculateAangifteTotaal(totals)

    expect(result.verschuldigd).toBe(60)
    expect(result.voorbelasting).toBe(800)
    expect(result.saldo).toBe(-740)
  })

  it('geeft nul-totalen zonder transacties', () => {
    expect(calculateAangifteTotaal([])).toEqual({ verschuldigd: 0, voorbelasting: 0, saldo: 0 })
  })

  it('rondt af op centen', () => {
    const totals: RubriekTotal[] = [
      total({ rubriek: '1a', btw: 10.005 }),
      total({ rubriek: '5b', btw: 3.001 }),
    ]
    const result = calculateAangifteTotaal(totals)
    expect(result.verschuldigd).toBeCloseTo(10.01, 2)
    expect(result.voorbelasting).toBeCloseTo(3, 2)
  })
})
