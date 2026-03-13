import { useState } from 'react'
import type { Currency } from '../types'
import { getCurrencySymbol } from '../types'

interface FixedCostNudgeProps {
  subCount: number
  currency: Currency
  onAddFixedCost: () => void
  onDismiss: () => void
}

export default function FixedCostNudge({ subCount, currency, onAddFixedCost, onDismiss }: FixedCostNudgeProps) {
  const sym = getCurrencySymbol(currency)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss()
  }

  return (
    <div style={{
      borderRadius: 16,
      background: 'linear-gradient(135deg, #1e1b4b 0%, #2C2269 100%)',
      padding: '1.25rem 1.25rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background circle */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }} />

      <div className="flex items-start gap-3">
        <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: 2 }}>🏠</span>
        <div className="flex-1">
          <p style={{ color: '#e0d9ff', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 0.35rem' }}>
            You've added {subCount} subscriptions — nice start.
          </p>
          <p style={{ color: '#a89fd4', fontSize: '0.8rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
            Most people find their fixed costs — mortgage, insurance, utilities — are 10× bigger than their subscriptions. Adding them gives you the real picture of what you're working with each month.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onAddFixedCost}
              style={{
                background: '#7c3aed', color: '#fff',
                border: 'none', borderRadius: 8,
                padding: '0.5rem 1rem', fontSize: '0.8rem',
                fontWeight: 600, cursor: 'pointer',
                fontFamily: 'system-ui',
              }}
            >
              Add fixed costs
            </button>
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent', color: '#7c6eaa',
                border: 'none', borderRadius: 8,
                padding: '0.5rem 0.75rem', fontSize: '0.8rem',
                fontWeight: 500, cursor: 'pointer',
                fontFamily: 'system-ui',
              }}
            >
              I'll add more subscriptions first
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
