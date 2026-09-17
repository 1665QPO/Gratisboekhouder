import Dexie, { type EntityTable } from 'dexie'
import type { CounterpartyRule, ImportBatch, Receipt, Transaction } from '../features/btw/types'

class BoekhouderDB extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  counterpartyRules!: EntityTable<CounterpartyRule, 'id'>
  receipts!: EntityTable<Receipt, 'id'>
  importBatches!: EntityTable<ImportBatch, 'id'>

  constructor() {
    super('zzp-boekhouder')
    this.version(1).stores({
      transactions: 'id, date, direction, rubriek, needsReview, importBatchId, receiptId',
      counterpartyRules: 'id, matchOn',
      receipts: 'id, status, linkedTransactionId',
      importBatches: 'id, importedAt',
    })
  }
}

export const db = new BoekhouderDB()
