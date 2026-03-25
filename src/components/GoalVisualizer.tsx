import { useState } from 'react'
import type { UserGoal, Subscription } from '../types'
import { getMonthlyEquivalent } from '../types'

interface GoalVisualizerProps {
  goal: UserGoal
  subscriptions: Subscription[]
  onUpdateGoalAmount?: (amount: number) => void
}

export default function GoalVisualizer({ goal, subscriptions, onUpdateGoalAmount }: GoalVisualizerProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [tempGoalAmount, setTempGoalAmount] = useState(goal.targetAmount.toString())

  // Calculate total monthly spend from active subscriptions
  const totalMonthlySpend = subscriptions
    .filter(sub => sub.isActive)
    .reduce((sum, sub) => sum + getMonthlyEquivalent(sub.cost, sub.frequency), 0)

  const yearlySavings = totalMonthlySpend * 12
  const monthsToGoal = goal.targetAmount / totalMonthlySpend
  const progressPercent = Math.min((yearlySavings / goal.targetAmount) * 100, 100)

  const handleSaveGoalAmount = () => {
    const newAmount = parseFloat(tempGoalAmount)
    if (newAmount > 0 && onUpdateGoalAmount) {
      onUpdateGoalAmount(newAmount)
      setIsEditingGoal(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{goal.emoji}</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{goal.title}</h3>
        <p className="text-gray-600">{goal.description}</p>
        
        {/* Editable Goal Amount */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {isEditingGoal ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Goal:</span>
              <input
                type="number"
                value={tempGoalAmount}
                onChange={(e) => setTempGoalAmount(e.target.value)}
                className="w-24 px-3 py-1 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-center font-semibold"
                autoFocus
              />
              <span className="text-gray-600">€</span>
              <button
                onClick={handleSaveGoalAmount}
                className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setIsEditingGoal(false)
                  setTempGoalAmount(goal.targetAmount.toString())
                }}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingGoal(true)}
              className="text-sm text-gray-600 hover:text-primary-600 flex items-center gap-1"
            >
              Target: <span className="font-semibold">€{goal.targetAmount}</span>
              <span className="text-xs">✏️</span>
            </button>
          )}
        </div>
      </div>

      {totalMonthlySpend > 0 ? (
        <>
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-6 text-white mb-4">
            <div className="text-center">
              <div className="text-sm font-medium mb-1">If you cancel all subscriptions</div>
              <div className="text-4xl font-bold mb-1">€{totalMonthlySpend.toFixed(2)}</div>
              <div className="text-sm">per month</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress to goal</span>
                <span className="font-semibold text-primary-600">
                  €{yearlySavings.toFixed(0)} / €{goal.targetAmount}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-700">
                  {Math.ceil(monthsToGoal)}
                </div>
                <div className="text-xs text-primary-600">months to goal</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-700">
                  €{yearlySavings.toFixed(0)}
                </div>
                <div className="text-xs text-purple-600">yearly savings</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">Add subscriptions to see your savings potential</p>
          <p className="text-sm">👇 Start tracking below</p>
        </div>
      )}
    </div>
  )
}
