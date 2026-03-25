import type { UserGoal } from '../types'

interface GoalSelectorProps {
  currentGoal: UserGoal
  onSelectGoal: (goal: UserGoal) => void
}

const GOALS: UserGoal[] = [
  {
    id: 'vacation',
    type: 'vacation',
    title: 'Extra Vacations',
    targetAmount: 1200,
    description: 'Weekend in Barcelona',
    emoji: '✈️',
  },
  {
    id: 'investment',
    type: 'investment',
    title: 'Build Wealth',
    targetAmount: 15000,
    description: '€50/month = €15k in 10 years',
    emoji: '📈',
  },
  {
    id: 'family',
    type: 'family',
    title: 'Family Experiences',
    targetAmount: 600,
    description: 'Theme park trip every year',
    emoji: '🎁',
  },
]

export default function GoalSelector({ currentGoal, onSelectGoal }: GoalSelectorProps) {
  return (
    <div className="glass rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        What would you do with the money?
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {GOALS.map((goal) => (
          <button
            key={goal.type}
            onClick={() => onSelectGoal(goal)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              currentGoal.type === goal.type
                ? 'border-primary-600 bg-primary-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
            }`}
          >
            <div className="text-4xl mb-2 text-center">{goal.emoji}</div>
            <h4 className="font-semibold text-base mb-1 text-gray-900 text-center">
              {goal.title}
            </h4>
            <p className="text-sm text-gray-600 text-center">{goal.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
