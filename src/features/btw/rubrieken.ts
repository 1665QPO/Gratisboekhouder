import type { Rubriek } from './types'

export interface RubriekInfo {
  label: string
  omschrijving: string
}

/**
 * Omschrijvingen zo dicht mogelijk bij de letterlijke tekst uit de "Toelichting bij de
 * btw-aangifte (omzetbelasting)" van de Belastingdienst, zodat ze herkenbaar zijn als je ze naast
 * het portaal legt. Bron: https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/themaoverstijgend/brochures_en_publicaties/toelichting_bij_de_digitale_aangifte_omzetbelasting
 */
export const RUBRIEK_INFO: Record<Rubriek, RubriekInfo> = {
  '1a': { label: 'Rubriek 1a', omschrijving: 'Leveringen/diensten belast met hoog tarief (21%)' },
  '1b': { label: 'Rubriek 1b', omschrijving: 'Leveringen/diensten belast met laag tarief (9%)' },
  '1e': {
    label: 'Rubriek 1e',
    omschrijving: 'Leveringen/diensten belast met 0% of niet bij u belast',
  },
  '2a': {
    label: 'Rubriek 2a',
    omschrijving: 'Leveringen/diensten waarbij de btw naar u is verlegd',
  },
  '3a': { label: 'Rubriek 3a', omschrijving: 'Leveringen naar landen buiten de EU (uitvoer)' },
  '3b': { label: 'Rubriek 3b', omschrijving: 'Leveringen naar of diensten in landen binnen de EU' },
  '4a': { label: 'Rubriek 4a', omschrijving: 'Leveringen/diensten uit landen buiten de EU' },
  '4b': { label: 'Rubriek 4b', omschrijving: 'Leveringen/diensten uit landen binnen de EU' },
  '5b': { label: 'Rubriek 5b', omschrijving: 'Voorbelasting' },
}

export const RUBRIEKEN: Rubriek[] = ['1a', '1b', '1e', '2a', '3a', '3b', '4a', '4b', '5b']
