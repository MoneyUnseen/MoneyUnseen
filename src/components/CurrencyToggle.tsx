import { useState, useEffect, useRef } from 'react'
import type { Currency } from '../types'

interface CurrencyToggleProps {
  currency: Currency
  onChange: (currency: Currency) => void
}

const CURRENCIES: { code: Currency; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', label: 'Danish Krone' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
]

// Map country codes to currencies
const COUNTRY_CURRENCY_MAP: Record<string, Currency> = {
  NL: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR',
  BE: 'EUR', AT: 'EUR', FI: 'EUR', IE: 'EUR', GR: 'EUR', LU: 'EUR',
  GB: 'GBP',
  US: 'USD', PH: 'USD', PA: 'USD',
  CH: 'CHF', LI: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  AU: 'AUD',
  CA: 'CAD',
  JP: 'JPY',
}

export default function CurrencyToggle({ currency, onChange }: CurrencyToggleProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Detect currency from IP on first load
  useEffect(() => {
    const detected = localStorage.getItem('moneyunseen-currency-detected')
    if (detected) return // already detected once, respect user's choice

    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const country = data?.country_code as string
        const detected = COUNTRY_CURRENCY_MAP[country]
        if (detected && detected !== currency) {
          onChange(detected)
        }
        localStorage.setItem('moneyunseen-currency-detected', '1')
      })
      .catch(() => {
        // silently fail, keep default
        localStorage.setItem('moneyunseen-currency-detected', '1')
      })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 transition-all"
      >
        <span>{selected.symbol}</span>
        <span>{selected.code}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                c.code === currency ? 'text-purple-700 font-semibold' : 'text-gray-700'
              }`}
            >
              <span className="w-8 text-right font-mono text-gray-500">{c.symbol}</span>
              <span>{c.code}</span>
              <span className="text-gray-400 text-xs ml-auto">{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
