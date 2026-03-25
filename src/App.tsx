import { useState } from 'react'
import { useSubscriptions, useProfile } from './hooks/useData'
import GoalVisualizer from './components/GoalVisualizer'
import GoalSelector from './components/GoalSelector'
import SubscriptionList from './components/SubscriptionList'
import AddSubscriptionForm from './components/AddSubscriptionForm'
import { getMonthlyEquivalent } from './types'
import type { Subscription } from './types'

export default function App() {
  const {
    subscriptions,
    addSubscription,
    deleteSubscription,
    pauseSubscription,
    unpauseSubscription,
    loading: subsLoading,
  } = useSubscriptions()

  const { profile, updateGoal, loading: profileLoading } = useProfile()

  const [showAddForm, setShowAddForm] = useState(false)

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

  const totalMonthlySpend = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const handleAddSubscription = async (
    subscription: Parameters<typeof addSubscription>[0]
  ) => {
    await addSubscription(subscription)
    setShowAddForm(false)
  }

  const handlePause = async (id: string) => {
    await pauseSubscription(id)
  }

  const handleUnpause = async (id: string) => {
    await unpauseSubscription(id)
  }

  const handleDelete = async (id: string) => {
    await deleteSubscription(id)
  }

  const handleUpdateGoalAmount = async (amount: number) => {
    await updateGoal({ ...profile.goal, targetAmount: amount })
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">MoneyUnseen</h1>
              <p className="text-sm text-primary-100">See. Choose. Reallocate.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <GoalSelector currentGoal={profile.goal} onSelectGoal={updateGoal} />

        <GoalVisualizer
          goal={profile.goal}
          subscriptions={subscriptions}
          onUpdateGoalAmount={handleUpdateGoalAmount}
        />

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white font-bold py-4 rounded-2xl hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <span className="text-2xl">+</span>
            <span>Add cost</span>
          </button>
        ) : (
          <AddSubscriptionForm
            onAdd={handleAddSubscription}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <SubscriptionList
          subscriptions={subscriptions}
          onDelete={handleDelete}
          onPause={handlePause}
          onUnpause={handleUnpause}
        />

        {subscriptions.length > 0 && (
          <div className="glass rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-700">
                  {subscriptions.filter((s) => s.isActive).length}
                </div>
                <div className="text-sm text-primary-600">Active</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-700">
                  {subscriptions.filter((s) => !s.isActive).length}
                </div>
                <div className="text-sm text-green-600">Paused</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500 text-center">
              Total active monthly: €{totalMonthlySpend.toFixed(2)}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-4">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
          <p>Made with 💜 by MoneyUnseen</p>
        </div>
      </footer>
    </div>
  )
}