import { useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { downloadBackup, restoreBackup } from './backup'

export function BackupControls() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  async function handleDownload() {
    setIsBusy(true)
    setMessage(null)
    try {
      await downloadBackup()
    } catch {
      setMessage({ tone: 'error', text: 'Kon geen back-up maken.' })
    } finally {
      setIsBusy(false)
    }
  }

  async function handleRestoreFile(file: File) {
    setIsBusy(true)
    setMessage(null)
    try {
      const summary = await restoreBackup(file)
      setMessage({
        tone: 'success',
        text: `Back-up hersteld: ${summary.transactions} transacties en ${summary.receipts} bonnetjes.`,
      })
    } catch (err) {
      setMessage({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Kon deze back-up niet herstellen.',
      })
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleDownload} disabled={isBusy}>
          Download back-up
        </Button>
        <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={isBusy}>
          Herstel back-up
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleRestoreFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {message && (
        <p
          className={`text-sm ${message.tone === 'success' ? 'text-emerald-700' : 'text-red-700'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
