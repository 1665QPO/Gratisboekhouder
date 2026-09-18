import type { RubriekTotal } from './totals'

export interface AangifteTotaal {
  /** Rubriek 5a: verschuldigde btw. Som van de btw-bedragen uit 1a, 1b, 2a, 4a en 4b. */
  verschuldigd: number
  /** Rubriek 5b: voorbelasting (btw over kosten/inkopen/investeringen). */
  voorbelasting: number
  /** Saldo (rubriek 5g op de papieren aangifte, in de digitale aangifte "Totaal btw" genoemd).
   *  Positief = u moet betalen, negatief = u krijgt terug. */
  saldo: number
}

/**
 * Rubrieken waarvan de btw-kolom meetelt in rubriek 5a (verschuldigde btw). 1c (sportkantineforfait)
 * en 1d (privégebruik auto) zijn niet geïmplementeerd in deze tool en tellen dus niet mee; 1e, 3a, 3b
 * en 3c hebben geen btw-kolom (0%-tarief of buiten NL belast) en dragen altijd 0 bij.
 * Bron: Toelichting bij de btw-aangifte (omzetbelasting), belastingdienst.nl — rubriek 5a wordt in de
 * digitale aangifte automatisch berekend als som van de btw uit 1a t/m 4b.
 */
const VERSCHULDIGD_RUBRIEKEN = ['1a', '1b', '2a', '4a', '4b'] as const

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Berekent de eindtotalen (rubriek 5) uit de per-rubriek totalen van een aangiftetijdvak. */
export function calculateAangifteTotaal(totals: RubriekTotal[]): AangifteTotaal {
  const byRubriek = new Map(totals.map((t) => [t.rubriek, t]))

  const verschuldigd = VERSCHULDIGD_RUBRIEKEN.reduce(
    (sum, rubriek) => sum + (byRubriek.get(rubriek)?.btw ?? 0),
    0,
  )
  const voorbelasting = byRubriek.get('5b')?.btw ?? 0

  return {
    verschuldigd: round2(verschuldigd),
    voorbelasting: round2(voorbelasting),
    saldo: round2(verschuldigd - voorbelasting),
  }
}
