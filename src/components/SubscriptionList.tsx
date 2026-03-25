import type { Subscription } from '../types'
import { getMonthlyEquivalent } from '../types'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onDelete: (id: string) => void
  onCancel: (id: string) => void
  onEdit?: (subscription: Subscription) => void
}

const CATEGORY_EMOJI: Record<string, string> = {
  streaming: '📺',
  fitness: '💪',
  software: '💻',
  music: '🎵',
  gaming: '🎮',
  food: '🍔',
  news: '📰',
  insurance: '🛡️',
  road_tax: '🚗',
  lottery: '🎰',
  sports_club: '⚽',
  hobby_club: '🎨',
  mobile_phone: '📱',
  car_fuel: '⛽',
  utilities: '💡',
  other: '📦',
}

export default function SubscriptionList({ subscriptions, onDelete, onCancel }: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center shadow-lg">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No subscriptions yet</h3>
        <p className="text-gray-600">Click "Add Subscription" below to start tracking</p>
      </div>
    )
  }

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive)
  const canceledSubscriptions = subscriptions.filter(sub => !sub.isActive)

  return (
    <div className="space-y-4">
      {/* Active subscriptions */}
      {activeSubscriptions.length > 0 && (
        <div className="glass rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Active Subscriptions</h3>
          <div className="space-y-3">
            {activeSubscriptions.map(sub => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onDelete={onDelete}
                onCancel={onCancel}
              />
            ))}
          </div>
        </div>
      )}

      {/* Canceled subscriptions */}
      {canceledSubscriptions.length > 0 && (
        <div className="glass rounded-2xl p-6 shadow-lg opacity-75">
          <h3 className="text-lg font-bold text-gray-600 mb-4">Paused Subscriptions</h3>
          <div className="space-y-3">
            {canceledSubscriptions.map(sub => (
              <SubscriptionCard
                key={sub.id}
                subscription={sub}
                onDelete={onDelete}
                onCancel={onCancel}
                isCanceled
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SubscriptionCard({ 
  subscription, 
  onDelete, 
  onCancel,
  isCanceled = false 
}: { 
  subscription: Subscription
  onDelete: (id: string) => void
  onCancel: (id: string) => void
  isCanceled?: boolean
}) {
  const monthlyEquivalent = getMonthlyEquivalent(subscription.cost, subscription.frequency)

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-all ${
      isCanceled ? 'bg-gray-100' : 'bg-white hover:shadow-md'
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="text-3xl">{CATEGORY_EMOJI[subscription.category]}</div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{subscription.name}</div>
          <div className="text-sm text-gray-600">
            €{subscription.cost.toFixed(2)}/{subscription.frequency}
            {subscription.frequency !== 'monthly' && (
              <span className="ml-2 text-primary-600">
                (€{monthlyEquivalent.toFixed(2)}/mo)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isCanceled && (
          <button
            onClick={() => onCancel(subscription.id)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Pause
          </button>
        )}
        <button
          onClick={() => onDelete(subscription.id)}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  )
}
