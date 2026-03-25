import { calculateMomentumPhase, getMomentumPhaseInfo } from '../types'
import type { ActionRecord } from '../types'

interface MomentumPhaseCardProps {
  currentMonthActions: number
  recentActions: ActionRecord[]
}

export default function MomentumPhaseCard({ currentMonthActions, recentActions }: MomentumPhaseCardProps) {
  const phase = calculateMomentumPhase(currentMonthActions)
  const phaseInfo = getMomentumPhaseInfo(phase)

  const progressToNext = phaseInfo.nextThreshold
    ? (currentMonthActions / phaseInfo.nextThreshold) * 100
    : 100

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{phaseInfo.emoji}</span>
            <h3 className="text-lg font-semibold text-gray-900">{phaseInfo.title}</h3>
          </div>
          <p className="text-sm text-gray-600">{phaseInfo.message}</p>
        </div>
      </div>

      {/* Actions counter */}
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-gray-600">Actions this month</span>
          <span className="text-2xl font-semibold text-primary-600">{currentMonthActions}</span>
        </div>

        {phaseInfo.nextThreshold && (
          <>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-1">
              <div
                className="bg-primary-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {phaseInfo.nextThreshold - currentMonthActions} more to reach {phaseInfo.nextPhase}
            </p>
          </>
        )}
      </div>

      {/* Recent actions */}
      {recentActions.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Recent actions:</p>
          <div className="space-y-1">
            {recentActions.slice(0, 3).map((action) => (
              <div key={action.id} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-primary-500 mt-0.5">•</span>
                <span className="flex-1">{action.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
