import { classifyTransaction, splitAmount } from '../btw/classify'
import type { BtwRate, Rubriek, Transaction } from '../btw/types'

export interface CategorizeAnswers {
  isPrivate: boolean
  btwRate: BtwRate
  tegenpartij?: 'nl' | 'eu' | 'buiten-eu'
  btwVerlegd?: boolean
}

export interface CategorizeResult {
  isPrivate: boolean
  btwRate: BtwRate
  btwAmount: number
  netAmount: number
  rubriek: Rubriek | null
}

/** Vertaalt de (simpele) antwoorden van de gebruiker naar de velden die op een Transaction komen. */
export function categorize(transaction: Transaction, answers: CategorizeAnswers): CategorizeResult {
  if (answers.isPrivate) {
    return {
      isPrivate: true,
      btwRate: null,
      btwAmount: 0,
      netAmount: transaction.amountGross,
      rubriek: null,
    }
  }

  const rubriek = classifyTransaction({
    isPrivate: false,
    direction: transaction.direction,
    btwRate: answers.btwRate,
    tegenpartij: answers.tegenpartij,
    btwVerlegd: answers.btwVerlegd,
  })
  const { net, btw } = splitAmount(transaction.amountGross, answers.btwRate)

  return { isPrivate: false, btwRate: answers.btwRate, btwAmount: btw, netAmount: net, rubriek }
}
