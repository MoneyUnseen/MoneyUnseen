import type { Subscription, Currency } from '../types'
import { getMonthlyEquivalent, getCurrencySymbol, isFixedCostCategory } from '../types'

interface TwoWorldsViewProps {
  subscriptions: Subscription[]
  currency: Currency
}

export default function TwoWorldsView({ subscriptions, currency }: TwoWorldsViewProps) {
  const sym = getCurrencySymbol(currency)

  const isFixed = (s: Subscription) => s.isFixedCost || isFixedCostCategory(s.category)

  const activeSubs = subscriptions.filter(s => !isFixed(s) && s.isActive && !s.isStopped)
  const fixedCosts = subscriptions.filter(s => isFixed(s) && s.isActive && !s.isStopped)
  const savedItems = subscriptions.filter(s => !isFixed(s) && (!s.isActive || s.isStopped))

  const subsMonthly = activeSubs.reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
  const fixedMonthly = fixedCosts.reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
  const savedMonthly = savedItems.reduce((sum, s) => sum + getMonthlyEquivalent(s.cost, s.frequency), 0)
  const savedYearly = savedMonthly * 12
  const totalMonthly = subsMonthly + fixedMonthly + savedMonthly

  const hasFixed = fixedCosts.length > 0

  if (subscriptions.length === 0) return null

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg">

      {hasFixed ? (
        // Three-column view when fixed costs are present
        <div className="grid grid-cols-3">
          {/* Fixed costs */}
          <div className="bg-gray-100 border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Fixed costs</div>
            <div className="text-2xl font-bold text-gray-600">{sym}{fixedMonthly.toFixed(0)}</div>
            <div className="text-xs text-gray-400 mt-1">per month</div>
            <div className="mt-2 text-xs text-gray-500">{fixedCosts.length} {fixedCosts.length === 1 ? 'item' : 'items'}</div>
          </div>

          {/* Subscriptions */}
          <div className="bg-gray-50 border border-gray-100 p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Subscriptions</div>
            <div className="text-2xl font-bold text-gray-700">{sym}{subsMonthly.toFixed(0)}</div>
            <div className="text-xs text-gray-400 mt-1">per month</div>
            <div className="mt-2 text-xs text-gray-500">{activeSubs.length} active</div>
          </div>

          {/* Reclaimed */}
          <div className={`p-4 ${savedMonthly > 0 ? 'bg-green-500' : 'bg-gray-100 border border-gray-100'}`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${savedMonthly > 0 ? 'text-green-100' : 'text-gray-400'}`}>
              Reclaimed
            </div>
            {savedMonthly > 0 ? (
              <>
                <div className="text-2xl font-bold text-white">{sym}{savedMonthly.toFixed(0)}</div>
                <div className="text-xs text-green-100 mt-1">per month</div>
                <div className="mt-2 text-xs text-green-100">= {sym}{savedYearly.toFixed(0)}/yr 🎉</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-gray-300">{sym}0</div>
                <div className="text-xs text-gray-400 mt-1">per month</div>
                <div className="mt-2 text-xs text-gray-400">Pause a sub to save</div>
              </>
            )}
          </div>
        </div>
      ) : (
        // Original two-column view when no fixed costs yet
        <div className="grid grid-cols-2">
          <div className="bg-gray-50 border border-gray-100 p-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Still paying</div>
            <div className="text-3xl font-bold text-gray-700">{sym}{subsMonthly.toFixed(0)}</div>
            <div className="text-xs text-gray-400 mt-1">per month</div>
            <div className="mt-3 text-xs text-gray-500">
              {activeSubs.length} active {activeSubs.length === 1 ? 'item' : 'items'} tracked
            </div>
          </div>
          <div className={`p-5 ${savedMonthly > 0 ? 'bg-green-500' : 'bg-gray-100 border border-gray-100'}`}>
            <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${savedMonthly > 0 ? 'text-green-100' : 'text-gray-400'}`}>
              Reclaimed
            </div>
            {savedMonthly > 0 ? (
              <>
                <div className="text-3xl font-bold text-white">{sym}{savedMonthly.toFixed(0)}</div>
                <div className="text-xs text-green-100 mt-1">per month</div>
                <div className="mt-3 text-xs text-green-100">= {sym}{savedYearly.toFixed(0)} per year 🎉</div>
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
      )}

      {/* Yearly savings banner */}
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

      {/* Fixed costs insight — shown when both fixed + subs are present */}
      {hasFixed && subsMonthly > 0 && (
        <div className="bg-amber-50 border-t border-amber-100 px-5 py-3 flex items-center justify-between">
          <span className="text-xs text-amber-700">
            🏠 Fixed costs make up <strong>{Math.round((fixedMonthly / (fixedMonthly + subsMonthly)) * 100)}%</strong> of your tracked spend — subscriptions are the easiest place to start, but fixed costs often hide savings too
          </span>
        </div>
      )}
    </div>
  )
}
