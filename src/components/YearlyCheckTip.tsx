import { getCurrencySymbol } from '../types'
import type { Currency } from '../types'

interface YearlyCheckTipProps {
  subName: string
  monthlyCost: number
  currency?: Currency
  onDismiss: () => void
}

export default function YearlyCheckTip({ subName, monthlyCost, currency = 'EUR', onDismiss }: YearlyCheckTipProps) {
  const sym = getCurrencySymbol(currency)
  // Example: €15/mo → if yearly is ~20% cheaper → €12/mo = €36/yr saved
  const estimatedYearly = monthlyCost * 10  // typical: 2 months free = ~17% off
  const estimatedMonthlySaving = monthlyCost - (estimatedYearly / 12)
  const yearlySaving = Math.round(estimatedMonthlySaving * 12)

  return (
    <div style={{
      borderRadius: 12,
      background: 'linear-gradient(135deg, #eef2ff, #f0f4ff)',
      border: '1.5px solid #c7d2fe',
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.65rem',
      animation: 'fadeIn 0.25s ease',
    }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:translateY(0) } }`}</style>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'system-ui', fontSize: '0.83rem', fontWeight: 700, color: '#3730a3', margin: '0 0 0.2rem' }}>
          Does {subName} offer a yearly plan?
        </p>
        <p style={{ fontFamily: 'system-ui', fontSize: '0.78rem', color: '#4338ca', margin: 0, lineHeight: 1.5 }}>
          Many monthly subscriptions are cheaper when paid yearly — often saving{' '}
          <strong>{sym}{yearlySaving}+/year</strong>. Worth a quick check before the next renewal.
        </p>
      </div>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818cf8', fontSize: '1rem', flexShrink: 0, padding: 0, lineHeight: 1 }}
        aria-label="Dismiss"
      >✕</button>
    </div>
  )
}
