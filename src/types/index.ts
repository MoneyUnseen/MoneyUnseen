// MoneyUnseen - Refactored Type Definitions
// Calm, empowering financial awareness (no gamification)

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

export type MomentumPhase = 'starting' | 'building' | 'optimizing' | 'compounding' | 'independent'

export interface Subscription {
  id: string
  name: string
  cost: number
  frequency: BillingFrequency
  category: SubscriptionCategory
  renewalDate: Date
  addedDate: Date
  isActive: boolean
  pausedDate?: Date // NEW: Track when cost was paused
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
  currentMonthActions: number // Resets monthly
  lifetimeActions: number // Never resets (for profile page only)
  lastActionDate: Date
  lastReviewDate: Date
  createdDate: Date
  monthlyCheckInCompleted: boolean // Resets first Monday
  lastCheckInMonth: string // Format: "2026-02"
}

export interface ActionRecord {
  id: string
  type: 'add_cost' | 'review_cost' | 'pause_cost' | 'update_goal' | 'monthly_checkin'
  timestamp: Date
  description: string
  subscriptionId?: string
}

// Momentum Phase calculation
export function calculateMomentumPhase(actions: number): MomentumPhase {
  if (actions >= 21) return 'independent'
  if (actions >= 13) return 'compounding'
  if (actions >= 7) return 'optimizing'
  if (actions >= 3) return 'building'
  return 'starting'
}

export function getMomentumPhaseInfo(phase: MomentumPhase): {
  title: string
  emoji: string
  message: string
  nextPhase?: string
  nextThreshold?: number
} {
  const phases = {
    starting: {
      title: 'Starting Phase',
      emoji: '🌱',
      message: "You're beginning to see your costs clearly",
      nextPhase: 'Building',
      nextThreshold: 3,
    },
    building: {
      title: 'Building Phase',
      emoji: '🔨',
      message: "You're building awareness of your spending patterns",
      nextPhase: 'Optimizing',
      nextThreshold: 7,
    },
    optimizing: {
      title: 'Optimizing Phase',
      emoji: '⚡',
      message: "You're actively reshaping your financial landscape",
      nextPhase: 'Compounding',
      nextThreshold: 13,
    },
    compounding: {
      title: 'Compounding Phase',
      emoji: '🌊',
      message: 'Your intentional choices are compounding',
      nextPhase: 'Independent',
      nextThreshold: 21,
    },
    independent: {
      title: 'Independent Phase',
      emoji: '🎯',
      message: "You've built lasting financial awareness",
    },
  }
  return phases[phase]
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

// Check if it's the first Monday of the month
export function isFirstMondayOfMonth(): boolean {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayOfMonth = today.getDate()
  
  // Is it Monday (1) and within the first 7 days?
  return dayOfWeek === 1 && dayOfMonth <= 7
}

// Get current month string for check-in tracking
export function getCurrentMonthString(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

// Check if monthly reset is needed
export function needsMonthlyReset(lastActionDate: Date): boolean {
  const today = new Date()
  return lastActionDate.getMonth() !== today.getMonth() || 
         lastActionDate.getFullYear() !== today.getFullYear()
}