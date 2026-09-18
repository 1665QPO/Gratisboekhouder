import { describe, expect, it } from 'vitest'
import { guessColumnMapping, resolveSignedAmount } from './columnMapping'

describe('guessColumnMapping', () => {
  it('herkent een ING-achtige kolomindeling', () => {
    const headers = ['Datum', 'Naam / Omschrijving', 'Tegenrekening', 'Af Bij', 'Bedrag (EUR)']
    const mapping = guessColumnMapping(headers)
    expect(mapping.date).toBe('Datum')
    expect(mapping.description).toBe('Naam / Omschrijving')
    expect(mapping.counterparty).toBe('Tegenrekening')
    expect(mapping.debitCreditIndicator).toBe('Af Bij')
    expect(mapping.amount).toBe('Bedrag (EUR)')
  })

  it('herkent een eenvoudige eigen Excel-indeling', () => {
    const headers = ['Date', 'Description', 'Amount']
    const mapping = guessColumnMapping(headers)
    expect(mapping.date).toBe('Date')
    expect(mapping.description).toBe('Description')
    expect(mapping.amount).toBe('Amount')
    expect(mapping.counterparty).toBeNull()
  })

  it('laat velden leeg als er geen match is', () => {
    const mapping = guessColumnMapping(['Kolom A', 'Kolom B'])
    expect(mapping.date).toBeNull()
    expect(mapping.amount).toBeNull()
  })

  it('kiest de incl.-btw-kolom als er zowel een excl.- als incl.-kolom is', () => {
    const headers = [
      'Kolom A',
      'Soort',
      'Datum',
      'Winkel',
      'Ordernummer',
      'Factuurnummer',
      'Bedrag ex',
      'BTW',
      'Bedrag incl. BTW',
      'Definitieve uitgaven',
    ]
    const mapping = guessColumnMapping(headers)
    expect(mapping.amount).toBe('Bedrag incl. BTW')
  })
})

describe('resolveSignedAmount', () => {
  it('gebruikt het teken van het bedrag als er geen indicator is', () => {
    expect(resolveSignedAmount('-12,50', null)).toBeCloseTo(-12.5)
    expect(resolveSignedAmount('12,50', null)).toBeCloseTo(12.5)
  })

  it('gebruikt de Af/Bij-indicator als die aanwezig is', () => {
    expect(resolveSignedAmount('12,50', 'Af')).toBeCloseTo(-12.5)
    expect(resolveSignedAmount('12,50', 'Bij')).toBeCloseTo(12.5)
  })

  it('valt terug op het teken van het bedrag bij een onbekende indicatorwaarde', () => {
    expect(resolveSignedAmount('-12,50', 'onbekend')).toBeCloseTo(-12.5)
  })
})
