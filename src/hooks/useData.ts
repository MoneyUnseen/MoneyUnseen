import { getCurrentMonthString } from '../types'
import { useState, useEffect } from 'react'
import type { Subscription, UserProfile, ActionRecord } from '../types'
import * as db from '../lib/db'

// Hook for managing subscriptions
export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const loadSubscriptions = async () => {
    setLoading(true)
    const subs = await db.getAllSubscriptions()
    setSubscriptions(subs)
    setLoading(false)
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'addedDate' | 'isActive'>) => {
    const newSub: Subscription = {
      ...subscription,
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      addedDate: new Date(),
      isActive: true,
    }
    await db.addSubscription(newSub)
    await db.recordAction('add_cost', `Added ${newSub.name}`, newSub.id)
    await loadSubscriptions()
  }

  const updateSubscription = async (subscription: Subscription) => {
    await db.updateSubscription(subscription)
    await loadSubscriptions()
  }

  const deleteSubscription = async (id: string) => {
    await db.deleteSubscription(id)
    await loadSubscriptions()
  }

  const pauseSubscription = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (sub) {
      const updated = { ...sub, isActive: false, pausedDate: new Date() }
      await db.updateSubscription(updated)
      await db.recordAction('pause_cost', `Paused ${sub.name}`, id)
      await loadSubscriptions()
    }
  }

  const unpauseSubscription = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (sub) {
      const updated = { ...sub, isActive: true, pausedDate: undefined }
      await db.updateSubscription(updated)
      await loadSubscriptions()
    }
  }

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    pauseSubscription,
    unpauseSubscription,
    refresh: loadSubscriptions,
  }
}

// Hook for managing user profile
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    setLoading(true)
    
    // Run migration check on first load
    await db.migrateFromV1()
    
    let prof = await db.getProfile()
    if (!prof) {
      prof = await db.createDefaultProfile()
    }
    setProfile(prof)
    setLoading(false)
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const updateGoal = async (goal: UserProfile['goal']) => {
    if (!profile) return
    const updated = { ...profile, goal }
    await db.saveProfile(updated)
    await db.recordAction('update_goal', `Updated goal to ${goal.title}`)
    setProfile(updated)
  }

  const completeMonthlyCheckIn = async () => {
    if (!profile) return
    const updated = { 
      ...profile, 
      monthlyCheckInCompleted: true,
      lastReviewDate: new Date(),
      lastCheckInMonth: getCurrentMonthString()
    }
    await db.saveProfile(updated)
    await db.recordAction('monthly_checkin', 'Completed monthly check-in')
    await loadProfile() // Reload to get action count updated
  }

  return {
    profile,
    loading,
    updateGoal,
    completeMonthlyCheckIn,
    refresh: loadProfile,
  }
}

// Hook for recent actions
export function useActions(limit: number = 10) {
  const [actions, setActions] = useState<ActionRecord[]>([])
  const [loading, setLoading] = useState(true)

  const loadActions = async () => {
    setLoading(true)
    const acts = await db.getRecentActions(limit)
    setActions(acts)
    setLoading(false)
  }

  useEffect(() => {
    loadActions()
  }, [limit])

  return {
    actions,
    loading,
    refresh: loadActions,
  }
}