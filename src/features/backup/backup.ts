import { db } from '../../db/schema'
import type { CounterpartyRule, ImportBatch, Receipt, Transaction } from '../btw/types'

export interface BackupData {
  version: 1
  exportedAt: string
  transactions: Transaction[]
  counterpartyRules: CounterpartyRule[]
  importBatches: ImportBatch[]
  receipts: Array<Omit<Receipt, 'imageBlob'> & { imageBase64: string; imageType: string }>
}

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

export async function buildBackup(): Promise<BackupData> {
  const [transactions, counterpartyRules, importBatches, receipts] = await Promise.all([
    db.transactions.toArray(),
    db.counterpartyRules.toArray(),
    db.importBatches.toArray(),
    db.receipts.toArray(),
  ])

  const receiptsForExport = await Promise.all(
    receipts.map(async ({ imageBlob, ...rest }) => ({
      ...rest,
      imageBase64: await blobToBase64(imageBlob),
      imageType: imageBlob.type,
    })),
  )

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    counterpartyRules,
    importBatches,
    receipts: receiptsForExport,
  }
}

/** Downloadt de volledige boekhouding als één JSON-bestand, inclusief bonnetje-foto's. */
export async function downloadBackup(): Promise<void> {
  const data = await buildBackup()
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `boekhouder-backup-${data.exportedAt.slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export interface RestoreSummary {
  transactions: number
  receipts: number
}

/** Herstelt een back-up-bestand. Bestaande records met hetzelfde id worden overschreven, verder blijft alles staan. */
export async function restoreBackup(file: File): Promise<RestoreSummary> {
  const parsed: unknown = JSON.parse(await file.text())
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    (parsed as { version?: unknown }).version !== 1
  ) {
    throw new Error('Dit lijkt geen geldig back-up-bestand van deze app te zijn.')
  }
  const data = parsed as BackupData

  const receipts: Receipt[] = data.receipts.map(({ imageBase64, imageType, ...rest }) => ({
    ...rest,
    imageBlob: base64ToBlob(imageBase64, imageType),
  }))

  await db.transaction(
    'rw',
    db.transactions,
    db.counterpartyRules,
    db.importBatches,
    db.receipts,
    async () => {
      await db.transactions.bulkPut(data.transactions)
      await db.counterpartyRules.bulkPut(data.counterpartyRules)
      await db.importBatches.bulkPut(data.importBatches)
      await db.receipts.bulkPut(receipts)
    },
  )

  return { transactions: data.transactions.length, receipts: receipts.length }
}
