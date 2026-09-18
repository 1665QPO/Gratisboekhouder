import { describe, expect, it } from 'vitest'
import { rowsToParsedFile } from './parseFile'

// Dit zijn de daadwerkelijke eerste rijen uit een echt "eigen bijhoudlijstje" (geen koppenrij,
// een lege rij bovenaan) waarmee dit gedrag ontdekt is.
const REAL_HEADERLESS_ROWS: unknown[][] = [
  [null, null, null, null, null, null, null, null, null, null],
  [
    'Voldaan',
    'Materiaal',
    new Date(Date.UTC(2026, 3, 2)),
    'IKEA',
    null,
    null,
    112.7190083,
    23.67099174,
    136.39,
    136.39,
  ],
  [
    'Voldaan',
    'Materiaal',
    new Date(Date.UTC(2026, 3, 4)),
    'Gamma',
    '26040410230006599523',
    null,
    28.84297521,
    6.057024793,
    34.9,
    34.9,
  ],
]

describe('rowsToParsedFile', () => {
  it('slaat een lege rij over en verzint kolomletters als er geen koppenrij is', () => {
    const result = rowsToParsedFile(REAL_HEADERLESS_ROWS)

    expect(result.headers).toEqual([
      'Kolom A',
      'Kolom B',
      'Kolom C',
      'Kolom D',
      'Kolom E',
      'Kolom F',
      'Kolom G',
      'Kolom H',
      'Kolom I',
      'Kolom J',
    ])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({
      'Kolom A': 'Voldaan',
      'Kolom B': 'Materiaal',
      'Kolom C': new Date(Date.UTC(2026, 3, 2)),
      'Kolom D': 'IKEA',
      'Kolom E': null,
      'Kolom F': null,
      'Kolom G': 112.7190083,
      'Kolom H': 23.67099174,
      'Kolom I': 136.39,
      'Kolom J': 136.39,
    })
  })

  it('gebruikt een echte koppenrij als die er is', () => {
    const result = rowsToParsedFile([
      ['Datum', 'Omschrijving', 'Bedrag'],
      [new Date(Date.UTC(2026, 3, 2)), 'IKEA', 136.39],
    ])
    expect(result.headers).toEqual(['Datum', 'Omschrijving', 'Bedrag'])
    expect(result.rows[0].Datum).toEqual(new Date(Date.UTC(2026, 3, 2)))
  })

  it('herstelt lege of dubbele kolomkoppen zodat kolommen elkaar niet overschrijven', () => {
    const result = rowsToParsedFile([
      ['Datum', '', 'Bedrag', 'Bedrag'],
      [new Date(Date.UTC(2026, 3, 2)), 'IKEA', 100, 121],
    ])
    expect(result.headers).toEqual(['Datum', 'Kolom B', 'Bedrag', 'Bedrag (2)'])
    expect(result.rows[0]).toEqual({
      Datum: new Date(Date.UTC(2026, 3, 2)),
      'Kolom B': 'IKEA',
      Bedrag: 100,
      'Bedrag (2)': 121,
    })
  })

  it('geeft een lege ParsedFile terug als alle rijen leeg zijn', () => {
    expect(rowsToParsedFile([[null, null]])).toEqual({ headers: [], rows: [] })
  })
})
