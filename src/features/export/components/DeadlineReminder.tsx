import { formatDeadline, nextDeadline, periodLabel } from '../period'

const URGENT_WITHIN_DAYS = 14

function daysUntil(isoDate: string): number {
  const today = new Date()
  const todayIso = today.toISOString().slice(0, 10)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((Date.parse(isoDate) - Date.parse(todayIso)) / msPerDay)
}

/** Kleine, permanente herinnering aan de eerstvolgende btw-deadline, zichtbaar op elke pagina. */
export function DeadlineReminder() {
  const { period, deadline } = nextDeadline()
  const days = daysUntil(deadline)
  const urgent = days <= URGENT_WITHIN_DAYS

  return (
    <div
      className={`px-4 py-1.5 text-center text-xs ${
        urgent ? 'bg-amber-50 text-amber-800' : 'bg-stone-50 text-stone-500'
      }`}
    >
      Eerstvolgende btw-deadline: <strong>{formatDeadline(deadline)}</strong> (
      {periodLabel(period)}, over {days} {days === 1 ? 'dag' : 'dagen'})
    </div>
  )
}
