import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Subscription, UserProfile, ActionRecord } from '../types'
import { getCurrentMonthString, needsMonthlyReset } from '../types'

interface MoneyUnseenDB extends DBSchema {
  subscriptions: {
    key: string
    value: Subscription
    indexes: { 'by-date': Date; 'by-category': string }
  }
  profile: {
    key: string
    value: UserProfile
  }
  actions: {
    key: string
    value: ActionRecord
    indexes: { 'by-date': Date }
  }
}

const DB_NAME = 'moneyunseen-db'
const DB_VERSION = 2 // Increment for migration

let dbInstance: IDBPDatabase<MoneyUnseenDB> | null = null

export async function getDB(): Promise<IDBPDatabase<MoneyUnseenDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<MoneyUnseenDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Subscriptions store
      if (!db.objectStoreNames.contains('subscriptions')) {
        const subStore = db.createObjectStore('subscriptions', { keyPath: 'id' })
        subStore.createIndex('by-date', 'addedDate')
        subStore.createIndex('by-category', 'category')
      }

      // Profile store
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' })
      }

      // Actions store (renamed from Actions)
      if (oldVersion < 2) {
        // Delete old Actions store if it exists
        if (db.objectStoreNames.contains('Actions')) {
          db.deleteObjectStore('Actions')
        }
        // Create new actions store
        const actionStore = db.createObjectStore('actions', { keyPath: 'id' })
        actionStore.createIndex('by-date', 'timestamp')
      }
    },
  })

  return dbInstance
}

// Subscription operations
export async function addSubscription(subscription: Subscription): Promise<void> {
  const db = await getDB()
  await db.add('subscriptions', subscription)
}

export async function updateSubscription(subscription: Subscription): Promise<void> {
  const db = await getDB()
  await db.put('subscriptions', subscription)
}

export async function deleteSubscription(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('subscriptions', id)
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const db = await getDB()
  const subs = await db.getAll('subscriptions')
  // Convert dates from strings if needed
  return subs.map(sub => ({
    ...sub,
    addedDate: new Date(sub.addedDate),
    renewalDate: new Date(sub.renewalDate),
    pausedDate: sub.pausedDate ? new Date(sub.pausedDate) : undefined,
  }))
}

export async function getActiveSubscriptions(): Promise<Subscription[]> {
  const all = await getAllSubscriptions()
  return all.filter(sub => sub.isActive)
}

// Profile operations
export async function getProfile(): Promise<UserProfile | undefined> {
  const db = await getDB()
  const profiles = await db.getAll('profile')
  if (profiles.length === 0) return undefined
  
  const profile = profiles[0]
  
  // Convert dates from strings if needed
  const converted: UserProfile = {
    ...profile,
    lastActionDate: new Date(profile.lastActionDate),
    lastReviewDate: new Date(profile.lastReviewDate),
    createdDate: new Date(profile.createdDate),
  }
  
  // Check if monthly reset needed
  if (needsMonthlyReset(converted.lastActionDate)) {
    converted.currentMonthActions = 0
    await saveProfile(converted)
  }
  
  return converted
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB()
  await db.put('profile', profile)
}

export async function createDefaultProfile(): Promise<UserProfile> {
  const profile: UserProfile = {
    id: 'default',
    goal: {
      type: 'vacation',
      title: 'Barcelona Weekend Trip',
      targetAmount: 1200,
      description: 'Weekend getaway',
      emoji: '✈️',
    },
    currentMonthActions: 0,
    lifetimeActions: 0,
    lastActionDate: new Date(),
    lastReviewDate: new Date(),
    createdDate: new Date(),
    monthlyCheckInCompleted: false,
    lastCheckInMonth: getCurrentMonthString(),
  }
  await saveProfile(profile)
  return profile
}

// Action operations
export async function addActionRecord(action: ActionRecord): Promise<void> {
  const db = await getDB()
  await db.add('actions', action)
}

export async function getAllActions(): Promise<ActionRecord[]> {
  const db = await getDB()
  const actions = await db.getAll('actions')
  return actions.map(action => ({
    ...action,
    timestamp: new Date(action.timestamp),
  }))
}

export async function getRecentActions(limit: number = 10): Promise<ActionRecord[]> {
  const all = await getAllActions()
  return all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
}

// Record an action and update profile
export async function recordAction(
  type: ActionRecord['type'],
  description: string,
  subscriptionId?: string
): Promise<void> {
  const profile = await getProfile()
  if (!profile) return

  // Create action record
  const action: ActionRecord = {
    id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    timestamp: new Date(),
    description,
    subscriptionId,
  }

  await addActionRecord(action)

  // Update profile
  profile.currentMonthActions++
  profile.lifetimeActions++
  profile.lastActionDate = new Date()
  await saveProfile(profile)
}

// Export all data as JSON (for backup/export feature)
export async function exportAllData(): Promise<string> {
  const subscriptions = await getAllSubscriptions()
  const profile = await getProfile()
  const actions = await getAllActions()

  return JSON.stringify({
    subscriptions,
    profile,
    actions,
    exportDate: new Date(),
    version: 2,
  }, null, 2)
}

// Clear all data (for testing or reset)
export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await db.clear('subscriptions')
  await db.clear('profile')
  await db.clear('actions')
}

// Migration helper for existing users
export async function migrateFromV1(): Promise<boolean> {
  try {
    const profile = await getProfile()
    
    // Check if this looks like old profile (has totalXP, level, etc.)
    const profileData = profile as any
    if (profileData && (profileData.totalXP !== undefined || profileData.level !== undefined)) {
      // This is an old profile, migrate it
      const migratedProfile: UserProfile = {
        id: profileData.id || 'default',
        goal: profileData.goal || {
          type: 'vacation',
          title: 'Barcelona Weekend Trip',
          targetAmount: 1200,
          description: 'Weekend getaway',
          emoji: '✈️',
        },
        currentMonthActions: 0, // Fresh start
        lifetimeActions: 0, // Fresh start
        lastActionDate: new Date(),
        lastReviewDate: profileData.lastReviewDate ? new Date(profileData.lastReviewDate) : new Date(),
        createdDate: profileData.createdDate ? new Date(profileData.createdDate) : new Date(),
        monthlyCheckInCompleted: false,
        lastCheckInMonth: getCurrentMonthString(),
      }
      
      await saveProfile(migratedProfile)
      console.log('✅ Profile migrated from V1 to V2')
      return true
    }
    
    return false // No migration needed
  } catch (error) {
    console.error('Migration error:', error)
    return false
  }
}