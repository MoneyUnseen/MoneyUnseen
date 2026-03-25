import type { Subscription, Currency } from '../types'
import { getMonthlyEquivalent, getCurrencySymbol } from '../types'

interface TwoWorldsViewProps {
  subscriptions: Subscription[]
  currency: Currency
}

export default function TwoWorldsView({ subscriptions, currency }: TwoWorldsViewProps) {
  const sym = getCurrencySymbol(currency)

  const activeMonthly = subscriptions
    .filter(s => s.isActive && !s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const savedMonthly = subscriptions
    .filter(s => !s.isActive || s.isStopped)
    .reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)

  const savedYearly = savedMonthly * 12
  const totalMonthly = activeMonthly + savedMonthly
  const activeCount = subscriptions.filter(s => s.isActive && !s.isStopped).length

  if (subscriptions.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">
      <div className="grid grid-cols-2">
        {/* Left — still paying */}
        <div className="bg-gray-50 border border-gray-100 p-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Still paying</div>
          <div className="text-3xl font-bold text-gray-700">{sym}{activeMonthly.toFixed(0)}</div>
          <div className="text-xs text-gray-400 mt-1">per month</div>
          <div className="mt-3 text-xs text-gray-500">
            {activeCount} active {activeCount === 1 ? 'item' : 'items'} tracked
          </div>
        </div>

        {/* Right — reclaimed */}
        <div className={`p-5 ${savedMonthly > 0 ? 'bg-green-500' : 'bg-gray-100 border border-gray-100'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${savedMonthly > 0 ? 'text-green-100' : 'text-gray-400'}`}>
            Reclaimed
          </div>
          {savedMonthly > 0 ? (
            <>
              <div className="text-3xl font-bold text-white">{sym}{savedMonthly.toFixed(0)}</div>
              <div className="text-xs text-green-100 mt-1">per month</div>
              <div className="mt-3 text-xs text-green-100">
                = {sym}{savedYearly.toFixed(0)} per year 🎉
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-300">{sym}0</div>
              <div className="text-xs text-gray-400 mt-1">per month</div>
              <div className="mt-3 text-xs text-gray-400">Pause a subscription to start saving</div>
            </>
          )}
        </div>
      </div>

      {/* Yearly savings banner — only when saving */}
      {savedMonthly > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)' }} className="px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-green-200 font-medium">💰 Yearly savings</span>
          <span className="text-base font-bold text-white">{sym}{savedYearly.toFixed(0)} per year</span>
        </div>
      )}

      {/* Total bar */}
      {totalMonthly > 0 && (
        <div className="bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">Total tracked</span>
          <span className="text-sm font-bold text-gray-700">{sym}{totalMonthly.toFixed(2)}/month</span>
        </div>
      )}
    </div>
  )
}
