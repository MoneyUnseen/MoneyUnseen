interface MonthlyCheckInCardProps {
  onStartCheckIn: () => void
}

export default function MonthlyCheckInCard({ onStartCheckIn }: MonthlyCheckInCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-blue-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📅</span>
        <h3 className="text-lg font-semibold text-gray-900">Monthly Check-in</h3>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Take 2 minutes to review your fixed costs. No judgment—just awareness.
      </p>

      <button
        onClick={onStartCheckIn}
        className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white font-medium py-3 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all"
      >
        Start Check-in
      </button>
    </div>
  )
}
