export type BillingFrequency = 'monthly' | 'yearly' | 'quarterly' | 'weekly'
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'AUD' | 'CAD' | 'JPY'

// Subscriptions — discretionary, cancellable
export type SubscriptionCategory = 
  | 'streaming' | 'fitness' | 'software' | 'music' | 'gaming'
  | 'food' | 'news' | 'lottery' | 'sports_club' | 'hobby_club'
  | 'webshop' | 'magazine' | 'other_sub'
  // Legacy categories (kept for backwards compatibility with existing user data)
  | 'insurance' | 'utilities' | 'other' | 'mobile_phone' | 'car_fuel' | 'maintenance'

// Fixed costs — vaste lasten, niet opzegbaar
export type FixedCostCategory =
  | 'mortgage' | 'rent' | 'health_insurance' | 'disability_insurance'
  | 'home_insurance' | 'car_insurance' | 'pension' | 'energy'
  | 'mobile_phone' | 'internet' | 'road_tax' | 'municipal_tax'
  | 'childcare' | 'car_fuel' | 'maintenance' | 'road_service'
  | 'service_contract' | 'other_fixed'

export type SubscriptionCategory_All = SubscriptionCategory | FixedCostCategory

export type GoalType = 'quick_win' | 'medium' | 'longterm' | 'custom'

export interface Subscription {
  id: string
  name: string
  cost: number
  frequency: BillingFrequency
  category: SubscriptionCategory_All
  renewalDate: Date
  addedDate: Date
  isActive: boolean
  isStopped?: boolean
  notes?: string
  isTrial?: boolean
  trialEndsDate?: Date
  noticePeriod?: number
  isFixedCost?: boolean  // true = vaste last, niet opzegbaar
}

export interface UserGoal {
  id: string
  type: GoalType
  title: string
  targetAmount: number
  description: string
  emoji: string
  monthsToGoal?: number
}

export interface UserProfile {
  id: string
  goals: UserGoal[]
  email?: string
  emailVerified?: boolean
  currency: Currency
  totalXP: number
  level: number
  streakDays: number
  lastReviewDate: Date
  createdDate: Date
  minimumViableSavings: number
}

export interface XPAction {
  id: string
  type: 'add_subscription' | 'cancel_subscription' | 'monthly_review' | 'hit_goal' | 'week_streak' | 'month_streak'
  xpEarned: number
  timestamp: Date
  subscriptionId?: string
  description: string
}

// Which categories are fixed costs
export const FIXED_COST_CATEGORIES = new Set<string>([
  'mortgage', 'rent', 'health_insurance', 'disability_insurance',
  'home_insurance', 'car_insurance', 'pension', 'energy',
  'mobile_phone', 'internet', 'road_tax', 'municipal_tax',
  'childcare', 'car_fuel', 'maintenance', 'road_service',
  'service_contract', 'other_fixed',
  // Legacy values from v15 and earlier — map to fixed
  'utilities', 'insurance',
])

export function isFixedCostCategory(cat: string): boolean {
  return FIXED_COST_CATEGORIES.has(cat)
}

export function calculateCancelXP(cost: number): number {
  return 50 + Math.floor(cost / 10)
}

export function getMonthlyEquivalent(cost: number, frequency: BillingFrequency): number {
  switch (frequency) {
    case 'monthly': return cost
    case 'yearly': return cost / 12
    case 'quarterly': return cost / 3
    case 'weekly': return cost * 4.33
  }
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    EUR: '€', USD: '$', GBP: '£', CHF: 'CHF',
    SEK: 'kr', NOK: 'kr', DKK: 'kr',
    AUD: 'A$', CAD: 'C$', JPY: '¥',
  }
  return symbols[currency] ?? '€'
}

// Generate smart goals based on monthly savings amount
export function generateSmartGoals(monthlySavings: number, currency: Currency = 'EUR'): UserGoal[] {
  const sym = getCurrencySymbol(currency)
  if (monthlySavings <= 0) return []

  const fx = currency === 'USD' ? 1.15 : currency === 'GBP' ? 1.1 : 1.0
  const scale = (n: number) => Math.round(n * fx / 5) * 5

  const goals: UserGoal[] = []

  if (monthlySavings < 15) {
    const target = Math.max(scale(60), Math.round(monthlySavings * 3))
    goals.push({ id: 'g1', type: 'quick_win', emoji: '🍽️', title: 'Dinner for two', targetAmount: target, description: 'A proper dinner out — you earned it', monthsToGoal: Math.ceil(target / monthlySavings) })
  } else if (monthlySavings < 40) {
    const target = scale(150)
    goals.push({ id: 'g1', type: 'quick_win', emoji: '🎉', title: 'Fun day out', targetAmount: target, description: 'A day out with friends or family', monthsToGoal: Math.ceil(target / monthlySavings) })
  } else {
    const target = scale(350)
    goals.push({ id: 'g1', type: 'quick_win', emoji: '🎁', title: 'Family day out', targetAmount: target, description: 'Theme park, day trip, something to look forward to', monthsToGoal: Math.ceil(target / monthlySavings) })
  }

  const emergencyTarget = scale(monthlySavings < 30 ? 500 : monthlySavings < 60 ? 1000 : 2000)
  goals.push({
    id: 'g2', type: 'medium', emoji: '🛡️', title: 'Emergency buffer',
    targetAmount: emergencyTarget,
    description: `${emergencyTarget === 500 ? 'A small safety net' : emergencyTarget === 1000 ? '1 month of breathing room' : '2 months of financial security'} — for when life surprises you`,
    monthsToGoal: Math.ceil(emergencyTarget / monthlySavings)
  })

  const childTarget = Math.round(monthlySavings * 18 * fx)
  goals.push({
    id: 'g3', type: 'medium', emoji: '👶', title: "Your child's future",
    targetAmount: childTarget,
    description: `Start a fund for education, a first car, or just a head start in life`,
    monthsToGoal: 18
  })

  const tenYearAmount = Math.round(monthlySavings * 12 * 10 * 1.05)
  goals.push({
    id: 'g4', type: 'longterm', emoji: '📈', title: 'Build real wealth',
    targetAmount: tenYearAmount,
    description: `${sym}${Math.round(monthlySavings)}/month saved → ${sym}${Math.round(tenYearAmount)} in 10 years`,
    monthsToGoal: 120
  })

  return goals
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1
}
