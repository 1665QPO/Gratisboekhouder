import { periodKey, periodLabel, type Period } from '../period'

interface PeriodSelectorProps {
  periods: Period[]
  value: Period
  onChange: (period: Period) => void
}

export function PeriodSelector({ periods, value, onChange }: PeriodSelectorProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-stone-700">Kwartaal</span>
      <select
        value={periodKey(value)}
        onChange={(e) => {
          const found = periods.find((p) => periodKey(p) === e.target.value)
          if (found) onChange(found)
        }}
        className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
      >
        {periods.map((p) => (
          <option key={periodKey(p)} value={periodKey(p)}>
            {periodLabel(p)}
          </option>
        ))}
      </select>
    </label>
  )
}
