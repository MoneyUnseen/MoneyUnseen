import { useState, useMemo, useEffect } from 'react'
import { useSubscriptions, useProfile } from './hooks/useData'
import TwoWorldsView from './components/TwoWorldsView'
import SmartGoals from './components/SmartGoals'
import CurrencyToggle from './components/CurrencyToggle'
import SubscriptionList from './components/SubscriptionList'
import AddSubscriptionForm from './components/AddSubscriptionForm'
import Confetti from './components/Confetti'
import OnboardingWizard from './components/OnboardingWizard'
import { getMonthlyEquivalent, generateSmartGoals, isFixedCostCategory } from './types'
import SaveMoreModal from './components/SaveMoreModal'
import FixedCostNudge from './components/FixedCostNudge'
import VariableSpendCard from './components/VariableSpendCard'
import ReturnVisitCard from './components/ReturnVisitCard'
import YearlyCheckTip from './components/YearlyCheckTip'

function App() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, cancelSubscription, reactivateSubscription, stopSubscription, loading: subsLoading } = useSubscriptions()
  const { profile, toggleGoal, setEmail, setCurrency, loading: profileLoading } = useProfile()

  const [showAddForm, setShowAddForm] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('moneyunseen-onboarded')
  })
  const [saveMoreModal, setSaveMoreModal] = useState<{ amount: number } | null>(null)
  const [showRenewalTip, setShowRenewalTip] = useState(false)
  const [fixedNudgeDismissed, setFixedNudgeDismissed] = useState(() =>
    !!localStorage.getItem('moneyunseen-fixed-nudge-dismissed')
  )
  // Email nudge: show once after 4th item added (gratis users)
  const [showEmailNudge, setShowEmailNudge] = useState(false)
  // Renewal date nudge: show after email nudge is dismissed, if 3+ items have no renewal date
  const [showRenewalDateNudge, setShowRenewalDateNudge] = useState(false)
  // Items without renewal date highlighted
  const [highlightNoDates, setHighlightNoDates] = useState(false)

  const handleEmailNudgeDismiss = () => {
    setShowEmailNudge(false)
    // Sequential: check if we should show renewal date nudge
    const noDates = subscriptions.filter(
      s => !s.isFixedCost && s.isActive && !s.isStopped &&
      (!s.renewalDate || new Date(s.renewalDate).getFullYear() <= new Date().getFullYear())
    )
    if (noDates.length >= 3 && !localStorage.getItem('moneyunseen-renewal-date-nudge-shown')) {
      setShowRenewalDateNudge(true)
      localStorage.setItem('moneyunseen-renewal-date-nudge-shown', '1')
    }
  }
  // Yearly tip: show after adding a monthly subscription
  const [yearlyTip, setYearlyTip] = useState<{ name: string; cost: number } | null>(null)

  const currency = profile?.currency ?? 'EUR'

  const totalMonthlySpend = subscriptions
    .filter(s => s.isActive && !s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const totalPausedMonthly = subscriptions
    .filter(s => !s.isActive && !s.isStopped && !s.isFixedCost && !isFixedCostCategory(s.category))
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const totalStoppedMonthly = subscriptions
    .filter(s => s.isStopped && !s.isFixedCost && !isFixedCostCategory(s.category))
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const totalSavings = totalPausedMonthly + totalStoppedMonthly

  // Pausable categories — logical to pause/stop
  const PAUSABLE_CATEGORIES = ['streaming', 'music', 'gaming', 'news', 'software', 'food', 'sports_club', 'hobby_club', 'lottery']
  const suggestedPauseSub = subscriptions
    .filter(s => s.isActive && !s.isStopped && !s.isFixedCost && !isFixedCostCategory(s.category) && PAUSABLE_CATEGORIES.includes(s.category))
    .sort((a, b) => getMonthlyEquivalent(a.cost, a.frequency) - getMonthlyEquivalent(b.cost, b.frequency))[0]

  const subCount = subscriptions.filter(s => !s.isFixedCost && !isFixedCostCategory(s.category)).length
  const fixedCount = subscriptions.filter(s => s.isFixedCost || isFixedCostCategory(s.category)).length
  const totalItemCount = subscriptions.length

  // Show fixed cost nudge: 3+ subs, no fixed costs yet, not dismissed
  const showFixedNudge = subCount >= 3 && fixedCount === 0 && !fixedNudgeDismissed

  // Show variable spend card: 7+ items total with at least 2 fixed costs
  const showVariableSpend = totalItemCount >= 7 && fixedCount >= 2

  const savingsBasis = totalSavings > 0 ? totalSavings : (suggestedPauseSub ? getMonthlyEquivalent(suggestedPauseSub.cost, suggestedPauseSub.frequency) : totalMonthlySpend)

  // Reactive variable spend — re-reads whenever VariableSpendCard saves
  const readVariableTotal = () => {
    try {
      const stored = localStorage.getItem('moneyunseen-variable-spend')
      if (!stored) return 0
      const parsed = JSON.parse(stored)
      return Object.values(parsed as Record<string, number>).reduce((s: number, v) => s + (Number(v) || 0), 0)
    } catch { return 0 }
  }
  const [variableMonthlyForRecap, setVariableMonthlyForRecap] = useState(readVariableTotal)
  useEffect(() => {
    const handler = () => setVariableMonthlyForRecap(readVariableTotal())
    window.addEventListener('moneyunseen-variable-updated', handler)
    return () => window.removeEventListener('moneyunseen-variable-updated', handler)
  }, [])

  // Separate fixed vs active subscription monthly totals for recap
  const fixedMonthlyForRecap = subscriptions
    .filter(s => s.isActive && !s.isStopped && (s.isFixedCost || isFixedCostCategory(s.category)))
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const subsMonthlyForRecap = subscriptions
    .filter(s => s.isActive && !s.isStopped && !s.isFixedCost && !isFixedCostCategory(s.category))
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
  const suggestedGoals = useMemo(() => generateSmartGoals(savingsBasis, currency), [savingsBasis, currency])

  if (subsLoading || profileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">💜</div>
          <div className="text-xl font-semibold text-gray-700">Loading MoneyUnseen...</div>
        </div>
      </div>
    )
  }

  const handleAddSubscription = async (subscription: Parameters<typeof addSubscription>[0]) => {
    await addSubscription(subscription)
    setShowAddForm(false)
    if (subscriptions.length === 0 || subscriptions.length % 5 === 0) setShowConfetti(true)
    // Show renewal tip once after first subscription (not fixed costs)
    if (!subscription.isFixedCost && subscriptions.filter(s => !s.isFixedCost).length === 0
        && !localStorage.getItem('moneyunseen-renewal-tip-shown')) {
      setShowRenewalTip(true)
      localStorage.setItem('moneyunseen-renewal-tip-shown', '1')
    }
    // Show email nudge after 4th item if user hasn't given email yet
    if (subscriptions.length === 3 && !profile?.email
        && !localStorage.getItem('moneyunseen-email-nudge-shown')) {
      setShowEmailNudge(true)
      localStorage.setItem('moneyunseen-email-nudge-shown', '1')
    }
    // Show yearly tip after adding a monthly subscription (not fixed costs)
    if (subscription.frequency === 'monthly' && !subscription.isFixedCost) {
      setYearlyTip({ name: subscription.name, cost: subscription.cost })
    }
  }

  const handleCancelClick = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    await cancelSubscription(id)
    setShowConfetti(true)
    if (sub && !localStorage.getItem('moneyunseen-savemore-shown')) {
      const saved = getMonthlyEquivalent(sub.cost, sub.frequency)
      setSaveMoreModal({ amount: saved })
      localStorage.setItem('moneyunseen-savemore-shown', '1')
    }
  }

  const handleStopClick = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    await stopSubscription(id)
    if (sub && !localStorage.getItem('moneyunseen-savemore-shown')) {
      const saved = getMonthlyEquivalent(sub.cost, sub.frequency)
      setSaveMoreModal({ amount: saved })
      localStorage.setItem('moneyunseen-savemore-shown', '1')
    }
  }

  const handleFixedNudgeDismiss = () => {
    localStorage.setItem('moneyunseen-fixed-nudge-dismissed', '1')
    setFixedNudgeDismissed(true)
  }

  const handleAddFixedCostFromNudge = () => {
    setShowAddForm(true)
    // Small delay so form renders, then signal it should open on fixed tab
    setTimeout(() => {
      const fixedBtn = document.querySelector('[data-tab="fixed"]') as HTMLButtonElement
      if (fixedBtn) fixedBtn.click()
    }, 50)
  }

  const handleOnboardingComplete = async (firstSub?: Parameters<typeof addSubscription>[0]) => {
    if (firstSub) await addSubscription(firstSub)
    localStorage.setItem('moneyunseen-onboarded', '1')
    setShowOnboarding(false)
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #faf9ff 40%, #f0f4ff 100%)' }}>
      {showOnboarding && (
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      )}
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      {saveMoreModal && (
        <SaveMoreModal
          savedAmount={saveMoreModal.amount}
          currency={currency}
          remainingCount={subscriptions.filter(s => s.isActive && !s.isStopped).length - 1}
          onClose={() => setSaveMoreModal(null)}
        />
      )}

      <header className="bg-white border-b border-gray-100 py-4 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <img src="/logo.png" alt="MoneyUnseen" className="h-8 md:h-12" />
          <div className="flex items-center gap-3">
            <CurrencyToggle currency={currency} onChange={setCurrency} />
            <div className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-semibold">
              Beta
            </div>
          </div>
        </div>
      </header>

      <div className="bg-gray-50 border-b border-gray-100 py-2 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 flex-wrap text-xs text-gray-400">
          <span>🔒 No bank login</span>
          <span>📱 Data stays on your device</span>
          <span>✏️ You stay in control</span>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        <ReturnVisitCard
          totalSavings={totalSavings}
          potentialMore={subscriptions
            .filter(s => s.isActive && !s.isStopped && !s.isFixedCost && !isFixedCostCategory(s.category) && ['streaming','music','gaming','news','software','food','sports_club','hobby_club','lottery'].includes(s.category))
            .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)}
          currency={currency}
        />

        <TwoWorldsView subscriptions={subscriptions} currency={currency} />

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            <span className="text-2xl">+</span>
            <span>Add Subscription or Fixed Cost</span>
          </button>
        )}

        {showAddForm && (
          <AddSubscriptionForm onAdd={handleAddSubscription} onCancel={() => { setShowAddForm(false); setYearlyTip(null) }} />
        )}

        {/* Yearly vs monthly tip — shows after adding a monthly sub */}
        {yearlyTip && !showAddForm && (
          <YearlyCheckTip
            subName={yearlyTip.name}
            monthlyCost={yearlyTip.cost}
            currency={currency}
            onDismiss={() => setYearlyTip(null)}
          />
        )}

        <SubscriptionList
          subscriptions={subscriptions}
          onDelete={deleteSubscription}
          onCancel={handleCancelClick}
          onReactivate={reactivateSubscription}
          onStop={handleStopClick}
          onUpdate={updateSubscription}
          currency={currency}
          highlightNoDates={highlightNoDates}
        />

        {/* Email nudge after 4th item */}
        {showEmailNudge && !profile?.email && (
          <div style={{
            borderRadius: 14, background: 'linear-gradient(135deg, #f5f3ff, #faf5ff)',
            border: '1.5px solid #ddd6fe', padding: '1rem 1.1rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 700, color: '#5b21b6', margin: '0 0 0.2rem' }}>
                Want to know when we find new ways to save?
              </p>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.78rem', color: '#7c3aed', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
                We'll let you know when new savings opportunities become available — no spam, ever.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  id="email-nudge-input"
                  style={{
                    flex: 1, minWidth: 160, padding: '0.45rem 0.75rem',
                    borderRadius: 8, border: '1.5px solid #c4b5fd',
                    fontFamily: 'system-ui', fontSize: '0.82rem', outline: 'none',
                    background: 'white', color: '#374151',
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('email-nudge-input') as HTMLInputElement
                    if (input?.value && input.value.includes('@')) {
                      setEmail(input.value)
                      handleEmailNudgeDismiss()
                    }
                  }}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: 8,
                    background: '#7c3aed', color: 'white',
                    border: 'none', fontFamily: 'system-ui',
                    fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Notify me
                </button>
              </div>
            </div>
            <button
              onClick={() => handleEmailNudgeDismiss()}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: '1rem', flexShrink: 0, padding: 0 }}
            >✕</button>
          </div>
        )}

        {/* Renewal date nudge — sequential, after email nudge */}
        {showRenewalDateNudge && (
          <div style={{
            borderRadius: 14, background: 'linear-gradient(135deg, #fffbeb, #fefce8)',
            border: '1.5px solid #fde68a', padding: '1rem 1.1rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>📅</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 700, color: '#92400e', margin: '0 0 0.2rem' }}>
                Some subscriptions are missing a renewal date
              </p>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.78rem', color: '#b45309', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
                Without a renewal date we can't warn you before the next automatic charge. Takes 10 seconds per subscription.
              </p>
              <button
                onClick={() => {
                  setShowRenewalDateNudge(false)
                  setHighlightNoDates(true)
                  // Scroll to first highlighted card
                  setTimeout(() => {
                    const first = document.querySelector('[id^="card-no-date-"]')
                    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }, 100)
                }}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: 8,
                  background: '#f59e0b', color: 'white',
                  border: 'none', fontFamily: 'system-ui',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                }}
              >
                📅 Show me which ones
              </button>
            </div>
            <button
              onClick={() => setShowRenewalDateNudge(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d97706', fontSize: '1rem', flexShrink: 0, padding: 0 }}
            >✕</button>
          </div>
        )}

        {showFixedNudge && !showAddForm && (
          <FixedCostNudge
            subCount={subCount}
            currency={currency}
            onAddFixedCost={handleAddFixedCostFromNudge}
            onDismiss={handleFixedNudgeDismiss}
          />
        )}

        {/* One-time renewal tip after first subscription */}
        {showRenewalTip && (
          <div style={{
            borderRadius: 12, background: '#faf5ff',
            border: '1.5px solid #e9d5ff', padding: '0.85rem 1rem',
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>💡</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.82rem', fontWeight: 600, color: '#6d28d9', margin: '0 0 0.1rem' }}>
                Tip: add a renewal date
              </p>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.78rem', color: '#7c3aed', margin: 0, lineHeight: 1.5 }}>
                Use the ⚙️ option in the form to set when your subscription renews — we'll warn you in time to cancel before the next charge.
              </p>
            </div>
            <button
              onClick={() => setShowRenewalTip(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa', fontSize: '1rem', flexShrink: 0, padding: 0 }}
            >✕</button>
          </div>
        )}

        {showVariableSpend && (
          <VariableSpendCard subscriptions={subscriptions} currency={currency} />
        )}

        {(subscriptions.length >= 2 || totalSavings > 0) && suggestedGoals.length > 0 && (
          <SmartGoals
            suggestedGoals={suggestedGoals}
            selectedGoalIds={(profile.goals ?? []).map(g => g.id)}
            onToggleGoal={toggleGoal}
            monthlySavings={savingsBasis}
            totalSavings={totalSavings}
            suggestedPauseSubName={suggestedPauseSub?.name}
            currency={currency}
            email={profile.email}
            onEmailSubmit={setEmail}
            fixedMonthly={fixedMonthlyForRecap}
            subsMonthly={subsMonthlyForRecap}
            variableMonthly={variableMonthlyForRecap}
          />
        )}

        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 text-center">
          <p className="text-sm text-purple-700 font-medium mb-1">🧪 You're using the MoneyUnseen beta</p>
          <p className="text-xs text-purple-500">Free to use. We're exploring what to build next — your feedback shapes the product.</p>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-gray-400">
          <span>Made with 💜 by MoneyUnseen · Beta</span>
          <div className="flex gap-3">
            <a href="/privacy.html" target="_blank" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="/terms.html" target="_blank" className="hover:text-gray-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
