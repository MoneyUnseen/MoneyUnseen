import type { Subscription, UserGoal } from '../types'
import { getMonthlyEquivalent } from '../types'

interface ReviewCostModalProps {
  subscription: Subscription
  goal: UserGoal
  onKeep: () => void
  onPause: () => void
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

export default function ReviewCostModal({
  subscription,
  goal,
  onKeep,
  onPause,
  onEdit,
  onDelete,
  onClose,
}: ReviewCostModalProps) {
  const monthlyEquivalent = getMonthlyEquivalent(subscription.cost, subscription.frequency)
  const yearlyCost = monthlyEquivalent * 12
  const monthsToFundGoal = Math.ceil(goal.targetAmount / monthlyEquivalent)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{subscription.name}</h3>
          <p className="text-sm text-gray-600">Review this fixed cost</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-1">Yearly cost</p>
          <p className="text-3xl font-bold text-gray-900">€{yearlyCost.toFixed(2)}</p>
          <p className="text-sm text-gray-600 mt-1">(€{monthlyEquivalent.toFixed(2)}/month)</p>
        </div>

        <div className="bg-primary-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">This could fund:</p>
          <div className="space-y-1 text-sm text-gray-800">
            <p>• Your {goal.title} in {monthsToFundGoal} months</p>
            <p>• €{(yearlyCost / 12).toFixed(0)} toward monthly savings</p>
            <p>• Peace of mind knowing you chose intentionally</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => {
              onKeep()
              onClose()
            }}
            className="bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Keep
          </button>
          <button
            onClick={() => {
              onPause()
              onClose()
            }}
            className="bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Pause
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              onEdit()
              onClose()
            }}
            className="text-gray-600 font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete()
              onClose()
            }}
            className="text-red-600 font-medium py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            Delete
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>
    </div>
  )
}
