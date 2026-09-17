import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Card } from '../../components/Card'
import { db } from '../../db/schema'
import { formatCurrency } from '../../lib/currency'

export function TransactionsPage() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), [])

  if (transactions === undefined) {
    return <p className="text-stone-500">Bezig met laden…</p>
  }

  if (transactions.length === 0) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <h1 className="text-xl font-semibold text-stone-900">Nog geen transacties</h1>
        <p className="text-stone-600">
          Importeer eerst een bankafschrift of Excel-bestand om hier je transacties te zien.
        </p>
        <Link
          to="/import"
          className="inline-flex items-center rounded-full bg-accent-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-700"
        >
          Naar importeren
        </Link>
      </Card>
    )
  }

  const needsReviewCount = transactions.filter((t) => t.needsReview).length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-stone-900">Transacties</h1>
        <p className="mt-2 text-stone-600">
          {transactions.length} transacties in totaal, waarvan{' '}
          <strong>{needsReviewCount} nog te categoriseren</strong>.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-2">Datum</th>
              <th className="px-4 py-2">Omschrijving</th>
              <th className="px-4 py-2">Tegenpartij</th>
              <th className="px-4 py-2 text-right">Bedrag</th>
              <th className="px-4 py-2">Rubriek</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="whitespace-nowrap px-4 py-2">{t.date}</td>
                <td className="px-4 py-2">{t.description || '—'}</td>
                <td className="px-4 py-2">{t.counterparty || '—'}</td>
                <td
                  className={`whitespace-nowrap px-4 py-2 text-right ${
                    t.direction === 'in' ? 'text-emerald-700' : 'text-stone-700'
                  }`}
                >
                  {t.direction === 'in' ? '+' : '−'}
                  {formatCurrency(t.amountGross)}
                </td>
                <td className="px-4 py-2">{t.rubriek ?? '—'}</td>
                <td className="px-4 py-2">
                  {t.isPrivate ? (
                    <Badge tone="neutral">Privé</Badge>
                  ) : t.needsReview ? (
                    <Badge tone="warning">Nog categoriseren</Badge>
                  ) : (
                    <Badge tone="success">Gecategoriseerd</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
