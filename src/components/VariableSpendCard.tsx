import { useState } from 'react'
import type { Currency } from '../types'
import { getCurrencySymbol, getMonthlyEquivalent } from '../types'
import type { Subscription } from '../types'
import { isFixedCostCategory } from '../types'

interface VariableSpendCardProps {
  subscriptions: Subscription[]
  currency: Currency
}

const VARIABLE_CATEGORIES = [
  { key: 'groceries',  label: 'Groceries',         emoji: '🛒', placeholder: '400' },
  { key: 'fuel',       label: 'Fuel / Transport',   emoji: '⛽', placeholder: '150' },
  { key: 'dining',     label: 'Dining out / Cafés', emoji: '🍽️', placeholder: '120' },
  { key: 'clothing',   label: 'Clothing',           emoji: '👗', placeholder: '60'  },
  { key: 'health',     label: 'Health / Pharmacy',  emoji: '💊', placeholder: '30'  },
  { key: 'kids',       label: 'Kids / Activities',  emoji: '🧒', placeholder: '80'  },
  { key: 'other',      label: 'Other variable',     emoji: '🪙', placeholder: '100' },
]

export default function VariableSpendCard({ subscriptions, currency }: VariableSpendCardProps) {
  const sym = getCurrencySymbol(currency)
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(() =>
    !!localStorage.getItem('moneyunseen-variable-dismissed')
  )
  const [values, setValues] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(() => {
    const stored = localStorage.getItem('moneyunseen-variable-spend')
    return stored ? JSON.parse(stored) as Record<string, number> : null
  })

  if (dismissed) return null

  const isFixed = (s: Subscription) => s.isFixedCost || isFixedCostCategory(s.category)

  const fixedMonthly = subscriptions
    .filter(s => isFixed(s) && s.isActive && !s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const subsMonthly = subscriptions
    .filter(s => !isFixed(s) && s.isActive && !s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const trackedTotal = fixedMonthly + subsMonthly

  // When form is open (expanded), always compute from live values
  // When showing summary, compute from saved
  const variableTotal = expanded
    ? Object.values(values).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
    : saved
      ? Object.values(saved).reduce((a, b) => a + b, 0)
      : 0

  const grandTotal = trackedTotal + variableTotal

  const handleSave = () => {
    const parsed: Record<string, number> = {}
    for (const [k, v] of Object.entries(values)) {
      const n = parseFloat(v)
      if (n > 0) parsed[k] = n
    }
    localStorage.setItem('moneyunseen-variable-spend', JSON.stringify(parsed))
    setSaved(parsed)
    setExpanded(false)
    // Notify App.tsx so the green recap section updates immediately
    window.dispatchEvent(new Event('moneyunseen-variable-updated'))
  }

  const handleDismiss = () => {
    localStorage.setItem('moneyunseen-variable-dismissed', '1')
    setDismissed(true)
  }

  // Summary view — after saving: compact edit-only strip
  if (saved && !expanded) {
    return (
      <div style={{
        borderRadius: 12, background: '#f5f3ff',
        border: '1px solid #e9d5ff', padding: '0.6rem 1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'system-ui' }}>
          🛒 Variable spend estimated at <strong style={{ color: '#374151' }}>{sym}{variableTotal.toFixed(0)}/mo</strong>
        </span>
        <button
          onClick={() => {
          // Pre-populate form with previously saved values
          if (saved) {
            const asStrings: Record<string, string> = {}
            for (const [k, v] of Object.entries(saved)) asStrings[k] = String(v)
            setValues(asStrings)
          }
          setExpanded(true)
        }}
          style={{ fontSize: '0.75rem', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'system-ui', fontWeight: 600, flexShrink: 0, marginLeft: '0.75rem' }}
        >
          Edit
        </button>
      </div>
    )
  }

  // Invite card — before expanding
  if (!expanded) {
    return (
      <div style={{
        borderRadius: 16, background: '#faf5ff',
        border: '2px solid #c4b5fd', padding: '1.4rem',
        boxShadow: '0 2px 12px rgba(124,58,237,0.08)',
      }}>
        <div className="flex items-start gap-3">
          <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>💡</span>
          <div className="flex-1">
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1f2937', margin: '0 0 0.5rem' }}>
              Want to see the full picture?
            </p>
            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.6, margin: '0 0 1.1rem' }}>
              You're already tracking <strong style={{ color: '#1f2937' }}>{sym}{trackedTotal.toFixed(0)}/month</strong> in fixed costs and subscriptions.
              Add a rough estimate of groceries, fuel and dining out — and you'll see exactly where your money goes each month. No surprises.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
          if (saved) {
            const asStrings: Record<string, string> = {}
            for (const [k, v] of Object.entries(saved)) asStrings[k] = String(v)
            setValues(asStrings)
          }
          setExpanded(true)
        }}
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '0.6rem 1.3rem', fontSize: '0.88rem',
                  fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                }}
              >
                Yes, show me
              </button>
              <button
                onClick={handleDismiss}
                style={{
                  background: 'none', color: '#9ca3af', border: 'none',
                  fontSize: '0.85rem', cursor: 'pointer',
                  fontFamily: 'system-ui', padding: '0.6rem 0.5rem',
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Input form
  return (
    <div style={{
      borderRadius: 16, background: '#fff',
      border: '1.5px solid #e9d5ff', padding: '1.25rem',
    }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1.1rem' }}>📊</span>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>
            Estimate your variable spend
          </span>
        </div>
        <button onClick={() => setExpanded(false)}
          style={{ fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
          ×
        </button>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0 0 1rem', lineHeight: 1.5 }}>
        Rough estimates are fine — this stays on your device and is never shared.
      </p>

      <div className="space-y-2.5 mb-4">
        {VARIABLE_CATEGORIES.map(cat => (
          <div key={cat.key} className="flex items-center gap-3">
            <span style={{ fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 }}>{cat.emoji}</span>
            <label style={{ fontSize: '0.82rem', color: '#374151', flex: 1, fontFamily: 'system-ui' }}>
              {cat.label}
            </label>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <span style={{
                position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
                fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'system-ui',
              }}>{sym}</span>
              <input
                type="number"
                min="0"
                placeholder={cat.placeholder}
                value={values[cat.key] || ''}
                onChange={e => setValues(v => ({ ...v, [cat.key]: e.target.value }))}
                style={{
                  width: 90, paddingLeft: sym.length > 1 ? 36 : 22, paddingRight: 8,
                  paddingTop: 7, paddingBottom: 7,
                  border: '1.5px solid #e5e7eb', borderRadius: 8,
                  fontSize: '0.82rem', fontFamily: 'system-ui', color: '#1f2937',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Running total */}
      {variableTotal > 0 && (
        <div style={{
          background: '#f5f3ff', borderRadius: 10,
          padding: '0.75rem 1rem', marginBottom: '1rem',
        }}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Fixed + Subscriptions</span>
            <span className="font-semibold text-gray-700">{sym}{trackedTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Variable (estimated)</span>
            <span className="font-semibold text-gray-700">{sym}{variableTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-purple-800">Estimated total</span>
            <span className="text-purple-700 text-base">{sym}{grandTotal.toFixed(0)}/mo</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={variableTotal === 0}
          style={{
            flex: 1, background: variableTotal > 0 ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#e5e7eb',
            color: variableTotal > 0 ? '#fff' : '#9ca3af',
            border: 'none', borderRadius: 8, padding: '0.6rem',
            fontSize: '0.85rem', fontWeight: 600, cursor: variableTotal > 0 ? 'pointer' : 'default',
            fontFamily: 'system-ui',
          }}
        >
          Save my estimates
        </button>
        <button
          onClick={() => setExpanded(false)}
          style={{
            padding: '0.6rem 1rem', background: '#f3f4f6',
            color: '#6b7280', border: 'none', borderRadius: 8,
            fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'system-ui',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
