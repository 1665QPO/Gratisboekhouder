import type { AangifteTotaal } from '../btw/aangifte'
import { RUBRIEK_INFO } from '../btw/rubrieken'
import type { RubriekTotal } from '../btw/totals'
import type { Transaction } from '../btw/types'
import { periodLabel, type Period } from './period'

const HEADER_STYLE = { fontWeight: 'bold' } as const
const EUR_FORMAT = '0.00'

function summarySheetRows(totals: RubriekTotal[], aangifteTotaal: AangifteTotaal) {
  const header = [
    { value: 'Rubriek', ...HEADER_STYLE },
    { value: 'Omschrijving', ...HEADER_STYLE },
    { value: 'Netto (EUR)', ...HEADER_STYLE },
    { value: 'Btw (EUR)', ...HEADER_STYLE },
    { value: 'Aantal transacties', ...HEADER_STYLE },
  ]
  const rows = totals.map((t) => [
    { value: t.rubriek, type: String },
    { value: RUBRIEK_INFO[t.rubriek].omschrijving, type: String },
    { value: t.net, type: Number, format: EUR_FORMAT },
    { value: t.btw, type: Number, format: EUR_FORMAT },
    { value: t.count, type: Number },
  ])
  const emptyRow = Array.from({ length: 5 }, () => ({ value: '', type: String }))
  const eindtotaalRows = [
    emptyRow,
    [
      { value: '5a', type: String },
      { value: 'Verschuldigde btw', type: String },
      { value: '', type: String },
      { value: aangifteTotaal.verschuldigd, type: Number, format: EUR_FORMAT },
      { value: '', type: String },
    ],
    [
      { value: '5b', type: String },
      { value: 'Voorbelasting', type: String },
      { value: '', type: String },
      { value: aangifteTotaal.voorbelasting, type: Number, format: EUR_FORMAT },
      { value: '', type: String },
    ],
    [
      { value: '', ...HEADER_STYLE },
      {
        value: aangifteTotaal.saldo >= 0 ? 'Saldo: u moet betalen' : 'Saldo: u krijgt terug',
        ...HEADER_STYLE,
      },
      { value: '', type: String },
      { value: Math.abs(aangifteTotaal.saldo), type: Number, format: EUR_FORMAT, ...HEADER_STYLE },
      { value: '', type: String },
    ],
  ]
  return [header, ...rows, ...eindtotaalRows]
}

function detailSheetRows(transactions: Transaction[]) {
  const header = [
    { value: 'Datum', ...HEADER_STYLE },
    { value: 'Omschrijving', ...HEADER_STYLE },
    { value: 'Tegenpartij', ...HEADER_STYLE },
    { value: 'Richting', ...HEADER_STYLE },
    { value: 'Bedrag incl. btw (EUR)', ...HEADER_STYLE },
    { value: 'Netto (EUR)', ...HEADER_STYLE },
    { value: 'Btw (EUR)', ...HEADER_STYLE },
    { value: 'Btw-tarief', ...HEADER_STYLE },
    { value: 'Rubriek', ...HEADER_STYLE },
    { value: 'Soort kosten', ...HEADER_STYLE },
    { value: 'Heeft bonnetje', ...HEADER_STYLE },
  ]
  const rows = transactions.map((t) => [
    { value: t.date, type: String },
    { value: t.description, type: String },
    { value: t.counterparty ?? '', type: String },
    { value: t.direction === 'in' ? 'Inkomsten' : 'Uitgaven', type: String },
    { value: t.amountGross, type: Number, format: EUR_FORMAT },
    { value: t.netAmount, type: Number, format: EUR_FORMAT },
    { value: t.btwAmount, type: Number, format: EUR_FORMAT },
    { value: t.btwRate ?? 0, type: Number },
    { value: t.rubriek ?? '', type: String },
    { value: t.costType ?? '', type: String },
    { value: t.receiptId ? 'Ja' : 'Nee', type: String },
  ])
  return [header, ...rows]
}

/** Downloadt het btw-overzicht van een kwartaal als Excel: samenvatting per rubriek + volledige detaillijst. */
export async function downloadAangifteExcel(
  period: Period,
  totals: RubriekTotal[],
  transactions: Transaction[],
  aangifteTotaal: AangifteTotaal,
): Promise<void> {
  const writeXlsxFile = (await import('write-excel-file/browser')).default

  const file = writeXlsxFile([
    {
      sheet: `Btw ${periodLabel(period)}`.slice(0, 31),
      data: summarySheetRows(totals, aangifteTotaal),
      columns: [{ width: 10 }, { width: 45 }, { width: 14 }, { width: 14 }, { width: 18 }],
    },
    {
      sheet: 'Details',
      data: detailSheetRows(transactions),
      columns: [
        { width: 12 },
        { width: 35 },
        { width: 25 },
        { width: 12 },
        { width: 16 },
        { width: 14 },
        { width: 14 },
        { width: 10 },
        { width: 10 },
        { width: 14 },
        { width: 12 },
      ],
    },
  ])

  await file.toFile(`btw-aangifte-${period.year}-q${period.quarter}.xlsx`)
}
