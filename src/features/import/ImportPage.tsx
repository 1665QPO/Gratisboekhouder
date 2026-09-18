import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { createId } from '../../lib/id'
import { db } from '../../db/schema'
import type { ImportBatch } from '../btw/types'
import { FileDropzone } from '../../components/FileDropzone'
import { ColumnMapper } from './components/ColumnMapper'
import { ImportPreviewTable } from './components/ImportPreviewTable'
import {
  EMPTY_MAPPING,
  guessColumnMapping,
  isMappingComplete,
  type ColumnMapping,
} from './columnMapping'
import { loadExistingHashes } from './dedupe'
import { parseImportFile, type ParsedFile } from './parseFile'
import { stageRows, stagedRowToTransaction, type StagedRow } from './stageRows'
import { applyExistingRules } from '../transactions/counterpartyRules'

type Step = 'upload' | 'mapping' | 'preview' | 'done'

export function ImportPage() {
  const [step, setStep] = useState<Step>('upload')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>(EMPTY_MAPPING)
  const [stagedRows, setStagedRows] = useState<StagedRow[]>([])
  const [directionOverride, setDirectionOverride] = useState<'auto' | 'in' | 'out'>('auto')
  const [importedCount, setImportedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const summary = useMemo(() => {
    const errors = stagedRows.filter((r) => r.error).length
    const duplicates = stagedRows.filter((r) => !r.error && r.isDuplicate).length
    const valid = stagedRows.length - errors - duplicates
    return { errors, duplicates, valid }
  }, [stagedRows])

  async function handleFile(file: File) {
    setError(null)
    setIsBusy(true)
    try {
      const result = await parseImportFile(file)
      if (result.headers.length === 0 || result.rows.length === 0) {
        throw new Error('Geen rijen gevonden in dit bestand.')
      }
      setFileName(file.name)
      setParsed(result)
      setMapping(guessColumnMapping(result.headers))
      setStep('mapping')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kon dit bestand niet lezen.')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleContinueFromMapping() {
    if (!parsed) return
    setIsBusy(true)
    try {
      const existingHashes = await loadExistingHashes()
      const override = directionOverride === 'auto' ? undefined : directionOverride
      setStagedRows(stageRows(parsed.rows, mapping, existingHashes, override))
      setStep('preview')
    } finally {
      setIsBusy(false)
    }
  }

  async function handleConfirmImport() {
    setIsBusy(true)
    try {
      const toImport = stagedRows.filter((r) => !r.error && !r.isDuplicate)
      const batch: ImportBatch = {
        id: createId(),
        filename: fileName,
        importedAt: new Date().toISOString(),
        mapping: 'handmatig toegewezen',
        rowCount: toImport.length,
      }
      const rawTransactions = toImport.map((row) => stagedRowToTransaction(row, batch.id))
      const transactions = await applyExistingRules(rawTransactions)

      await db.transaction(
        'rw',
        db.importBatches,
        db.counterpartyRules,
        db.transactions,
        async () => {
          await db.importBatches.add(batch)
          await db.transactions.bulkAdd(transactions)
        },
      )

      setImportedCount(transactions.length)
      setStep('done')
    } finally {
      setIsBusy(false)
    }
  }

  function reset() {
    setStep('upload')
    setFileName('')
    setParsed(null)
    setMapping(EMPTY_MAPPING)
    setStagedRows([])
    setDirectionOverride('auto')
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold text-stone-900">Bankafschrift of Excel importeren</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Upload een export van je bank, of je eigen bijhoudlijstje. Alles wordt lokaal in je
          browser verwerkt, er wordt niets geüpload naar een server.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'upload' && (
        <FileDropzone
          onFiles={(files) => handleFile(files[0])}
          accept=".csv,.xlsx"
          icon="📄"
          title="Sleep je bankafschrift of Excel-bestand hierheen, of klik om te kiezen"
          hint="CSV of XLSX, bijvoorbeeld een export van je bank"
        />
      )}

      {step === 'mapping' && parsed && (
        <Card className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Welke kolom is wat? ({fileName})</h2>
            <span className="text-sm text-stone-500">{parsed.rows.length} rijen gevonden</span>
          </div>
          <ColumnMapper headers={parsed.headers} mapping={mapping} onChange={setMapping} />

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Richting</span>
            <div className="flex gap-2">
              <Button
                variant={directionOverride === 'auto' ? 'primary' : 'secondary'}
                onClick={() => setDirectionOverride('auto')}
              >
                Automatisch (+ of -)
              </Button>
              <Button
                variant={directionOverride === 'out' ? 'primary' : 'secondary'}
                onClick={() => setDirectionOverride('out')}
              >
                Dit zijn allemaal uitgaven
              </Button>
              <Button
                variant={directionOverride === 'in' ? 'primary' : 'secondary'}
                onClick={() => setDirectionOverride('in')}
              >
                Dit zijn allemaal inkomsten
              </Button>
            </div>
            <span className="text-xs text-stone-500">
              Heeft je bestand geen +/- of Af/Bij-kolom, en bevat het maar één richting? Kies dat
              hier dan zelf.
            </span>
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={reset}>
              Ander bestand kiezen
            </Button>
            <Button
              onClick={handleContinueFromMapping}
              disabled={!isMappingComplete(mapping) || isBusy}
            >
              Volgende: voorbeeld bekijken
            </Button>
          </div>
        </Card>
      )}

      {step === 'preview' && (
        <div className="flex flex-col gap-4">
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-6 text-sm">
              <span>
                <strong className="text-stone-900">{summary.valid}</strong> klaar om te importeren
              </span>
              <span className="text-amber-700">
                <strong>{summary.duplicates}</strong> mogelijk dubbel
              </span>
              <span className="text-red-700">
                <strong>{summary.errors}</strong> niet leesbaar
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep('mapping')}>
                Mapping aanpassen
              </Button>
              <Button onClick={handleConfirmImport} disabled={summary.valid === 0 || isBusy}>
                Bevestig import ({summary.valid})
              </Button>
            </div>
          </Card>
          <ImportPreviewTable rows={stagedRows} />
        </div>
      )}

      {step === 'done' && (
        <Card className="flex flex-col items-start gap-4">
          <span className="text-3xl">✅</span>
          <h2 className="text-xl font-semibold text-stone-900">
            {importedCount} transacties geïmporteerd
          </h2>
          <p className="text-stone-600">
            Ze staan klaar om gecategoriseerd te worden naar het juiste btw-vakje.
          </p>
          <div className="flex gap-3">
            <Link
              to="/transacties"
              className="inline-flex items-center rounded-full bg-accent-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-700"
            >
              Bekijk transacties
            </Link>
            <Button variant="secondary" onClick={reset}>
              Nog een bestand importeren
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
