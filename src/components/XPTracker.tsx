import { calculateLevel } from '../types'

interface XPTrackerProps {
  totalXP: number
  streakDays: number
}

export default function XPTracker({ totalXP, streakDays }: XPTrackerProps) {
  const level = calculateLevel(totalXP)
  const currentLevelXP = (level - 1) * 100
  const nextLevelXP = level * 100
  const progressXP = totalXP - currentLevelXP
  const progressPercent = (progressXP / (nextLevelXP - currentLevelXP)) * 100

  return (
    <div className="glass rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-gray-600 font-medium">Level {level}</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary-600">{totalXP}</div>
          <div className="text-sm text-gray-600">XP</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{currentLevelXP} XP</span>
          <span>{nextLevelXP} XP</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 p-3 bg-primary-50 rounded-lg">
        <span className="text-2xl">🔥</span>
        <div>
          <div className="text-lg font-bold text-primary-700">{streakDays} day streak</div>
          <div className="text-xs text-primary-600">
            {streakDays === 0 ? 'Start your journey!' : 'Keep it going!'}
          </div>
        </div>
      </div>
    </div>
  )
}
