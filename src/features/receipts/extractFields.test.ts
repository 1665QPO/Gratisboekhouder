import { describe, expect, it } from 'vitest'
import { extractFields } from './extractFields'

// Deze tekst is de daadwerkelijke (rommelige) Tesseract-OCR-output van een echte contantbon-foto.
const REAL_OCR_TEXT = `
CONTANTBON  —_ Be >
Schagen kontant Schagen kontant —
Is / wordt gehaald in Schagen Is / wordt gehaald in Schagen
NEDERLAND
Telefoonnummer:
Factuurnummer: 4432457
Klantnummer: 916
Factuurdatum: 13-03-2026 Pagina:1/1
Ordernr: Pakbonnr: _ Leverdatum: _ Klant ordernr. / Referentie / Project:  Gehotpendoor/ Fe
5978108 4015200 13-03-2026 1-1 Ben Kuiper / Schagen
00003679 zaagketting makita 1 stuks 23,25 B25H 3.5
291 3SCM 3/8" (S2MN)
Betaald via Bedrag
Contant 28,13
Bestel makkelijk en snel op GROENHART.NL Betaal hetzelfde als In de winkel.
Nog geen occount? Moak 'm oan op www.groenhort.nl/inloggen
`

// Dit is de daadwerkelijke, direct uit de tekstlaag geëxtraheerde inhoud van een echte PDF-factuur.
const REAL_PDF_TEXT = `
Omschrijving Bedrag excl. BTW
Boek "Van Baksteen naar Blockchain" € 45,00
€ 45,00
€ 49,05
Totaal exclusief BTW
Totaal te voldoen
BTW € 4,05
Factuurdatum Vervaldatum Factuurnummer Uw referentie
20 augustus 2026 19 september 2610059
`

describe('extractFields', () => {
  it('haalt het totaalbedrag en de datum uit een echte, rommelige OCR-bon', () => {
    const result = extractFields(REAL_OCR_TEXT)
    expect(result.amount).toBeCloseTo(28.13)
    expect(result.date).toBe('2026-03-13')
  })

  it('haalt het totaalbedrag en de datum uit een echte PDF-factuur met woordelijke datum', () => {
    const result = extractFields(REAL_PDF_TEXT)
    expect(result.amount).toBeCloseTo(49.05)
    expect(result.date).toBe('2026-08-20')
  })

  it('geeft null terug als er niets herkenbaars in de tekst staat', () => {
    const result = extractFields('geen bruikbare informatie hier')
    expect(result.amount).toBeNull()
    expect(result.date).toBeNull()
  })

  it('verwart ordernummers en klantnummers niet met bedragen', () => {
    const result = extractFields('Ordernummer 5978108, klantnummer 916, geen bedrag')
    expect(result.amount).toBeNull()
  })
})
