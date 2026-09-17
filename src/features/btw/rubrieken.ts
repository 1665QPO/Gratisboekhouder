import type { Rubriek } from './types'

export interface RubriekInfo {
  label: string
  omschrijving: string
}

export const RUBRIEK_INFO: Record<Rubriek, RubriekInfo> = {
  '1a': { label: 'Rubriek 1a', omschrijving: 'Omzet belast met hoog tarief (21%)' },
  '1b': { label: 'Rubriek 1b', omschrijving: 'Omzet belast met laag tarief (9%)' },
  '1e': { label: 'Rubriek 1e', omschrijving: 'Omzet belast met 0% of vrijgesteld' },
  '2a': { label: 'Rubriek 2a', omschrijving: 'Btw verlegd naar u (binnenland)' },
  '3a': { label: 'Rubriek 3a', omschrijving: 'Leveringen naar landen buiten de EU' },
  '3b': { label: 'Rubriek 3b', omschrijving: 'Leveringen naar landen binnen de EU' },
  '4a': { label: 'Rubriek 4a', omschrijving: 'Inkopen uit landen buiten de EU' },
  '4b': { label: 'Rubriek 4b', omschrijving: 'Inkopen uit landen binnen de EU' },
  '5b': { label: 'Rubriek 5b', omschrijving: 'Voorbelasting (btw over kosten en inkopen)' },
}

export const RUBRIEKEN: Rubriek[] = ['1a', '1b', '1e', '2a', '3a', '3b', '4a', '4b', '5b']
