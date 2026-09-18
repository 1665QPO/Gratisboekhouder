export type Rubriek = '1a' | '1b' | '1e' | '2a' | '3a' | '3b' | '4a' | '4b' | '5b'

export type BtwRate = 21 | 9 | 0 | null

/**
 * Alleen relevant voor zakelijke uitgaven, en (nog) niet gebruikt voor de btw-aangifte zelf.
 * Vastgelegd zodat een latere IB-aangifte (winst uit onderneming) niet alle kosten opnieuw hoeft
 * te laten beoordelen: 'investering' moet je afschrijven over meerdere jaren, 'kosten' niet.
 */
export type CostType = 'kosten' | 'investering'

export interface Transaction {
  id: string
  date: string // ISO yyyy-mm-dd
  description: string
  counterparty?: string
  amountGross: number
  direction: 'in' | 'out'
  isPrivate: boolean
  businessPortion: number // 0-1, default 1
  btwRate: BtwRate
  btwAmount: number
  netAmount: number
  rubriek: Rubriek | null
  costType?: CostType
  source: 'import' | 'manual' | 'receipt'
  importBatchId?: string
  receiptId?: string
  needsReview: boolean
}

export interface CounterpartyRule {
  id: string
  matchOn: string // genormaliseerde omschrijving/tegenpartij
  btwRate: BtwRate
  rubriek: Rubriek | null
  isPrivate: boolean
}

export interface Receipt {
  id: string
  imageBlob: Blob
  uploadedAt: string
  ocrRawText?: string
  extractedAmount?: number
  extractedDate?: string
  extractedVendor?: string
  linkedTransactionId?: string
  status: 'pending' | 'confirmed'
}

export interface ImportBatch {
  id: string
  filename: string
  importedAt: string
  mapping: 'automatisch herkend' | 'handmatig toegewezen'
  rowCount: number
}
