import { useState, useEffect } from 'react'
import type { Subscription, UserProfile, UserGoal, Currency } from '../types'
import * as db from '../lib/db'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setSubscriptions(await db.getAllSubscriptions())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addSubscription = async (subscription: Omit<Subscription, 'id' | 'addedDate' | 'isActive'>) => {
    const newSub: Subscription = { ...subscription, id: `sub-${Date.now()}`, addedDate: new Date(), isActive: true }
    await db.addSubscription(newSub)
    await load()
  }

  const updateSubscription = async (subscription: Subscription) => {
    await db.updateSubscription(subscription)
    await load()
  }

  const deleteSubscription = async (id: string) => {
    await db.deleteSubscription(id)
    await load()
  }

  const cancelSubscription = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (sub) {
      await db.updateSubscription({ ...sub, isActive: false })
      await load()
    }
  }

  const reactivateSubscription = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (sub) {
      await db.updateSubscription({ ...sub, isActive: true, isStopped: false })
      await load()
    }
  }

  const stopSubscription = async (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (sub) {
      await db.updateSubscription({ ...sub, isActive: false, isStopped: true })
      await load()
    }
  }

  return { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription, cancelSubscription, reactivateSubscription, stopSubscription, refresh: load }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    let prof = await db.getProfile()
    if (!prof) prof = await db.createDefaultProfile()
    setProfile(prof)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateGoals = async (goals: UserGoal[]) => {
    if (!profile) return
    const updated = { ...profile, goals }
    await db.saveProfile(updated)
    setProfile(updated)
  }

  const toggleGoal = async (goal: UserGoal) => {
    if (!profile) return
    const currentGoals = profile.goals ?? []
    const exists = currentGoals.find(g => g.id === goal.id)
    const newGoals = exists
      ? currentGoals.filter(g => g.id !== goal.id)
      : [...currentGoals, goal]
    await updateGoals(newGoals)
  }

  const setEmail = async (email: string) => {
    if (!profile) return
    const updated = { ...profile, email, emailVerified: true }
    await db.saveProfile(updated)
    setProfile(updated)
  }

  const setCurrency = async (currency: Currency) => {
    if (!profile) return
    const updated = { ...profile, currency }
    await db.saveProfile(updated)
    setProfile(updated)
  }

  return { profile, loading, updateGoals, toggleGoal, setEmail, setCurrency, refresh: load }
}
