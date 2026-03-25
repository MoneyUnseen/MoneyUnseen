import { useState } from 'react'
import type { Subscription, Currency } from '../types'
import { getMonthlyEquivalent, getCurrencySymbol } from '../types'
import ExportButton from './ExportButton'
import EditSubscriptionForm from './EditSubscriptionForm'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onDelete: (id: string) => void
  onCancel: (id: string) => void
  onStop: (id: string) => void
  onReactivate: (id: string) => void
  onUpdate: (sub: Subscription) => void
  currency?: Currency
}

const CATEGORY_EMOJI: Record<string, string> = {
  streaming: '▶️', fitness: '💪', software: '💻', music: '🎵', gaming: '🎮',
  food: '🍔', news: '📰', insurance: '🛡️', road_tax: '🚗', lottery: '🎰',
  sports_club: '⚽', hobby_club: '🎨', mobile_phone: '📱', car_fuel: '⛽',
  utilities: '💡', maintenance: '🔧', other: '📦',
}

const CATEGORY_LABEL: Record<string, string> = {
  streaming: 'Streaming', fitness: 'Fitness', software: 'Software', music: 'Music',
  gaming: 'Gaming', food: 'Food', news: 'News', insurance: 'Insurance',
  road_tax: 'Road Tax', lottery: 'Lottery', sports_club: 'Sports', hobby_club: 'Hobby',
  mobile_phone: 'Mobile', car_fuel: 'Car', utilities: 'Utilities',
  maintenance: 'Maintenance', other: 'Other',
}

function nextRenewalDate(sub: Subscription): Date | null {
  if (!sub.renewalDate) return null
  const renewal = new Date(sub.renewalDate)
  const now = new Date()
  // If renewal is in the past, advance it by frequency until it's in the future
  if (renewal < now) {
    const freqDays: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 91, yearly: 365 }
    const days = freqDays[sub.frequency] ?? 30
    while (renewal < now) {
      renewal.setDate(renewal.getDate() + days)
    }
  }
  return renewal
}

function daysUntilCancelDeadline(sub: Subscription): number | null {
  if (!sub.renewalDate) return null
  const noticeDays = sub.noticePeriod ?? 30
  if (noticeDays === 0) return null
  const renewal = nextRenewalDate(sub)
  if (!renewal) return null
  const deadline = new Date(renewal)
  deadline.setDate(deadline.getDate() - noticeDays)
  return Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function SubscriptionList({
  subscriptions, onDelete, onCancel, onStop, onReactivate, onUpdate, currency = 'EUR'
}: SubscriptionListProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [editingSub, setEditingSub] = useState<Subscription | null>(null)
  const [stoppedExpanded, setStoppedExpanded] = useState(false)
  const sym = getCurrencySymbol(currency)

  if (subscriptions.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center shadow-lg">
        <div className="text-6xl mb-4">👀</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nothing tracked yet</h3>
        <p className="text-gray-600 mb-3">
          Add your subscriptions and fixed costs above — Netflix, gym, insurance, phone plan. Whatever you pay regularly.
        </p>
        <p className="text-sm text-primary-600 font-medium">No bank connection needed. You stay in control.</p>
      </div>
    )
  }

  const activeSubscriptions = subscriptions.filter(s => s.isActive && !s.isStopped)
  const pausedSubscriptions = subscriptions.filter(s => !s.isActive && !s.isStopped)
  const stoppedSubscriptions = subscriptions.filter(s => s.isStopped)

  const totalPausedMonthly = pausedSubscriptions.reduce(
    (sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0
  )

  const totalStoppedMonthly = stoppedSubscriptions.reduce(
    (sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0
  )

  const categoryTotals = activeSubscriptions.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + getMonthlyEquivalent(s.cost, s.frequency)
    return acc
  }, {} as Record<string, number>)
  const usedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a])
  const filteredActive = activeCategory
    ? activeSubscriptions.filter(s => s.category === activeCategory)
    : activeSubscriptions

  return (
    <>
      {editingSub && (
        <EditSubscriptionForm
          subscription={editingSub}
          onSave={updated => { onUpdate(updated); setEditingSub(null) }}
          onClose={() => setEditingSub(null)}
        />
      )}

      <div className="space-y-4">

        {/* Category filter chips */}
        {usedCategories.length > 1 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveCategory(null)} style={{
              padding: '0.25rem 0.7rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
              fontFamily: 'system-ui', cursor: 'pointer', border: '1.5px solid',
              borderColor: activeCategory === null ? '#7c3aed' : '#e5e7eb',
              background: activeCategory === null ? '#f5f3ff' : '#fff',
              color: activeCategory === null ? '#7c3aed' : '#9ca3af',
            }}>All</button>
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} style={{
                padding: '0.25rem 0.7rem', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600,
                fontFamily: 'system-ui', cursor: 'pointer', border: '1.5px solid',
                borderColor: activeCategory === cat ? '#7c3aed' : '#e5e7eb',
                background: activeCategory === cat ? '#f5f3ff' : '#fff',
                color: activeCategory === cat ? '#7c3aed' : '#9ca3af',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}>
                {CATEGORY_EMOJI[cat]} {CATEGORY_LABEL[cat]}
                <span style={{ color: activeCategory === cat ? '#a78bfa' : '#d1d5db' }}>
                  {sym}{categoryTotals[cat].toFixed(0)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Active */}
        {activeSubscriptions.length === 0 && !activeCategory ? (
          <div className="glass rounded-2xl p-6 shadow-lg text-center">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-base font-bold text-green-600 mb-1">You're reviewing everything!</p>
            <p className="text-sm text-gray-400">All your subscriptions are paused or stopped. Great work taking control.</p>
          </div>
        ) : filteredActive.length > 0 ? (
          <div className="glass rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Active {activeCategory ? `· ${CATEGORY_EMOJI[activeCategory]} ${CATEGORY_LABEL[activeCategory]}` : ''}
            </h3>
            <div className="space-y-3">
              {filteredActive.map(sub => (
                <SubscriptionCard key={sub.id} subscription={sub}
                  onDelete={onDelete} onCancel={onCancel} onStop={onStop}
                  onReactivate={onReactivate} onEdit={() => setEditingSub(sub)}
                  currency={currency} />
              ))}
            </div>
          </div>
        ) : null}

        {/* Paused */}
        {pausedSubscriptions.length > 0 && !activeCategory && (
          <div className="glass rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-700">⏸ Paused</h3>
              <div className="text-right">
                <span className="text-sm font-bold text-green-600">{sym}{totalPausedMonthly.toFixed(0)}/mo</span>
                <span className="text-xs text-green-500 ml-1">· {sym}{(totalPausedMonthly * 12).toFixed(0)}/yr saved</span>
              </div>
            </div>
            <div className="space-y-3">
              {pausedSubscriptions.map(sub => (
                <SubscriptionCard key={sub.id} subscription={sub}
                  onDelete={onDelete} onCancel={onCancel} onStop={onStop}
                  onReactivate={onReactivate} onEdit={() => setEditingSub(sub)}
                  currency={currency} isPaused />
              ))}
            </div>
          </div>
        )}

        {/* Stopped — collapsible */}
        {stoppedSubscriptions.length > 0 && !activeCategory && (
          <div style={{ borderRadius: 16, border: '1.5px solid #e5e7eb', background: '#fafafa', overflow: 'hidden' }}>
            {/* Header — always visible, clickable */}
            <button
              onClick={() => setStoppedExpanded(!stoppedExpanded)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontFamily: 'system-ui', fontSize: '0.95rem', fontWeight: 700, color: '#6b7280' }}>
                  🚫 Stopped
                </span>
                <span style={{
                  fontFamily: 'system-ui', fontSize: '0.75rem', fontWeight: 600,
                  color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: 99,
                }}>
                  {stoppedSubscriptions.length} {stoppedSubscriptions.length !== 1 ? 'items' : 'item'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'system-ui', fontSize: '0.95rem', fontWeight: 800, color: '#16a34a' }}>
                    {sym}{totalStoppedMonthly.toFixed(0)}/mo saved
                  </div>
                  <div style={{ fontFamily: 'system-ui', fontSize: '0.75rem', color: '#22c55e' }}>
                    = {sym}{(totalStoppedMonthly * 12).toFixed(0)}/yr
                  </div>
                </div>
                <span style={{ color: '#9ca3af', fontSize: '0.8rem', transition: 'transform 0.2s',
                  display: 'inline-block', transform: stoppedExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </div>
            </button>

            {/* Expanded content */}
            {stoppedExpanded && (
              <div style={{ borderTop: '1px solid #e5e7eb', padding: '0.75rem 1.25rem 1.25rem' }}>
                <div className="space-y-3">
                  {stoppedSubscriptions.map(sub => (
                    <SubscriptionCard key={sub.id} subscription={sub}
                      onDelete={onDelete} onCancel={onCancel} onStop={onStop}
                      onReactivate={onReactivate} onEdit={() => setEditingSub(sub)}
                      currency={currency} isStopped />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <ExportButton subscriptions={subscriptions} currency={currency} />
        </div>
      </div>
    </>
  )
}

function SubscriptionCard({
  subscription, onDelete, onCancel, onStop, onReactivate, onEdit,
  isPaused = false, isStopped = false, currency = 'EUR',
}: {
  subscription: Subscription
  onDelete: (id: string) => void
  onCancel: (id: string) => void
  onStop: (id: string) => void
  onReactivate: (id: string) => void
  onEdit: () => void
  isPaused?: boolean
  isStopped?: boolean
  currency?: Currency
}) {
  const monthly = getMonthlyEquivalent(subscription.cost, subscription.frequency)
  const sym = getCurrencySymbol(currency)

  const deadlineDays = !isPaused && !isStopped && !subscription.isTrial && subscription.renewalDate ? daysUntilCancelDeadline(subscription) : null
  const cancelDeadline = subscription.renewalDate && !isPaused && !isStopped
    ? (() => {
        const renewal = nextRenewalDate(subscription)
        if (!renewal) return null
        const d = new Date(renewal)
        d.setDate(d.getDate() - (subscription.noticePeriod ?? 30))
        return d
      })()
    : null

  const indicatorLevel =
    deadlineDays === null ? null :
    deadlineDays <= 7 ? 'red' :
    deadlineDays <= 15 ? 'amber' :
    deadlineDays <= 30 ? 'gray' : null

  const colors = {
    gray:  { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af', dot: '#d1d5db' },
    amber: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', dot: '#f59e0b' },
    red:   { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', dot: '#f43f5e' },
  }

  const trialDaysLeft = subscription.isTrial && subscription.trialEndsDate
    ? Math.ceil((new Date(subscription.trialEndsDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  const trialWarning = trialDaysLeft !== null && trialDaysLeft <= 7

  const cardBg = isStopped
    ? 'bg-gray-50 border border-gray-200'
    : isPaused
    ? 'bg-green-50 border border-green-100'
    : 'bg-white hover:shadow-md border border-gray-50'

  return (
    <div className={`p-4 rounded-xl transition-all ${cardBg}`} style={{ opacity: isStopped ? 0.7 : 1 }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="text-3xl flex-shrink-0" style={{ display: 'none' }}>
            {CATEGORY_EMOJI[subscription.category] || '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span className={`font-semibold truncate ${isStopped ? 'text-gray-400 line-through' : isPaused ? 'text-gray-600' : 'text-gray-900'}`}>
                {subscription.name}
              </span>
              {subscription.isTrial && !isStopped && (
                <span style={{
                  fontFamily: 'system-ui', fontSize: '0.62rem', fontWeight: 700, padding: '1px 6px',
                  borderRadius: 99, background: trialWarning ? '#fef3c7' : '#eff6ff',
                  color: trialWarning ? '#92400e' : '#1d4ed8',
                  border: `1px solid ${trialWarning ? '#fde68a' : '#bfdbfe'}`,
                }}>
                  {trialWarning ? `⚠️ Trial ends in ${trialDaysLeft}d` : `⏱️ Trial${trialDaysLeft !== null ? ` · ${trialDaysLeft}d left` : ''}`}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400 flex items-center gap-2 flex-wrap">
              <span>{sym}{subscription.cost.toFixed(2)}/{subscription.frequency}</span>
              {subscription.frequency !== 'monthly' && (
                <span className={isStopped ? 'text-gray-400' : 'text-primary-600'}>
                  ({sym}{monthly.toFixed(2)}/mo)
                </span>
              )}
              {isPaused && <span className="text-green-600 font-medium">· saving {sym}{(monthly * 12).toFixed(0)}/yr</span>}
              {isStopped && <span className="text-green-600 font-medium">· saving {sym}{(monthly * 12).toFixed(0)}/yr</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {!isStopped && (
            <button onClick={onEdit} style={{
              padding: '0.4rem 0.6rem', borderRadius: 8, border: '1.5px solid #e5e7eb',
              background: '#fff', color: '#9ca3af', cursor: 'pointer', fontSize: '0.8rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}

          {isStopped ? (
            // Stopped: only reactivate + delete
            <>
              <button onClick={() => onReactivate(subscription.id)} style={{
                padding: '0.4rem 0.9rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                border: '1.5px solid #d1d5db', background: '#fff', color: '#6b7280',
                cursor: 'pointer', fontFamily: 'system-ui',
              }}>Reactivate</button>
              <button onClick={() => onDelete(subscription.id)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-400 rounded-lg text-sm transition-colors flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </>
          ) : isPaused ? (
            // Paused: unpause + stop + delete
            <>
              <button onClick={() => onReactivate(subscription.id)}
                className="px-4 py-2 bg-white border-2 border-gray-300 hover:border-purple-400 hover:text-purple-600 text-gray-600 rounded-lg text-sm font-medium transition-all">
                Unpause
              </button>
              <button onClick={() => onStop(subscription.id)} style={{
                padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
                background: '#2C2269', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: 'system-ui', transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e1748')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2C2269')}>
                Stop
              </button>
              <button onClick={() => onDelete(subscription.id)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-sm transition-colors flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </>
          ) : (
            // Active: pause + stop + delete
            <>
              <button onClick={() => onCancel(subscription.id)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                Pause
              </button>
              <button onClick={() => onStop(subscription.id)} style={{
                padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
                background: '#2C2269', color: '#fff', border: 'none', cursor: 'pointer',
                fontFamily: 'system-ui', transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e1748')}
                onMouseLeave={e => (e.currentTarget.style.background = '#2C2269')}>
                Stop
              </button>
              <button onClick={() => onDelete(subscription.id)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg text-sm transition-colors flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cancel deadline indicator */}
      {indicatorLevel && cancelDeadline && (
        <div style={{
          marginTop: '0.6rem', marginLeft: '3.25rem',
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.25rem 0.7rem', borderRadius: 99,
          background: colors[indicatorLevel].bg,
          border: `1px solid ${colors[indicatorLevel].border}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: colors[indicatorLevel].dot }} />
          <span style={{ fontFamily: 'system-ui', fontSize: '0.72rem', fontWeight: 600, color: colors[indicatorLevel].text }}>
            {deadlineDays! <= 0
              ? `Cancel deadline passed — renews ${formatDate(subscription.renewalDate!)}`
              : `Cancel by ${formatDate(cancelDeadline)} to avoid renewal`}
          </span>
        </div>
      )}
    </div>
  )
}
