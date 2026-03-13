import { useState } from 'react'
import type { Subscription, BillingFrequency, SubscriptionCategory_All } from '../types'

interface EditSubscriptionFormProps {
  subscription: Subscription
  onSave: (updated: Subscription) => void
  onClose: () => void
}

export default function EditSubscriptionForm({ subscription, onSave, onClose }: EditSubscriptionFormProps) {
  const [name, setName] = useState(subscription.name)
  const [cost, setCost] = useState(String(subscription.cost))
  const [frequency, setFrequency] = useState<BillingFrequency>(subscription.frequency)
  const [category, setCategory] = useState<SubscriptionCategory_All>(subscription.category)
  const [renewalDate, setRenewalDate] = useState(
    subscription.renewalDate
      ? new Date(subscription.renewalDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [noticePeriod, setNoticePeriod] = useState(subscription.noticePeriod ?? 30)
  const [isTrial, setIsTrial] = useState(subscription.isTrial ?? false)
  const [trialEndsDate, setTrialEndsDate] = useState(
    subscription.trialEndsDate
      ? new Date(subscription.trialEndsDate).toISOString().split('T')[0]
      : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...subscription,
      name,
      cost: parseFloat(cost),
      frequency,
      category,
      renewalDate: new Date(renewalDate),
      noticePeriod,
      isTrial: isTrial || undefined,
      trialEndsDate: isTrial && trialEndsDate ? new Date(trialEndsDate) : undefined,
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(15,15,35,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, padding: '1.5rem',
          width: '100%', maxWidth: 460,
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'system-ui', fontSize: '1.1rem', fontWeight: 700, color: '#0f0f23', margin: 0 }}>
            Edit subscription
          </h3>
          <button onClick={onClose} style={{
            border: 'none', background: '#f3f4f6', borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">How often?</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as BillingFrequency)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as SubscriptionCategory_All)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <optgroup label="— Subscriptions —">
                <option value="streaming">▶️ Streaming</option>
                <option value="music">🎵 Music</option>
                <option value="gaming">🎮 Gaming</option>
                <option value="news">📰 News &amp; Media</option>
                <option value="software">💻 Software &amp; Apps</option>
                <option value="food">🍔 Food &amp; Delivery</option>
                <option value="fitness">💪 Fitness</option>
                <option value="sports_club">⚽ Sports Club</option>
                <option value="hobby_club">🎨 Hobby / Club</option>
                <option value="lottery">🎰 Lottery</option>
                <option value="other_sub">📦 Other subscription</option>
              </optgroup>
              <optgroup label="— Fixed Costs —">
                <option value="mortgage">🏠 Mortgage</option>
                <option value="rent">🏢 Rent</option>
                <option value="energy">⚡ Energy</option>
                <option value="health_insurance">🏥 Health Insurance</option>
                <option value="disability_insurance">🩺 Disability Insurance</option>
                <option value="home_insurance">🏗️ Home & Contents Insurance</option>
                <option value="car_insurance">🚗 Car Insurance</option>
                <option value="road_tax">🛣️ Road Tax</option>
                <option value="municipal_tax">🏛️ Municipal Tax</option>
                <option value="pension">👴 Pension</option>
                <option value="mobile_phone">📱 Mobile Phone</option>
                <option value="internet">🌐 Internet</option>
                <option value="childcare">🧒 Childcare / Education</option>
                <option value="car_fuel">⛽ Car Fuel</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="other_fixed">📋 Other fixed cost</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next renewal date</label>
            <input type="date" value={renewalDate} onChange={e => setRenewalDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            {frequency === 'monthly' && (
              <p style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.3rem' }}>
                💡 For monthly subscriptions, set the date of your next billing cycle. We'll use it to calculate your cancel deadline.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation notice period</label>
            <select value={noticePeriod} onChange={e => setNoticePeriod(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value={0}>None — cancel anytime</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days (most common)</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>

          {/* Trial toggle */}
          <div onClick={() => setIsTrial(!isTrial)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer',
            background: isTrial ? '#fefce8' : '#f9fafb',
            border: `1.5px solid ${isTrial ? '#fde68a' : '#e5e7eb'}`,
          }}>
            <div>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.85rem', fontWeight: 600, color: '#374151', margin: 0 }}>⏱️ Free trial</p>
              <p style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: '#6b7280', margin: '0.1rem 0 0' }}>Get a warning before it converts to paid</p>
            </div>
            <div style={{ width: 40, height: 22, borderRadius: 99, position: 'relative', background: isTrial ? '#7c3aed' : '#d1d5db', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: isTrial ? 20 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>

          {isTrial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trial ends on</label>
              <input type="date" value={trialEndsDate}
                min="2026-03-11" max="2027-03-11"
                onChange={e => {
                  const val = e.target.value
                  if (val && new Date(val).getFullYear() > 2000) setTrialEndsDate(val)
                  else if (!val) setTrialEndsDate(val)
                }}
                className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent" />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="submit"
              className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg">
              Save changes
            </button>
            <button type="button" onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
