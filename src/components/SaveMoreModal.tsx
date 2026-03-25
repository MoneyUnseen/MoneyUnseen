import { getCurrencySymbol } from '../types'
import type { Currency } from '../types'

interface SaveMoreModalProps {
  savedAmount: number
  currency: Currency
  remainingCount: number
  onClose: () => void
}

export default function SaveMoreModal({ savedAmount, currency, remainingCount, onClose }: SaveMoreModalProps) {
  const sym = getCurrencySymbol(currency)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">

        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            You just saved {sym}{savedAmount.toFixed(0)}/month!
          </h3>
          <p className="text-sm text-gray-500">
            That's {sym}{(savedAmount * 12).toFixed(0)} a year back in your pocket.
          </p>
        </div>

        {remainingCount > 0 && (
          <div className="bg-purple-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-sm text-purple-700 font-medium">
              You still have <strong>{remainingCount} active item{remainingCount !== 1 ? 's' : ''}</strong> to review.
            </p>
            <p className="text-xs text-purple-500 mt-1">
              Want to see what else you could save?
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-white font-bold py-3 rounded-xl transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
        >
          Let's keep going 💪
        </button>

        <button
          onClick={onClose}
          className="w-full text-gray-400 text-sm mt-3 hover:text-gray-600 transition-colors"
        >
          I'm done for now
        </button>
      </div>
    </div>
  )
}
