import { describe, expect, it } from 'vitest'
import { stageRows, stagedRowToTransaction } from './stageRows'
import type { ColumnMapping } from './columnMapping'

const mapping: ColumnMapping = {
  date: 'Datum',
  description: 'Omschrijving',
  amount: 'Bedrag',
  counterparty: null,
  debitCreditIndicator: null,
}

describe('stageRows', () => {
  it('normaliseert geldige rijen', () => {
    const rows = [{ Datum: '01-03-2026', Omschrijving: 'Klant Jansen', Bedrag: '121,00' }]
    const [staged] = stageRows(rows, mapping, new Set())

    expect(staged.date).toBe('2026-03-01')
    expect(staged.amountGross).toBeCloseTo(121)
    expect(staged.direction).toBe('in')
    expect(staged.error).toBeNull()
    expect(staged.isDuplicate).toBe(false)
  })

  it('herkent uitgaven aan een negatief bedrag', () => {
    const rows = [{ Datum: '01-03-2026', Omschrijving: 'Kantoorspullen', Bedrag: '-49,99' }]
    const [staged] = stageRows(rows, mapping, new Set())
    expect(staged.direction).toBe('out')
    expect(staged.amountGross).toBeCloseTo(-49.99)
  })

  it('markeert rijen met een onherkenbare datum of bedrag als fout, niet als crash', () => {
    const rows = [
      { Datum: 'onzin', Omschrijving: 'A', Bedrag: '10,00' },
      { Datum: '01-03-2026', Omschrijving: 'B', Bedrag: 'onzin' },
    ]
    const [row1, row2] = stageRows(rows, mapping, new Set())
    expect(row1.error).toBe('Datum niet te interpreteren')
    expect(row2.error).toBe('Bedrag niet te interpreteren')
  })

  it('markeert dubbele rijen binnen hetzelfde bestand', () => {
    const rows = [
      { Datum: '01-03-2026', Omschrijving: 'Zelfde', Bedrag: '10,00' },
      { Datum: '01-03-2026', Omschrijving: 'Zelfde', Bedrag: '10,00' },
    ]
    const [first, second] = stageRows(rows, mapping, new Set())
    expect(first.isDuplicate).toBe(false)
    expect(second.isDuplicate).toBe(true)
  })

  it('markeert rijen die al eerder zijn geïmporteerd', () => {
    const rows = [{ Datum: '01-03-2026', Omschrijving: 'Bestaand', Bedrag: '10,00' }]
    const existingHashes = new Set(['2026-03-01|10.00|bestaand'])
    const [staged] = stageRows(rows, mapping, existingHashes)
    expect(staged.isDuplicate).toBe(true)
  })

  it('gooit een duidelijke fout als de mapping niet compleet is', () => {
    expect(() => stageRows([], { ...mapping, amount: null }, new Set())).toThrow()
  })
})

describe('stagedRowToTransaction', () => {
  it('zet een geldige rij om naar een niet-gecategoriseerde transactie', () => {
    const [staged] = stageRows(
      [{ Datum: '01-03-2026', Omschrijving: 'Klant Jansen', Bedrag: '121,00' }],
      mapping,
      new Set(),
    )
    const transaction = stagedRowToTransaction(staged, 'batch-1')

    expect(transaction.date).toBe('2026-03-01')
    expect(transaction.amountGross).toBe(121)
    expect(transaction.rubriek).toBeNull()
    expect(transaction.needsReview).toBe(true)
    expect(transaction.importBatchId).toBe('batch-1')
  })

  it('weigert een onvolledige rij om te zetten', () => {
    const incomplete = {
      rowIndex: 0,
      date: null,
      description: 'x',
      amountGross: null,
      direction: 'in' as const,
      isDuplicate: false,
      error: 'Datum niet te interpreteren',
    }
    expect(() => stagedRowToTransaction(incomplete, 'batch-1')).toThrow()
  })
})
