// Core data types for MoneyUnseen

export type BillingFrequency = 'monthly' | 'yearly' | 'quarterly' | 'weekly'

export type SubscriptionCategory = 
  | 'streaming'
  | 'fitness'
  | 'software'
  | 'music'
  | 'gaming'
  | 'food'
  | 'news'
  | 'insurance'
  | 'road_tax'
  | 'lottery'
  | 'sports_club'
  | 'hobby_club'
  | 'mobile_phone'
  | 'car_fuel'
  | 'utilities'
  | 'other'

export type GoalType = 'vacation' | 'investment' | 'family' | 'custom'

export interface Subscription {
  id: string
  name: string
  cost: number
  frequency: BillingFrequency
  category: SubscriptionCategory
  renewalDate: Date
  addedDate: Date
  isActive: boolean
  notes?: string
}

export interface UserGoal {
  type: GoalType
  title: string
  targetAmount: number // User can edit this
  description: string
  emoji: string
}

export interface UserProfile {
  id: string
  goal: UserGoal
  totalXP: number
  level: number
  streakDays: number
  lastReviewDate: Date
  createdDate: Date
  minimumViableSavings: number // Monthly target
}

export interface XPAction {
  id: string
  type: 'add_subscription' | 'cancel_subscription' | 'monthly_review' | 'hit_goal' | 'week_streak' | 'month_streak'
  xpEarned: number
  timestamp: Date
  subscriptionId?: string
  description: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  xpRequired: number
  isUnlocked: boolean
  unlockedDate?: Date
}

// XP calculation constants
export const XP_VALUES = {
  addSubscription: 10,
  cancelSubscription: 50,
  monthlyReview: 25,
  hitGoal: 100,
  weekStreak: 15,
  monthStreak: 50,
} as const

// Level calculation
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Subscription Apprentice',
  2: 'Cost Conscious',
  3: 'Budget Explorer',
  4: 'Savings Journeyman',
  5: 'Finance Tactician',
  6: 'Money Maestro',
  7: 'Wealth Architect',
  8: 'Savings Master',
  9: 'Financial Sage',
  10: 'MoneyUnseen Legend',
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  return currentLevel * 100
}

export function getLevelTitle(level: number): string {
  if (level >= 10) return LEVEL_TITLES[10]
  return LEVEL_TITLES[level] || LEVEL_TITLES[1]
}

// Calculate weighted XP for canceling subscription
export function calculateCancelXP(cost: number): number {
  const baseXP = XP_VALUES.cancelSubscription
  const bonusXP = Math.floor(cost / 10) // €10 = +1 XP
  return baseXP + bonusXP
}

// Calculate monthly cost from any frequency
export function getMonthlyEquivalent(cost: number, frequency: BillingFrequency): number {
  switch (frequency) {
    case 'monthly':
      return cost
    case 'yearly':
      return cost / 12
    case 'quarterly':
      return cost / 3
    case 'weekly':
      return cost * 4.33
  }
}
