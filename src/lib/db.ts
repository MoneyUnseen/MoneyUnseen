import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Subscription, UserProfile, XPAction } from '../types'

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
  xpActions: {
    key: string
    value: XPAction
    indexes: { 'by-date': Date }
  }
}

const DB_NAME = 'moneyunseen-db'
const DB_VERSION = 3

let dbInstance: IDBPDatabase<MoneyUnseenDB> | null = null

export async function getDB(): Promise<IDBPDatabase<MoneyUnseenDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<MoneyUnseenDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('subscriptions')) {
        const s = db.createObjectStore('subscriptions', { keyPath: 'id' })
        s.createIndex('by-date', 'addedDate')
        s.createIndex('by-category', 'category')
      }
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('xpActions')) {
        const x = db.createObjectStore('xpActions', { keyPath: 'id' })
        x.createIndex('by-date', 'timestamp')
      }
    },
  })
  return dbInstance
}

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
  return db.getAll('subscriptions')
}

export async function getProfile(): Promise<UserProfile | undefined> {
  const db = await getDB()
  const profiles = await db.getAll('profile')
  return profiles[0]
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB()
  await db.put('profile', profile)
}

export async function createDefaultProfile(): Promise<UserProfile> {
  const profile: UserProfile = {
    id: 'default',
    goals: [],
    currency: 'EUR',
    email: undefined,
    emailVerified: false,
    totalXP: 0,
    level: 1,
    streakDays: 0,
    lastReviewDate: new Date(),
    createdDate: new Date(),
    minimumViableSavings: 50,
  }
  await saveProfile(profile)
  return profile
}

export async function awardXP(xpAmount: number, actionType: XPAction['type'], description: string, subscriptionId?: string): Promise<void> {
  const profile = await getProfile()
  if (!profile) return
  const action: XPAction = {
    id: `xp-${Date.now()}`,
    type: actionType,
    xpEarned: xpAmount,
    timestamp: new Date(),
    subscriptionId,
    description,
  }
  const db = await getDB()
  await db.add('xpActions', action)
  profile.totalXP += xpAmount
  profile.level = Math.floor(profile.totalXP / 100) + 1
  await saveProfile(profile)
}

export async function getRecentXPActions(limit: number = 10): Promise<XPAction[]> {
  const db = await getDB()
  const all = await db.getAll('xpActions')
  return all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
}
