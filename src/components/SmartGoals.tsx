import { useState } from 'react'
import type { UserGoal, Currency } from '../types'
import { getCurrencySymbol } from '../types'

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
}: SmartGoalsProps) {
  const sym = getCurrencySymbol(currency)
  const [showGate, setShowGate] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isUnlocked = !!email

  if (suggestedGoals.length === 0) return null

  const handleGoalClick = (goal: UserGoal) => {
    if (!isUnlocked) {
      setShowGate(true)
      return
    }
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
        body: JSON.stringify({
          email: emailInput,
          _subject: 'MoneyUnseen — Goal unlock',
          monthlySavings,
        }),
      })
      onEmailSubmit(emailInput)
      setShowGate(false)
    } catch {
      // still unlock locally even if formspree fails
      onEmailSubmit(emailInput)
      setShowGate(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-hidden" style={{ border: '1.5px solid #bbf7d0' }}>
      {/* Header — prominent green */}
      <div style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '1.4rem' }}>💡</span>
          <h3 style={{ fontFamily: 'system-ui', fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            {totalSavings > 0
              ? `What could you do with your ${sym}${monthlySavings.toFixed(0)}/month savings?`
              : suggestedPauseSubName
                ? `What if you paused ${suggestedPauseSubName}?`
                : `What could you do with ${sym}${monthlySavings.toFixed(0)}/month?`}
          </h3>
        </div>
        <p style={{ fontFamily: 'system-ui', fontSize: '0.82rem', color: '#dcfce7', margin: 0, lineHeight: 1.5 }}>
          {totalSavings > 0
            ? (isUnlocked ? "Here\'s what your savings can become." : 'Choose a goal to see your personal savings plan.')
            : suggestedPauseSubName
              ? `That\'s ${sym}${monthlySavings.toFixed(0)}/month back in your pocket — here\'s what you could do with it.`
              : 'Choose a goal to unlock your personal savings plan.'}
        </p>
      </div>

      {/* Goals */}
      <div className="px-6 pb-6 space-y-3">
        {suggestedGoals.map((goal) => {
          const isSelected = selectedGoalIds.includes(goal.id)
          const isLongTerm = goal.type === 'longterm'

          return (
            <button
              key={goal.id}
              onClick={() => handleGoalClick(goal)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : isLongTerm
                  ? 'border-purple-200 bg-purple-50 hover:border-purple-400'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{goal.emoji}</span>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {goal.title}
                      {isLongTerm && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Long term
                        </span>
                      )}
                    </div>
                    <div className={`text-sm mt-0.5 ${!isUnlocked && isLongTerm ? "text-gray-300 blur-sm select-none" : "text-gray-500"}`}>{goal.description}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {isUnlocked ? (
                    <>
                      <div className="text-lg font-bold text-gray-800">
                        {sym}{goal.targetAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {goal.monthsToGoal === 120
                          ? 'in 10 years'
                          : `in ${goal.monthsToGoal} month${goal.monthsToGoal !== 1 ? 's' : ''}`}
                      </div>
                    </>
                  ) : (
                    <div className="text-lg font-bold text-gray-300 blur-sm select-none">
                      {sym}???
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar for selected goals */}
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

              {/* Long term compounding note */}
              {isLongTerm && !isUnlocked && (
                <div className="mt-2 text-xs text-purple-600 font-medium">
                  💡 Small monthly savings compound into life-changing amounts
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Email gate */}
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

      {/* Unlocked state — all goals selected prompt */}
      {isUnlocked && selectedGoalIds.length === 0 && (
        <div className="border-t border-gray-100 px-6 py-4 text-center text-sm text-gray-400">
          Tap a goal to track your progress toward it
        </div>
      )}
    </div>
  )
}
