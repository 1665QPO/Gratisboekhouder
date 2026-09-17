import type { BtwRate, Rubriek } from './types'

export interface ClassificationAnswers {
  isPrivate: boolean
  direction: 'in' | 'out'
  btwRate: BtwRate
  tegenpartij?: 'nl' | 'eu' | 'buiten-eu'
  btwVerlegd?: boolean
}

/** Deterministische beslisboom: zelfde antwoorden geven altijd dezelfde rubriek. */
export function classifyTransaction(answers: ClassificationAnswers): Rubriek | null {
  if (answers.isPrivate) return null

  if (answers.direction === 'in') {
    if (answers.btwVerlegd) return '2a'
    if (answers.tegenpartij === 'buiten-eu') return '3a'
    if (answers.tegenpartij === 'eu') return '3b'
    if (answers.btwRate === 21) return '1a'
    if (answers.btwRate === 9) return '1b'
    return '1e'
  }

  if (answers.tegenpartij === 'buiten-eu') return '4a'
  if (answers.tegenpartij === 'eu') return '4b'
  return '5b'
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** Splitst een brutobedrag in het netto deel en het btw-deel op basis van het tarief. */
export function splitAmount(amountGross: number, btwRate: BtwRate): { net: number; btw: number } {
  if (!btwRate) return { net: round2(amountGross), btw: 0 }
  const net = amountGross / (1 + btwRate / 100)
  return { net: round2(net), btw: round2(amountGross - net) }
}
