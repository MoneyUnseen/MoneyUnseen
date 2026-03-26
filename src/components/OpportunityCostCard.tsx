import { useState } from 'react'
import { getCurrencySymbol } from '../types'
import type { Currency } from '../types'

interface OpportunityCostCardProps {
  monthlyAmount: number
  currency: Currency
  isUnlocked: boolean
  onLockClick: () => void
}

// Future Value of regular monthly contributions with compound interest
// FV = PMT × [((1 + r)^n - 1) / r]
function futureValue(monthly: number, annualRate: number, years: number): number {
  const r = annualRate / 12
  const n = years * 12
  if (r === 0) return monthly * n
  return monthly * ((Math.pow(1 + r, n) - 1) / r)
}

const RATES = [
  { label: '5%', value: 0.05, description: 'Conservative (bonds/savings)' },
  { label: '7%', value: 0.07, description: 'World index ETF (historical avg)' },
  { label: '10%', value: 0.10, description: 'Aggressive (equities)' },
]

const HORIZONS = [10, 20, 30]

export default function OpportunityCostCard({ monthlyAmount, currency, isUnlocked, onLockClick }: OpportunityCostCardProps) {
  const [selectedRate, setSelectedRate] = useState(1) // default 7%
  const sym = getCurrencySymbol(currency)
  const rate = RATES[selectedRate].value

  const results = HORIZONS.map(years => ({
    years,
    fv: futureValue(monthlyAmount, rate, years),
    invested: monthlyAmount * 12 * years,
  }))

  const maxFv = results[results.length - 1].fv

  return (
    <div
      onClick={!isUnlocked ? onLockClick : undefined}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        isUnlocked
          ? 'border-purple-200 bg-purple-50'
          : 'border-purple-200 bg-purple-50 hover:border-purple-400 cursor-pointer'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">📈</span>
          <div>
            <div className="font-semibold text-gray-900 flex items-center gap-2">
              Build real wealth
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                Long term
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-0.5">
              {sym}{monthlyAmount.toFixed(0)}/month invested with compound interest
            </div>
          </div>
        </div>
        {isUnlocked && (
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-gray-800">
              {sym}{Math.round(results[2].fv).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">in 30 years</div>
          </div>
        )}
        {!isUnlocked && (
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: '1.1rem' }}>🔒</span>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'system-ui' }}>unlock</span>
          </div>
        )}
      </div>

      {isUnlocked && (
        <>
          {/* Rate selector */}
          <div className="flex gap-1.5 mb-4">
            {RATES.map((r, i) => (
              <button
                key={r.label}
                onClick={e => { e.stopPropagation(); setSelectedRate(i) }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedRate === i
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-purple-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 mb-4 -mt-2">{RATES[selectedRate].description}</div>

          {/* Horizon bars */}
          <div className="space-y-3">
            {results.map(({ years, fv, invested }) => {
              const barPct = Math.round((fv / maxFv) * 100)
              const gain = fv - invested
              const gainPct = Math.round((gain / invested) * 100)

              return (
                <div key={years}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-sm font-semibold text-gray-600">{years} years</span>
                    <div className="text-right">
                      <span className={`font-bold ${years === 30 ? 'text-xl text-purple-700' : years === 20 ? 'text-lg text-purple-600' : 'text-base text-gray-700'}`}>
                        {sym}{Math.round(fv).toLocaleString()}
                      </span>
                      <span className="text-xs text-green-600 ml-2">+{gainPct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full flex" style={{ width: `${barPct}%` }}>
                      {/* Invested portion */}
                      <div
                        className="h-full bg-purple-200"
                        style={{ width: `${Math.round((invested / fv) * 100)}%` }}
                      />
                      {/* Gains portion */}
                      <div className="h-full bg-purple-500 flex-1" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>{sym}{Math.round(invested).toLocaleString()} invested</span>
                    <span className="text-purple-500">+{sym}{Math.round(gain).toLocaleString()} returns</span>
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            Based on {RATES[selectedRate].label} annual return, compounded monthly. Past performance of indices doesn't guarantee future results.
          </p>
        </>
      )}

      {!isUnlocked && (
        <div className="mt-1 text-xs text-purple-600 font-medium">
          💡 Small monthly savings compound into life-changing amounts
        </div>
      )}
    </div>
  )
}
