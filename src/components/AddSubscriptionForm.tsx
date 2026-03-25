import { useState } from 'react'
import type { BillingFrequency, SubscriptionCategory } from '../types'

interface AddSubscriptionFormProps {
  onAdd: (subscription: {
    name: string
    cost: number
    frequency: BillingFrequency
    category: SubscriptionCategory
    renewalDate: Date
  }) => void
  onCancel: () => void
}

export default function AddSubscriptionForm({ onAdd, onCancel }: AddSubscriptionFormProps) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly')
  const [category, setCategory] = useState<SubscriptionCategory>('streaming')
  const [renewalDate, setRenewalDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !cost) return

    onAdd({
      name,
      cost: parseFloat(cost),
      frequency,
      category,
      renewalDate: new Date(renewalDate),
    })

    // Reset form
    setName('')
    setCost('')
    setFrequency('monthly')
    setCategory('streaming')
    setRenewalDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="glass rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Add Subscription</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subscription Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Netflix, Spotify, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="9.99"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as BillingFrequency)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="streaming">📺 Streaming</option>
            <option value="music">🎵 Music</option>
            <option value="fitness">💪 Fitness</option>
            <option value="software">💻 Software</option>
            <option value="gaming">🎮 Gaming</option>
            <option value="food">🍔 Food & Delivery</option>
            <option value="news">📰 News & Media</option>
            <option value="insurance">🛡️ Insurance</option>
            <option value="road_tax">🚗 Road Tax</option>
            <option value="lottery">🎰 Lottery</option>
            <option value="sports_club">⚽ Sports Club</option>
            <option value="hobby_club">🎨 Hobby Club</option>
            <option value="mobile_phone">📱 Mobile Phone</option>
            <option value="car_fuel">⛽ Car Fuel</option>
            <option value="utilities">💡 Utilities</option>
            <option value="other">📦 Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Next Renewal Date
          </label>
          <input
            type="date"
            value={renewalDate}
            onChange={(e) => setRenewalDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Add (+10 XP)
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
