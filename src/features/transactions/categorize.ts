import { classifyTransaction, splitAmount } from '../btw/classify'
import type { BtwRate, CostType, Rubriek, Transaction } from '../btw/types'

export interface CategorizeAnswers {
  isPrivate: boolean
  btwRate: BtwRate
  tegenpartij?: 'nl' | 'eu' | 'buiten-eu'
  btwVerlegd?: boolean
  /** Alleen relevant voor zakelijke uitgaven; wordt genegeerd voor privé of inkomsten. */
  costType?: CostType
}

export interface CategorizeResult {
  isPrivate: boolean
  btwRate: BtwRate
  btwAmount: number
  netAmount: number
  rubriek: Rubriek | null
  costType?: CostType
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
      costType: undefined,
    }
  }

  const rubriek = classifyTransaction({
    isPrivate: false,
    direction: transaction.direction,
    btwRate: answers.btwRate,
    tegenpartij: answers.tegenpartij,
    btwVerlegd: answers.btwVerlegd,
  })
  const costType = transaction.direction === 'out' ? answers.costType : undefined

  // Rubriek 3a/3b (leveringen naar het buitenland) kennen geen omzetbelasting: het volledige
  // bedrag is de omzet, er is geen Nederlandse btw om af te splitsen. Bron: Belastingdienst,
  // "Btw-aangifte, het invullen van de verschillende rubrieken".
  if (rubriek === '3a' || rubriek === '3b') {
    return {
      isPrivate: false,
      btwRate: null,
      btwAmount: 0,
      netAmount: transaction.amountGross,
      rubriek,
      costType,
    }
  }

  const { net, btw } = splitAmount(transaction.amountGross, answers.btwRate)

  return {
    isPrivate: false,
    btwRate: answers.btwRate,
    btwAmount: btw,
    netAmount: net,
    rubriek,
    costType,
  }
}
