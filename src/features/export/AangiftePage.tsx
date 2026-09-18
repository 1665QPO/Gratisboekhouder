import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { db } from '../../db/schema'
import { formatCurrency } from '../../lib/currency'
import { calculateAangifteTotaal } from '../btw/aangifte'
import { RUBRIEK_INFO } from '../btw/rubrieken'
import { calculateTotals, type RubriekTotal } from '../btw/totals'
import type { Rubriek } from '../btw/types'
import { PeriodSelector } from './components/PeriodSelector'
import { downloadAangifteExcel } from './exportAangifte'
import {
  availablePeriods,
  formatDeadline,
  isDeadlinePassed,
  isInPeriod,
  periodDeadline,
  periodKey,
  periodLabel,
  type Period,
} from './period'

const GROUPS: { title: string; rubrieken: Rubriek[] }[] = [
  { title: 'Binnenland (omzet)', rubrieken: ['1a', '1b', '1e'] },
  { title: 'Verlegd / buitenland', rubrieken: ['2a', '3a', '3b', '4a', '4b'] },
  { title: 'Voorbelasting (kosten)', rubrieken: ['5b'] },
]

function DeadlineBanner({ period }: { period: Period }) {
  const deadline = periodDeadline(period)
  const passed = isDeadlinePassed(period)
  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm ${
        passed ? 'bg-stone-100 text-stone-600' : 'bg-sky-50 text-sky-800'
      }`}
    >
      Uiterste datum indienen én betalen voor {periodLabel(period)}:{' '}
      <strong>{formatDeadline(deadline)}</strong>.{passed && ' Deze datum is al voorbij.'} Dit is de
      standaarddatum bij kwartaalaangifte; de datum die voor jou geldt staat in Mijn Belastingdienst
      Zakelijk en je aangiftebrief.
    </div>
  )
}

function RubriekRow({ total }: { total: RubriekTotal }) {
  return (
    <tr>
      <td className="whitespace-nowrap px-4 py-2 font-medium text-stone-900">
        {RUBRIEK_INFO[total.rubriek].label}
      </td>
      <td className="px-4 py-2 text-stone-600">{RUBRIEK_INFO[total.rubriek].omschrijving}</td>
      <td className="whitespace-nowrap px-4 py-2 text-right">{formatCurrency(total.net)}</td>
      <td className="whitespace-nowrap px-4 py-2 text-right">{formatCurrency(total.btw)}</td>
      <td className="whitespace-nowrap px-4 py-2 text-right text-stone-500">{total.count}</td>
    </tr>
  )
}

export function AangiftePage() {
  const transactions = useLiveQuery(() => db.transactions.toArray(), [])
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  if (transactions === undefined) {
    return <p className="text-stone-500">Bezig met laden…</p>
  }

  if (transactions.length === 0) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <h1 className="text-xl font-semibold text-stone-900">Nog geen aangifte-overzicht</h1>
        <p className="text-stone-600">
          Importeer of categoriseer eerst transacties om hier per kwartaal je btw-overzicht te zien.
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

  const periods = availablePeriods(transactions.map((t) => t.date))
  const period: Period = periods.find((p) => periodKey(p) === selectedPeriodKey) ?? periods[0]

  const periodTransactions = transactions.filter((t) => isInPeriod(t.date, period))
  const needsReviewCount = periodTransactions.filter((t) => t.needsReview).length
  const totals = calculateTotals(periodTransactions)
  const totalsByRubriek = new Map(totals.map((t) => [t.rubriek, t]))
  const aangifteTotaal = calculateAangifteTotaal(totals)
  const moetBetalen = aangifteTotaal.saldo >= 0

  async function handleExport() {
    setIsExporting(true)
    try {
      await downloadAangifteExcel(period, totals, periodTransactions, aangifteTotaal)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-stone-900">Aangifte-overzicht</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            De bedragen per rubriek voor het gekozen kwartaal, precies zoals je ze overneemt in het
            portaal van de Belastingdienst.
          </p>
        </div>
        <PeriodSelector
          periods={periods}
          value={period}
          onChange={(p) => setSelectedPeriodKey(periodKey(p))}
        />
      </div>

      <DeadlineBanner period={period} />

      {needsReviewCount > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{needsReviewCount}</strong> transactie{needsReviewCount === 1 ? '' : 's'} in{' '}
          {periodLabel(period)} {needsReviewCount === 1 ? 'is' : 'zijn'} nog niet gecategoriseerd en
          zit{needsReviewCount === 1 ? '' : 'ten'} daarom nog niet in de bedragen hieronder.{' '}
          <Link to="/transacties" className="underline">
            Categoriseer ze eerst
          </Link>
          .
        </div>
      )}

      {totals.length === 0 ? (
        <Card>
          <p className="text-stone-600">
            Geen gecategoriseerde transacties in {periodLabel(period)}.
          </p>
        </Card>
      ) : (
        <Card className="flex flex-col gap-6">
          {GROUPS.map((group) => {
            const rows = group.rubrieken
              .map((r) => totalsByRubriek.get(r))
              .filter((t): t is RubriekTotal => t !== undefined)
            if (rows.length === 0) return null
            return (
              <div key={group.title} className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                  {group.title}
                </h2>
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-sm">
                    <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                      <tr>
                        <th className="px-4 py-2">Rubriek</th>
                        <th className="px-4 py-2">Omschrijving</th>
                        <th className="px-4 py-2 text-right">Netto</th>
                        <th className="px-4 py-2 text-right">Btw</th>
                        <th className="px-4 py-2 text-right">Aantal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {rows.map((total) => (
                        <RubriekRow key={total.rubriek} total={total} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}

          <div className="flex flex-col gap-3 border-t border-stone-100 pt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Eindtotaal (rubriek 5)
            </h2>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">5a: verschuldigde btw</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(aangifteTotaal.verschuldigd)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">5b: voorbelasting</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(aangifteTotaal.voorbelasting)}
                </span>
              </div>
            </div>
            <div
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                moetBetalen ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'
              }`}
            >
              <span className="font-semibold">
                {moetBetalen ? 'U moet betalen' : 'U krijgt terug'}
              </span>
              <span className="text-lg font-semibold">
                {formatCurrency(Math.abs(aangifteTotaal.saldo))}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-400">
            Zeldzame rubrieken (1c, 1d privégebruik auto, 3c) worden nog niet ondersteund. Komt dit
            op jou van toepassing, vul die apart in het portaal van de Belastingdienst aan, dan
            wijkt het eindtotaal hierboven af van je werkelijke aangifte. Gebruik je de
            kleineondernemersregeling (KOR)? Dan hoef je meestal helemaal geen btw-aangifte te doen,
            en is dit overzicht niet op jou van toepassing.
          </p>

          <div className="flex justify-end border-t border-stone-100 pt-4">
            <Button onClick={handleExport} disabled={isExporting}>
              Download als Excel
            </Button>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Badge tone="neutral">{periodTransactions.length} transacties in dit kwartaal</Badge>
      </div>
    </div>
  )
}
