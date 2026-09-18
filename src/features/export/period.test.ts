import { describe, expect, it } from 'vitest'
import {
  availablePeriods,
  formatDeadline,
  isDeadlinePassed,
  isInPeriod,
  periodDeadline,
  periodLabel,
  periodRange,
  quarterOf,
} from './period'

describe('quarterOf', () => {
  it('bepaalt het juiste kwartaal per maand', () => {
    expect(quarterOf('2026-01-15')).toEqual({ year: 2026, quarter: 1 })
    expect(quarterOf('2026-03-31')).toEqual({ year: 2026, quarter: 1 })
    expect(quarterOf('2026-04-01')).toEqual({ year: 2026, quarter: 2 })
    expect(quarterOf('2026-06-30')).toEqual({ year: 2026, quarter: 2 })
    expect(quarterOf('2026-07-01')).toEqual({ year: 2026, quarter: 3 })
    expect(quarterOf('2026-09-30')).toEqual({ year: 2026, quarter: 3 })
    expect(quarterOf('2026-10-01')).toEqual({ year: 2026, quarter: 4 })
    expect(quarterOf('2026-12-31')).toEqual({ year: 2026, quarter: 4 })
  })
})

describe('periodLabel', () => {
  it('formatteert een leesbaar label', () => {
    expect(periodLabel({ year: 2026, quarter: 3 })).toBe('3e kwartaal 2026')
  })
})

describe('periodRange', () => {
  it('geeft de eerste en laatste dag van het kwartaal, inclusief schrikkeljaar', () => {
    expect(periodRange({ year: 2026, quarter: 1 })).toEqual({
      start: '2026-01-01',
      end: '2026-03-31',
    })
    expect(periodRange({ year: 2024, quarter: 1 })).toEqual({
      start: '2024-01-01',
      end: '2024-03-31',
    })
    expect(periodRange({ year: 2026, quarter: 4 })).toEqual({
      start: '2026-10-01',
      end: '2026-12-31',
    })
  })
})

describe('isInPeriod', () => {
  it('herkent grensdata correct', () => {
    const q1 = { year: 2026, quarter: 1 } as const
    expect(isInPeriod('2026-01-01', q1)).toBe(true)
    expect(isInPeriod('2026-03-31', q1)).toBe(true)
    expect(isInPeriod('2025-12-31', q1)).toBe(false)
    expect(isInPeriod('2026-04-01', q1)).toBe(false)
  })
})

describe('availablePeriods', () => {
  it('geeft unieke kwartalen terug, meest recent eerst', () => {
    const dates = ['2026-01-05', '2026-02-10', '2025-11-20', '2026-07-01']
    expect(availablePeriods(dates)).toEqual([
      { year: 2026, quarter: 3 },
      { year: 2026, quarter: 1 },
      { year: 2025, quarter: 4 },
    ])
  })

  it('geeft een lege lijst zonder transacties', () => {
    expect(availablePeriods([])).toEqual([])
  })
})

describe('periodDeadline', () => {
  // Bron: https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/uiterste-aangifte-en-betaaldatums
  // (2026-deadlines per kwartaal, zoals daar gepubliceerd).
  it('geeft de laatste dag van de maand ná het kwartaal', () => {
    expect(periodDeadline({ year: 2026, quarter: 1 })).toBe('2026-04-30')
    expect(periodDeadline({ year: 2026, quarter: 2 })).toBe('2026-07-31')
    expect(periodDeadline({ year: 2026, quarter: 3 })).toBe('2026-10-31')
  })

  it('loopt het jaartal door bij het vierde kwartaal', () => {
    expect(periodDeadline({ year: 2026, quarter: 4 })).toBe('2027-01-31')
  })
})

describe('formatDeadline', () => {
  it('formatteert een ISO-datum leesbaar in het Nederlands', () => {
    expect(formatDeadline('2026-04-30')).toBe('30 april 2026')
  })
})

describe('isDeadlinePassed', () => {
  it('herkent een datum vóór, op en ná de deadline', () => {
    const q1 = { year: 2026, quarter: 1 } as const
    expect(isDeadlinePassed(q1, new Date('2026-04-29T23:00:00Z'))).toBe(false)
    expect(isDeadlinePassed(q1, new Date('2026-04-30T23:00:00Z'))).toBe(false)
    expect(isDeadlinePassed(q1, new Date('2026-05-01T00:00:00Z'))).toBe(true)
  })
})
