export interface Period {
  year: number
  quarter: 1 | 2 | 3 | 4
}

export function quarterOf(isoDate: string): Period {
  const year = Number(isoDate.slice(0, 4))
  const month = Number(isoDate.slice(5, 7))
  const quarter = (Math.ceil(month / 3) as 1 | 2 | 3 | 4) || 1
  return { year, quarter }
}

export function periodLabel(period: Period): string {
  return `${period.quarter}e kwartaal ${period.year}`
}

export function periodKey(period: Period): string {
  return `${period.year}-${period.quarter}`
}

export function periodRange(period: Period): { start: string; end: string } {
  const startMonth = (period.quarter - 1) * 3 + 1
  const endMonth = startMonth + 2
  const start = `${period.year}-${String(startMonth).padStart(2, '0')}-01`
  const lastDay = new Date(Date.UTC(period.year, endMonth, 0)).getUTCDate()
  const end = `${period.year}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { start, end }
}

export function isInPeriod(isoDate: string, period: Period): boolean {
  const { start, end } = periodRange(period)
  return isoDate >= start && isoDate <= end
}

/**
 * Uiterste datum (ISO) om voor dit kwartaal aangifte te doen én te betalen: de standaard
 * kwartaalregel is "laatste dag van de maand ná het kwartaal" (bijv. Q1 -> 30 april).
 * Dit is de standaarddatum bij kwartaalaangifte; de daadwerkelijke datum voor een individuele
 * ondernemer staat in Mijn Belastingdienst Zakelijk en de jaarlijkse aangiftebrief.
 * Bron: https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/uiterste-aangifte-en-betaaldatums
 */
export function periodDeadline(period: Period): string {
  const { end } = periodRange(period)
  const endMonth = Number(end.slice(5, 7))
  const endYear = Number(end.slice(0, 4))
  const deadlineMonth = endMonth === 12 ? 1 : endMonth + 1
  const deadlineYear = endMonth === 12 ? endYear + 1 : endYear
  const lastDay = new Date(Date.UTC(deadlineYear, deadlineMonth, 0)).getUTCDate()
  return `${deadlineYear}-${String(deadlineMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

/** Leesbare Nederlandse datum, bijv. "30 april 2026". */
export function formatDeadline(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

/** Of de uiterste datum van dit tijdvak al voorbij is, t.o.v. een gegeven peildatum (default: nu). */
export function isDeadlinePassed(period: Period, today: Date = new Date()): boolean {
  const todayIso = today.toISOString().slice(0, 10)
  return todayIso > periodDeadline(period)
}

/** Alle kwartalen waarin minstens één transactie valt, meest recente eerst. */
export function availablePeriods(dates: string[]): Period[] {
  const seen = new Map<string, Period>()
  for (const date of dates) {
    const period = quarterOf(date)
    seen.set(periodKey(period), period)
  }
  return Array.from(seen.values()).sort((a, b) => b.year - a.year || b.quarter - a.quarter)
}
