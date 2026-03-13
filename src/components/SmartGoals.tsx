import { useState } from 'react'
import type { UserGoal, Currency } from '../types'
import { getCurrencySymbol } from '../types'
import OpportunityCostCard from './OpportunityCostCard'

interface SmartGoalsProps {
  suggestedGoals: UserGoal[]
  selectedGoalIds: string[]
  onToggleGoal: (goal: UserGoal) => void
  monthlySavings: number
  totalSavings: number
  suggestedPauseSubName?: string
  currency: Currency
  email: string | undefined
  onEmailSubmit: (email: string) => void
  fixedMonthly: number
  subsMonthly: number
  variableMonthly: number
}

export default function SmartGoals({
  suggestedGoals,
  selectedGoalIds,
  onToggleGoal,
  monthlySavings,
  totalSavings,
  suggestedPauseSubName,
  currency,
  email,
  onEmailSubmit,
  fixedMonthly,
  subsMonthly,
  variableMonthly,
}: SmartGoalsProps) {
  const sym = getCurrencySymbol(currency)
  const totalTracked = fixedMonthly + subsMonthly + variableMonthly
  const [showGate, setShowGate] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isUnlocked = !!email
  const [goalChoice, setGoalChoice] = useState<null | 'goals' | 'more'>(null)

  if (suggestedGoals.length === 0) return null

  const handleGoalClick = (goal: UserGoal) => {
    if (!isUnlocked) { setShowGate(true); return }
    onToggleGoal(goal)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailInput) return
    setSubmitting(true)
    try {
      await fetch('https://formspree.io/f/xjkvolod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, _subject: 'MoneyUnseen — Goal unlock', monthlySavings }),
      })
      onEmailSubmit(emailInput)
      setShowGate(false)
    } catch {
      onEmailSubmit(emailInput)
      setShowGate(false)
    } finally {
      setSubmitting(false)
    }
  }

  const showGoals = goalChoice === 'goals' || totalSavings === 0

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden" style={{ background: 'linear-gradient(175deg, #16a34a 0%, #15803d 100%)' }}>

      {/* RECAP HEADER */}
      <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.2rem' }}>💡</span>
          <h3 style={{ fontFamily: 'system-ui', fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0, opacity: 0.9 }}>
            Your full monthly picture
          </h3>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>🏠 Fixed costs</span>
              <span style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{sym}{fixedMonthly.toFixed(0)}/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>📱 Subscriptions</span>
              <span style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{sym}{subsMonthly.toFixed(0)}/mo</span>
            </div>
            {variableMonthly > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'system-ui', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>🛒 Variable (estimated)</span>
                <span style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{sym}{variableMonthly.toFixed(0)}/mo</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: '0.3rem', paddingTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Estimated total</span>
              <span style={{ fontFamily: 'system-ui', fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>{sym}{totalTracked.toFixed(0)}/mo</span>
            </div>
          </div>
        </div>

        {totalSavings > 0 && (
          <div style={{
            background: '#fff', borderRadius: 12, padding: '0.9rem 1rem', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <div>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, margin: '0 0 0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Already reclaimed 🎉
              </p>
              <p style={{ fontFamily: 'system-ui', fontSize: '1.4rem', fontWeight: 800, color: '#14532d', margin: 0, lineHeight: 1 }}>
                {sym}{monthlySavings.toFixed(0)}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#16a34a' }}>/month</span>
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.72rem', color: '#9ca3af', margin: '0 0 0.1rem' }}>that's</p>
              <p style={{ fontFamily: 'system-ui', fontSize: '1.15rem', fontWeight: 700, color: '#15803d', margin: 0 }}>
                {sym}{(monthlySavings * 12).toFixed(0)}/year
              </p>
            </div>
          </div>
        )}

        {totalSavings > 0 && goalChoice === null && (
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontFamily: 'system-ui', fontSize: '0.9rem', fontWeight: 700, color: '#fff', margin: '0 0 0.75rem' }}>
              What do you want to do next?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                onClick={() => setGoalChoice('goals')}
                style={{
                  background: '#fff', borderRadius: 12, padding: '0.85rem 1rem',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🎯</span>
                <div>
                  <p style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 700, color: '#14532d', margin: 0 }}>
                    See what {sym}{monthlySavings.toFixed(0)}/mo can become
                  </p>
                  <p style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                    Goals, timelines, compound interest
                  </p>
                </div>
                <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: 700, fontSize: '1.1rem' }}>›</span>
              </button>
              <button
                onClick={() => { setGoalChoice('more'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '0.85rem 1rem',
                  border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>💡</span>
                <div>
                  <p style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                    Find more savings first
                  </p>
                  <p style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    Check what else you could pause or cancel
                  </p>
                </div>
                <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '1.1rem' }}>›</span>
              </button>
            </div>
          </div>
        )}

        {/* After "Find more savings first" — keep the goals CTA visible */}
        {totalSavings > 0 && goalChoice === 'more' && (
          <div style={{ marginBottom: '0.75rem' }}>
            <button
              onClick={() => setGoalChoice('goals')}
              style={{
                width: '100%', background: '#fff', borderRadius: 12, padding: '0.85rem 1rem',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>🎯</span>
              <div>
                <p style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 700, color: '#14532d', margin: 0 }}>
                  See what {sym}{monthlySavings.toFixed(0)}/mo can become
                </p>
                <p style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  Goals, timelines, compound interest
                </p>
              </div>
              <span style={{ marginLeft: 'auto', color: '#16a34a', fontWeight: 700, fontSize: '1.1rem' }}>›</span>
            </button>
          </div>
        )}

        {showGoals && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <h3 style={{ fontFamily: 'system-ui', fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                {totalSavings > 0
                  ? `What could you do with that ${sym}${monthlySavings.toFixed(0)}/month?`
                  : suggestedPauseSubName
                    ? `What if you paused ${suggestedPauseSubName}?`
                    : `What could you do with ${sym}${monthlySavings.toFixed(0)}/month?`}
              </h3>
            </div>
            <p style={{ fontFamily: 'system-ui', fontSize: '0.82rem', color: '#bbf7d0', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
              {isUnlocked ? "Here's what those savings could actually become." : "Here's what those savings could become."}
            </p>
            {!isUnlocked && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(255,255,255,0.18)', borderRadius: 20,
                padding: '0.35rem 0.85rem', marginBottom: '1rem',
                border: '1px solid rgba(255,255,255,0.35)',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', fontFamily: 'system-ui' }}>
                  👆 Tap a goal below to unlock your plan
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* GOAL CARDS */}
      {showGoals && (
        <div className="px-4 pb-5 space-y-2.5">
          {suggestedGoals.map((goal) => {
            const isSelected = selectedGoalIds.includes(goal.id)
            const isLongTerm = goal.type === 'longterm'

            if (isLongTerm) {
              return (
                <OpportunityCostCard
                  key={goal.id}
                  monthlyAmount={monthlySavings}
                  currency={currency}
                  isUnlocked={isUnlocked}
                  onLockClick={() => setShowGate(true)}
                />
              )
            }

            return (
              <button
                key={goal.id}
                onClick={() => handleGoalClick(goal)}
                className="w-full text-left rounded-xl p-4 transition-all"
                style={{
                  background: isSelected ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.88)',
                  border: isSelected ? '2px solid #fff' : '2px solid rgba(255,255,255,0.4)',
                  boxShadow: isSelected ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{goal.title}</div>
                      <div className="text-sm mt-0.5 text-gray-500">{goal.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUnlocked ? (
                      <div className="text-right">
                        <div className="text-base font-bold text-gray-800">
                          {sym}{goal.targetAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {goal.monthsToGoal === 120
                            ? 'in 10 years'
                            : `in ${goal.monthsToGoal} month${goal.monthsToGoal !== 1 ? 's' : ''}`}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-0.5">
                        <span style={{ fontSize: '1.1rem' }}>🔒</span>
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontFamily: 'system-ui' }}>unlock</span>
                      </div>
                    )}
                    <span style={{
                      fontSize: '1rem',
                      color: isSelected ? '#16a34a' : '#9ca3af',
                      transition: 'transform 0.2s, color 0.2s',
                      display: 'inline-block',
                      transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)',
                      fontWeight: 700,
                    }}>›</span>
                  </div>
                </div>

                {isSelected && isUnlocked && goal.monthsToGoal && goal.monthsToGoal < 120 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                        style={{ width: `${Math.min((1 / goal.monthsToGoal) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Month 1 of {goal.monthsToGoal}</div>
                  </div>
                )}

                {isLongTerm && !isUnlocked && (
                  <div className="mt-2 text-xs text-purple-600 font-medium">
                    💡 Small monthly savings compound into life-changing amounts
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* EMAIL GATE */}
      {showGate && !isUnlocked && (
        <div className="border-t border-gray-100 bg-gradient-to-br from-purple-50 to-white px-6 py-6">
          <div className="text-center mb-4">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="font-bold text-gray-900 mb-1">Unlock your personal savings plan</h4>
            <p className="text-sm text-gray-500">
              We'll calculate exactly how fast you can reach your goals — and send you the results.
            </p>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
            >
              {submitting ? 'Unlocking...' : 'Show me my plan →'}
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-3">
            No spam. We hate it too. Unsubscribe anytime.
          </p>
          <button
            onClick={() => setShowGate(false)}
            className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      )}

      {/* BOTTOM HINT */}
      {isUnlocked && showGoals && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.2)',
          padding: '0.85rem 1.5rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: selectedGoalIds.length === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
          transition: 'color 0.4s ease',
          fontWeight: selectedGoalIds.length === 0 ? 600 : 400,
          background: 'transparent',
        }}>
          {selectedGoalIds.length === 0
            ? '👆 Tap a goal above to track your progress toward it'
            : 'Tap another goal to track it too'}
        </div>
      )}
    </div>
  )
}
