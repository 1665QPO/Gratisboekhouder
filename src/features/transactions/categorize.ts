import { classifyTransaction, splitAmount } from '../btw/classify'
import type { BtwRate, CostType, Rubriek, Transaction } from '../btw/types'

export interface CategorizeAnswers {
  isPrivate: boolean
  btwRate: BtwRate
  tegenpartij?: 'nl' | 'eu' | 'buiten-eu'
  btwVerlegd?: boolean
  /** Alleen relevant voor zakelijke uitgaven; wordt genegeerd voor privé of inkomsten. */
  costType?: CostType
  /** Creditnota aan een klant, of terugbetaling van een leverancier: zie Transaction.isCorrection. */
  isCorrection?: boolean
}

export interface CategorizeResult {
  isPrivate: boolean
  btwRate: BtwRate
  btwAmount: number
  netAmount: number
  rubriek: Rubriek | null
  costType?: CostType
  isCorrection?: boolean
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
      isCorrection: false,
    }
  }

  // Een creditnota aan een klant (geld gaat uw rekening uit) vermindert eerdere omzet, dus moet in
  // een omzetrubriek terechtkomen; een terugbetaling van een leverancier (geld komt binnen)
  // vermindert eerdere kosten, dus moet in een kostenrubriek terechtkomen. Vandaar de omgekeerde
  // richting voor de classificatie, met een negatief bedrag zodat het rubriektotaal daadwerkelijk
  // vermindert in plaats van als nieuwe omzet/kosten meetelt.
  const effectiveDirection =
    answers.isCorrection ?? false
      ? transaction.direction === 'in'
        ? 'out'
        : 'in'
      : transaction.direction
  const sign = answers.isCorrection ? -1 : 1

  const rubriek = classifyTransaction({
    isPrivate: false,
    direction: effectiveDirection,
    btwRate: answers.btwRate,
    tegenpartij: answers.tegenpartij,
    btwVerlegd: answers.btwVerlegd,
  })
  const costType =
    !answers.isCorrection && effectiveDirection === 'out' ? answers.costType : undefined

  // Rubriek 3a/3b (leveringen naar het buitenland) kennen geen omzetbelasting: het volledige
  // bedrag is de omzet, er is geen Nederlandse btw om af te splitsen. Bron: Belastingdienst,
  // "Btw-aangifte, het invullen van de verschillende rubrieken".
  if (rubriek === '3a' || rubriek === '3b') {
    return {
      isPrivate: false,
      btwRate: null,
      btwAmount: 0,
      netAmount: sign * transaction.amountGross,
      rubriek,
      costType,
      isCorrection: answers.isCorrection ?? false,
    }
  }

  const { net, btw } = splitAmount(transaction.amountGross, answers.btwRate)

  return {
    isPrivate: false,
    btwRate: answers.btwRate,
    btwAmount: sign * btw,
    netAmount: sign * net,
    rubriek,
    costType,
    isCorrection: answers.isCorrection ?? false,
  }
}
