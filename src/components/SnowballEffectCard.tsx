import type { Subscription } from '../types'
import { getMonthlyEquivalent } from '../types'

interface SnowballEffectCardProps {
  pausedSubscriptions: Subscription[]
}

export default function SnowballEffectCard({ pausedSubscriptions }: SnowballEffectCardProps) {
  const totalPausedMonthly = pausedSubscriptions.reduce(
    (sum, sub) => sum + getMonthlyEquivalent(sub.cost, sub.frequency),
    0
  )

  if (totalPausedMonthly < 10 || pausedSubscriptions.length === 0) {
    return null
  }

  const yearlySavings = totalPausedMonthly * 12

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-100">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌊</span>
        <h3 className="text-lg font-semibold text-gray-900">Your Snowball Effect</h3>
      </div>

      <p className="text-sm text-gray-700 mb-3">You've paused:</p>

      <div className="space-y-2 mb-4">
        {pausedSubscriptions.slice(0, 3).map((sub) => {
          const monthly = getMonthlyEquivalent(sub.cost, sub.frequency)
          return (
            <div key={sub.id} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">• {sub.name}</span>
              <span className="font-medium text-gray-900">€{monthly.toFixed(2)}/mo</span>
            </div>
          )
        })}
        {pausedSubscriptions.length > 3 && (
          <p className="text-xs text-gray-600">+ {pausedSubscriptions.length - 3} more</p>
        )}
      </div>

      <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-3">
        <p className="text-sm text-gray-600 mb-1">Freed up</p>
        <p className="text-2xl font-bold text-green-700">
          €{totalPausedMonthly.toFixed(2)}
          <span className="text-base font-normal text-gray-600">/month</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">€{yearlySavings.toFixed(0)}/year</p>
      </div>

      <p className="text-sm text-center text-gray-700">Small choices. Meaningful impact.</p>
    </div>
  )
}
