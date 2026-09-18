import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { FileDropzone } from '../../components/FileDropzone'
import { db } from '../../db/schema'
import { formatCurrency } from '../../lib/currency'
import { createId } from '../../lib/id'
import type { Transaction } from '../btw/types'
import { findMatchingTransactions } from './matchTransaction'
import { processReceipt } from './processReceipt'

type Step = 'upload' | 'processing' | 'confirm' | 'done'

export function ReceiptsPage() {
  const [step, setStep] = useState<Step>('upload')
  const [error, setError] = useState<string | null>(null)
  const [displayBlob, setDisplayBlob] = useState<Blob | null>(null)
  const [displayUrl, setDisplayUrl] = useState<string | null>(null)
  const [rawText, setRawText] = useState('')
  const [showRawText, setShowRawText] = useState(false)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [vendor, setVendor] = useState('')
  const [matches, setMatches] = useState<Transaction[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setStep('processing')
    try {
      const result = await processReceipt(file)
      setDisplayBlob(result.displayBlob)
      setDisplayUrl(URL.createObjectURL(result.displayBlob))
      setRawText(result.rawText)
      setAmount(result.amount !== null ? result.amount.toFixed(2) : '')
      setDate(result.date ?? '')
      setVendor('')
      setShowRawText(false)

      const found = await findMatchingTransactions(result.amount, result.date)
      setMatches(found)
      setSelectedMatchId(found[0]?.id ?? null)
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon dit bestand niet verwerken.')
      setStep('upload')
    }
  }

  function parsedAmount(): number | null {
    const value = Number(amount.replace(',', '.'))
    return Number.isFinite(value) && value > 0 ? value : null
  }

  async function handleConfirm() {
    const value = parsedAmount()
    if (!displayBlob || value === null || !date) return

    const receiptId = createId()

    await db.transaction('rw', db.receipts, db.transactions, async () => {
      if (selectedMatchId) {
        await db.transactions.update(selectedMatchId, { receiptId })
      } else {
        const transaction: Transaction = {
          id: createId(),
          date,
          description: vendor.trim() || 'Bonnetje',
          counterparty: vendor.trim() || undefined,
          amountGross: value,
          direction: 'out',
          isPrivate: false,
          businessPortion: 1,
          btwRate: null,
          btwAmount: 0,
          netAmount: value,
          rubriek: null,
          source: 'receipt',
          receiptId,
          needsReview: true,
        }
        await db.transactions.add(transaction)
      }

      await db.receipts.add({
        id: receiptId,
        imageBlob: displayBlob,
        uploadedAt: new Date().toISOString(),
        ocrRawText: rawText,
        extractedAmount: value,
        extractedDate: date,
        extractedVendor: vendor.trim() || undefined,
        linkedTransactionId: selectedMatchId ?? undefined,
        status: 'confirmed',
      })
    })

    setStep('done')
  }

  function reset() {
    if (displayUrl) URL.revokeObjectURL(displayUrl)
    setStep('upload')
    setError(null)
    setDisplayBlob(null)
    setDisplayUrl(null)
    setRawText('')
    setShowRawText(false)
    setAmount('')
    setDate('')
    setVendor('')
    setMatches([])
    setSelectedMatchId(null)
  }

  const nothingRecognized = amount === '' && date === ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-stone-900">Bonnetje uploaden</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Foto of PDF van een bonnetje of factuur. Herkenning gebeurt volledig in je browser — er
          wordt geen foto ergens naartoe gestuurd.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <FileDropzone
          onFile={handleFile}
          accept=".pdf,.jpg,.jpeg,.png,.heic,.heif,image/*"
          icon="🧾"
          title="Sleep een foto of PDF van je bonnetje hierheen, of klik om te kiezen"
          hint="JPG, PNG, HEIC (iPhone-foto's) of PDF"
        />
      )}

      {step === 'processing' && (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="animate-pulse text-3xl">🔎</span>
          <p className="font-medium text-stone-800">Bezig met herkennen…</p>
          <p className="text-sm text-stone-500">Dit kan bij een foto een paar seconden duren.</p>
        </Card>
      )}

      {step === 'confirm' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {displayUrl && displayBlob?.type === 'application/pdf' ? (
            <Card className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="text-4xl">📄</span>
              <p className="text-sm text-stone-600">PDF-bestand — geen voorbeeld in de browser</p>
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-accent-700 underline"
              >
                Open in nieuw tabblad
              </a>
            </Card>
          ) : (
            displayUrl && (
              <Card className="flex items-center justify-center p-2">
                <img
                  src={displayUrl}
                  alt="Bonnetje"
                  className="max-h-96 rounded-lg object-contain"
                />
              </Card>
            )
          )}

          <Card className="flex flex-col gap-4">
            {nothingRecognized && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Kon niets automatisch herkennen — vul de gegevens hieronder zelf in.
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-700">Bedrag</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-700">Datum</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-stone-700">Leverancier (optioneel)</span>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="bijv. Groenhart"
                className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>

            {matches.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-stone-700">
                  Dit bonnetje lijkt te horen bij:
                </span>
                {matches.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm has-[:checked]:border-accent-400 has-[:checked]:bg-accent-50"
                  >
                    <input
                      type="radio"
                      name="match"
                      checked={selectedMatchId === m.id}
                      onChange={() => setSelectedMatchId(m.id)}
                    />
                    <span>
                      {m.date} — {m.description || 'Zonder omschrijving'} —{' '}
                      {formatCurrency(m.amountGross)}
                    </span>
                  </label>
                ))}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm has-[:checked]:border-accent-400 has-[:checked]:bg-accent-50">
                  <input
                    type="radio"
                    name="match"
                    checked={selectedMatchId === null}
                    onChange={() => setSelectedMatchId(null)}
                  />
                  <span>Geen van deze — nieuwe transactie aanmaken</span>
                </label>
              </div>
            )}

            {rawText && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowRawText((v) => !v)}
                  className="text-sm text-accent-700 underline"
                >
                  {showRawText ? 'Verberg' : 'Toon'} herkende ruwe tekst
                </button>
                {showRawText && (
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-xs text-stone-600">
                    {rawText}
                  </pre>
                )}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="secondary" onClick={reset}>
                Annuleren
              </Button>
              <Button onClick={handleConfirm} disabled={parsedAmount() === null || !date}>
                Bonnetje opslaan
              </Button>
            </div>
          </Card>
        </div>
      )}

      {step === 'done' && (
        <Card className="flex flex-col items-start gap-4">
          <span className="text-3xl">✅</span>
          <h2 className="text-xl font-semibold text-stone-900">Bonnetje opgeslagen</h2>
          <p className="text-stone-600">
            De foto is bewaard bij de transactie, klaar voor je bewaarplicht.
          </p>
          <div className="flex gap-3">
            <Link
              to="/transacties"
              className="inline-flex items-center rounded-full bg-accent-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-700"
            >
              Bekijk transacties
            </Link>
            <Button variant="secondary" onClick={reset}>
              Nog een bonnetje uploaden
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
