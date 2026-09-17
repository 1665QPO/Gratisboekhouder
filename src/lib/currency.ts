/**
 * Parseert een bedrag uit een bank-export naar een number.
 * Bank-CSV's gebruiken wisselende conventies (NL: "1.234,56", EN: "1,234.56", of
 * gewoon "1234.56"). We bepalen het decimaalteken aan de hand van het scheidingsteken
 * dat het dichtst bij het einde staat: op een geldbedrag volgen nooit meer dan 2 cijfers
 * na het echte decimaalteken, dus 3 cijfers erna betekent een duizendtal-scheiding.
 */
export function parseAmount(raw: string | number): number {
  if (typeof raw === 'number') return raw
  let s = raw.trim().replace(/[€\s]/g, '')
  if (s === '') return NaN

  let negative = false
  if (s.startsWith('(') && s.endsWith(')')) {
    negative = true
    s = s.slice(1, -1)
  }
  if (s.startsWith('-')) {
    negative = true
    s = s.slice(1)
  } else if (s.startsWith('+')) {
    s = s.slice(1)
  }

  const lastSeparator = s.match(/[.,](\d*)$/)
  if (lastSeparator && lastSeparator[1].length <= 2) {
    const decimalIndex = s.length - lastSeparator[0].length
    const wholePart = s.slice(0, decimalIndex).replace(/[.,]/g, '')
    const fractionPart = lastSeparator[1]
    s = fractionPart ? `${wholePart}.${fractionPart}` : wholePart
  } else {
    s = s.replace(/[.,]/g, '')
  }

  const value = Number(s)
  if (Number.isNaN(value)) return NaN
  return negative ? -value : value
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount)
}
