import type { ColumnMapping } from '../columnMapping'

interface FieldConfig {
  key: keyof ColumnMapping
  label: string
  required: boolean
  hint?: string
}

const FIELDS: FieldConfig[] = [
  { key: 'date', label: 'Datum', required: true },
  { key: 'description', label: 'Omschrijving', required: true },
  { key: 'amount', label: 'Bedrag', required: true },
  { key: 'counterparty', label: 'Tegenpartij / rekening', required: false },
  {
    key: 'debitCreditIndicator',
    label: 'Af/Bij-indicator',
    required: false,
    hint: 'Alleen nodig als de kolom "Bedrag" zelf geen + of - heeft',
  },
]

interface ColumnMapperProps {
  headers: string[]
  mapping: ColumnMapping
  onChange: (mapping: ColumnMapping) => void
}

export function ColumnMapper({ headers, mapping, onChange }: ColumnMapperProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((field) => (
        <label key={field.key} className="flex flex-col gap-1">
          <span className="text-sm font-medium text-stone-700">
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
          </span>
          <select
            value={mapping[field.key] ?? ''}
            onChange={(event) => onChange({ ...mapping, [field.key]: event.target.value || null })}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          >
            <option value="">— geen —</option>
            {headers.map((header) => (
              <option key={header} value={header}>
                {header}
              </option>
            ))}
          </select>
          {field.hint && <span className="text-xs text-stone-400">{field.hint}</span>}
        </label>
      ))}
    </div>
  )
}
