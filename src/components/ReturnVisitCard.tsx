import { useEffect, useState } from 'react'
import { getCurrencySymbol } from '../types'
import type { Currency } from '../types'

const STORAGE_KEY = 'moneyunseen-last-visit'
const HOURS_THRESHOLD = 4  // show after 4+ hours away

interface ReturnVisitCardProps {
  totalSavings: number   // monthly savings already reclaimed
  potentialMore: number  // additional monthly savings possible
  currency?: Currency
  onDismiss?: () => void
}

export default function ReturnVisitCard({
  totalSavings, potentialMore, currency = 'EUR', onDismiss
}: ReturnVisitCardProps) {
  const [show, setShow] = useState(false)
  const sym = getCurrencySymbol(currency)

  useEffect(() => {
    const last = localStorage.getItem(STORAGE_KEY)
    const now = Date.now()

    if (last) {
      const hoursAway = (now - parseInt(last)) / (1000 * 60 * 60)
      if (hoursAway >= HOURS_THRESHOLD && totalSavings > 0) {
        setShow(true)
      }
    }

    // Update timestamp on every visit
    localStorage.setItem(STORAGE_KEY, String(now))

    // Also update on tab visibility change (mobile-proof)
    const handleVisibility = () => {
      if (document.hidden) {
        localStorage.setItem(STORAGE_KEY, String(Date.now()))
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [totalSavings])

  const handleDismiss = () => {
    setShow(false)
    onDismiss?.()
  }

  if (!show) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #2C2269 0%, #7c3aed 100%)',
      borderRadius: 16,
      padding: '1rem 1.2rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.8rem',
      boxShadow: '0 4px 20px rgba(124,58,237,0.25)',
      animation: 'slideDown 0.3s ease',
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ flex: 1 }}>
        <div style={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>
          👋 Welcome back.
        </div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem', lineHeight: 1.4 }}>
          {totalSavings > 0 && (
            <>Saving <strong style={{ color: 'white' }}>{sym}{totalSavings.toFixed(0)}/mo</strong> already. </>
          )}
          {potentialMore > 0 && (
            <><strong style={{ color: '#86efac' }}>{sym}{potentialMore.toFixed(0)} more</strong> waiting. 💜</>
          )}
          {potentialMore === 0 && totalSavings > 0 && (
            <>That's <strong style={{ color: '#86efac' }}>{sym}{(totalSavings * 12).toFixed(0)}/year</strong>. Keep it up! 💜</>
          )}
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          borderRadius: 8,
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          padding: '0.3rem 0.5rem',
          fontSize: '1rem',
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}
