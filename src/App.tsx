import { useState, useMemo } from 'react'
import { useSubscriptions, useProfile } from './hooks/useData'
import TwoWorldsView from './components/TwoWorldsView'
import SmartGoals from './components/SmartGoals'
import CurrencyToggle from './components/CurrencyToggle'
import SubscriptionList from './components/SubscriptionList'
import AddSubscriptionForm from './components/AddSubscriptionForm'
import Confetti from './components/Confetti'
import OnboardingWizard from './components/OnboardingWizard'
import { getMonthlyEquivalent, generateSmartGoals } from './types'
import SaveMoreModal from './components/SaveMoreModal'

function App() {
  const { subscriptions, addSubscription, updateSubscription, deleteSubscription, cancelSubscription, reactivateSubscription, stopSubscription, loading: subsLoading } = useSubscriptions()
  const { profile, toggleGoal, setEmail, setCurrency, loading: profileLoading } = useProfile()

  const [showAddForm, setShowAddForm] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('moneyunseen-onboarded')
  })
  const [saveMoreModal, setSaveMoreModal] = useState<{ amount: number } | null>(null)

  const currency = profile?.currency ?? 'EUR'

  const totalMonthlySpend = subscriptions
    .filter(s => s.isActive && !s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const totalPausedMonthly = subscriptions
    .filter(s => !s.isActive && !s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const totalStoppedMonthly = subscriptions
    .filter(s => s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const totalSavings = totalPausedMonthly + totalStoppedMonthly

  // Pausable categories — logical to pause/stop
  const PAUSABLE_CATEGORIES = ['streaming', 'music', 'gaming', 'news', 'software', 'food']
  const suggestedPauseSub = subscriptions
    .filter(s => s.isActive && !s.isStopped && PAUSABLE_CATEGORIES.includes(s.category))
    .sort((a, b) => getMonthlyEquivalent(a.cost, a.frequency) - getMonthlyEquivalent(b.cost, b.frequency))[0]

  const savingsBasis = totalSavings > 0 ? totalSavings : (suggestedPauseSub ? getMonthlyEquivalent(suggestedPauseSub.cost, suggestedPauseSub.frequency) : totalMonthlySpend)
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
          <AddSubscriptionForm onAdd={handleAddSubscription} onCancel={() => setShowAddForm(false)} />
        )}

        <SubscriptionList
          subscriptions={subscriptions}
          onDelete={deleteSubscription}
          onCancel={handleCancelClick}
          onReactivate={reactivateSubscription}
          onStop={handleStopClick}
          onUpdate={updateSubscription}
          currency={currency}
        />

        {subscriptions.length >= 4 && suggestedGoals.length > 0 && (
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
          />
        )}

        <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 text-center">
          <p className="text-sm text-purple-700 font-medium mb-1">🧪 You're using the MoneyUnseen beta</p>
          <p className="text-xs text-purple-500">Free to use. We're exploring what to build next — your feedback shapes the product.</p>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 px-4">
        <div className="max-w-2xl mx-auto text-center text-xs text-gray-400">
          Made with 💜 by MoneyUnseen · Beta
        </div>
      </footer>
    </div>
  )
}

export default App
