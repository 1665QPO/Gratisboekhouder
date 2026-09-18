import { Badge } from '../../../components/Badge'
import { formatCurrency } from '../../../lib/currency'
import type { StagedRow } from '../stageRows'

interface ImportPreviewTableProps {
  rows: StagedRow[]
}

function StatusBadge({ row }: { row: StagedRow }) {
  if (row.error) return <Badge tone="danger">{row.error}</Badge>
  if (row.isDuplicate) return <Badge tone="warning">Mogelijk dubbel</Badge>
  return <Badge tone="success">Klaar om te importeren</Badge>
}

export function ImportPreviewTable({ rows }: ImportPreviewTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200">
      <table className="min-w-full divide-y divide-stone-200 text-sm">
        <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-4 py-2">Datum</th>
            <th className="px-4 py-2">Omschrijving</th>
            <th className="px-4 py-2">Tegenpartij</th>
            <th className="px-4 py-2 text-right">Bedrag</th>
            <th className="px-4 py-2">Richting</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((row) => (
            <tr
              key={row.rowIndex}
              className={row.error ? 'bg-red-50' : row.isDuplicate ? 'bg-amber-50' : ''}
            >
              <td className="whitespace-nowrap px-4 py-2">{row.date ?? '-'}</td>
              <td className="px-4 py-2">{row.description || '-'}</td>
              <td className="px-4 py-2">{row.counterparty || '-'}</td>
              <td className="whitespace-nowrap px-4 py-2 text-right">
                {row.amountGross !== null ? formatCurrency(Math.abs(row.amountGross)) : '-'}
              </td>
              <td className="px-4 py-2">{row.direction === 'in' ? 'Inkomsten' : 'Uitgaven'}</td>
              <td className="px-4 py-2">
                <StatusBadge row={row} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
