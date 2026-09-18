import { useState } from 'react'
import { Button } from '../../../components/Button'
import { db } from '../../../db/schema'
import type { BtwRate, Transaction } from '../../btw/types'
import { categorize, type CategorizeAnswers } from '../categorize'
import { counterpartyKey, saveRuleAndApplyToExisting } from '../counterpartyRules'

interface CategorizeFormProps {
  transaction: Transaction
  onSaved: (appliedToOtherCount: number) => void
  onCancel: () => void
}

export function CategorizeForm({ transaction, onSaved, onCancel }: CategorizeFormProps) {
  const [isPrivate, setIsPrivate] = useState(transaction.isPrivate)
  const [btwRate, setBtwRate] = useState<BtwRate>(transaction.btwRate ?? 21)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [tegenpartij, setTegenpartij] = useState<'nl' | 'eu' | 'buiten-eu'>('nl')
  const [btwVerlegd, setBtwVerlegd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const key = counterpartyKey(transaction)
  const partnerLabel = transaction.counterparty || transaction.description

  async function handleSave() {
    setIsSaving(true)
    const answers: CategorizeAnswers = {
      isPrivate,
      btwRate,
      tegenpartij: tegenpartij === 'nl' ? undefined : tegenpartij,
      btwVerlegd: btwVerlegd || undefined,
    }
    try {
      if (remember && key) {
        const appliedToOtherCount = await saveRuleAndApplyToExisting(transaction, answers)
        onSaved(appliedToOtherCount)
      } else {
        await db.transactions.update(transaction.id, {
          ...categorize(transaction, answers),
          needsReview: false,
        })
        onSaved(0)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <Button variant={!isPrivate ? 'primary' : 'secondary'} onClick={() => setIsPrivate(false)}>
          Zakelijk
        </Button>
        <Button variant={isPrivate ? 'primary' : 'secondary'} onClick={() => setIsPrivate(true)}>
          Privé
        </Button>
      </div>

      {!isPrivate && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-stone-700">Btw-tarief</span>
            <div className="flex gap-2">
              <Button
                variant={btwRate === 21 ? 'primary' : 'secondary'}
                onClick={() => setBtwRate(21)}
              >
                21%
              </Button>
              <Button
                variant={btwRate === 9 ? 'primary' : 'secondary'}
                onClick={() => setBtwRate(9)}
              >
                9%
              </Button>
              <Button
                variant={btwRate === 0 ? 'primary' : 'secondary'}
                onClick={() => setBtwRate(0)}
              >
                0% / geen btw
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="self-start text-sm text-accent-700 underline"
          >
            {showAdvanced
              ? 'Verberg geavanceerde opties'
              : 'Geavanceerd (buitenland / verlegde btw)'}
          </button>

          {showAdvanced && (
            <div className="flex flex-col gap-3 rounded-lg bg-stone-50 p-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-stone-700">Tegenpartij zit in</span>
                <select
                  value={tegenpartij}
                  onChange={(e) => setTegenpartij(e.target.value as typeof tegenpartij)}
                  className="rounded-lg border border-stone-300 px-2 py-1"
                >
                  <option value="nl">Nederland</option>
                  <option value="eu">Binnen de EU</option>
                  <option value="buiten-eu">Buiten de EU</option>
                </select>
              </label>
              {transaction.direction === 'in' && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={btwVerlegd}
                    onChange={(e) => setBtwVerlegd(e.target.checked)}
                  />
                  Btw is verlegd naar de afnemer
                </label>
              )}
            </div>
          )}
        </>
      )}

      {key && (
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          Onthoud deze keuze voor toekomstige transacties van &quot;{partnerLabel}&quot;
        </label>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Annuleren
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          Opslaan
        </Button>
      </div>
    </div>
  )
}
