export type Rubriek = '1a' | '1b' | '1e' | '2a' | '3a' | '3b' | '4a' | '4b' | '5b'

export type BtwRate = 21 | 9 | 0 | null

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
  categoryId?: string
  source: 'import' | 'manual' | 'receipt'
  importBatchId?: string
  receiptId?: string
  needsReview: boolean
}

export interface CounterpartyRule {
  id: string
  matchOn: string // genormaliseerde omschrijving/tegenpartij
  categoryId?: string
  btwRate: BtwRate
  rubriek: Rubriek
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
