import type { UserGoal } from '../types'

interface FlexibilityPotentialCardProps {
  totalMonthly: number
  goal: UserGoal
}

export default function FlexibilityPotentialCard({ totalMonthly, goal }: FlexibilityPotentialCardProps) {
  const scenarios = [
    { amount: 50, label: 'Small shift' },
    { amount: 100, label: 'Moderate change' },
    { amount: 200, label: 'Significant reallocation' },
  ]

  if (totalMonthly === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-primary-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly Flexibility Potential</h3>

      <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-1">Current fixed costs</p>
        <p className="text-3xl font-bold text-gray-900">
          €{totalMonthly.toFixed(2)}
          <span className="text-base font-normal text-gray-600">/month</span>
        </p>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        If you reallocate some costs toward your {goal.title}:
      </p>

      <div className="space-y-3">
        {scenarios.map((scenario) => {
          const monthsToGoal = Math.ceil(goal.targetAmount / scenario.amount)
          const isRealistic = scenario.amount <= totalMonthly

          return (
            <div
              key={scenario.amount}
              className={`bg-white rounded-lg p-4 border ${
                isRealistic ? 'border-primary-200' : 'border-gray-200 opacity-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">€{scenario.amount}/month</p>
                  <p className="text-xs text-gray-600">{scenario.label}</p>
                </div>
                {isRealistic && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-700">{monthsToGoal} months</p>
                    <p className="text-xs text-gray-600">to goal</p>
                  </div>
                )}
              </div>
              {!isRealistic && (
                <p className="text-xs text-gray-500">Add more costs to see this scenario</p>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-600 mt-4 text-center">You decide what matters most.</p>
    </div>
  )
}
