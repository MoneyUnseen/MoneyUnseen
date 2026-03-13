import type { Subscription } from '../types'
import { getMonthlyEquivalent } from '../types'

interface CancelPreviewModalProps {
  subscription: Subscription
  currentGoalAmount: number
  totalMonthlySpend: number
  onConfirmCancel: () => void
  onClose: () => void
}

export default function CancelPreviewModal({
  subscription,
  currentGoalAmount,
  totalMonthlySpend,
  onConfirmCancel,
  onClose,
}: CancelPreviewModalProps) {
  const monthlyEquivalent = getMonthlyEquivalent(subscription.cost, subscription.frequency)
  const yearlySavings = monthlyEquivalent * 12
  const monthsToGoal = currentGoalAmount / monthlyEquivalent
  const progressIncrease = (monthlyEquivalent / totalMonthlySpend) * 100

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-bounce-in">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          What if you pause {subscription.name}?
        </h3>

        <div className="space-y-4 mb-6">
          {/* Monthly Savings */}
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-sm text-green-700 font-medium mb-1">Monthly Savings</div>
            <div className="text-3xl font-bold text-green-800">
              €{monthlyEquivalent.toFixed(2)}
            </div>
          </div>

          {/* Yearly Savings */}
          <div className="bg-primary-50 rounded-xl p-4">
            <div className="text-sm text-primary-700 font-medium mb-1">Yearly Savings</div>
            <div className="text-3xl font-bold text-primary-800">
              €{yearlySavings.toFixed(2)}
            </div>
          </div>

          {/* Progress to Goal */}
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="text-sm text-purple-700 font-medium mb-1">Progress to Goal</div>
            <div className="text-3xl font-bold text-purple-800">
              +{progressIncrease.toFixed(0)}%
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Goal reached in {Math.ceil(monthsToGoal)} months
            </div>
          </div>

          {/* XP hidden for v1 */}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Keep Subscription
          </button>
          <button
            onClick={onConfirmCancel}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
          >
            Pause & Save 💰
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          You can always reactivate later
        </p>
      </div>
    </div>
  )
}
