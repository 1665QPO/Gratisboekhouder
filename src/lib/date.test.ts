import { describe, expect, it } from 'vitest'
import { parseDate } from './date'

describe('parseDate', () => {
  it('laat ISO-datums ongewijzigd', () => {
    expect(parseDate('2026-03-01')).toBe('2026-03-01')
  })

  it('parseert dd-mm-jjjj en dd/mm/jjjj', () => {
    expect(parseDate('01-03-2026')).toBe('2026-03-01')
    expect(parseDate('1/3/2026')).toBe('2026-03-01')
  })

  it('parseert jjjjmmdd (ING-stijl)', () => {
    expect(parseDate('20260301')).toBe('2026-03-01')
  })

  it('parseert een numeriek jjjjmmdd-getal', () => {
    expect(parseDate(20260301)).toBe('2026-03-01')
  })

  it('parseert Excel-serienummers als UTC-datum', () => {
    // 25569 is de gedocumenteerde Excel-serie voor 1970-01-01 (Unix-epoch).
    expect(parseDate(25569)).toBe('1970-01-01')
  })

  it('parseert een Date-object via UTC-componenten', () => {
    expect(parseDate(new Date(Date.UTC(2026, 2, 1)))).toBe('2026-03-01')
  })

  it('gooit een duidelijke fout bij onherkenbare datums', () => {
    expect(() => parseDate('niet-een-datum')).toThrow()
  })
})
