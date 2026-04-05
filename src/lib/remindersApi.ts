import type { BillingFrequency } from '../types'

const REMINDERS_API_URL = ((import.meta as any).env?.VITE_REMINDERS_API_URL as string | undefined) || '/api/reminders'

interface CreateReminderInput {
  email: string
  itemId: string
  serviceName: string
  renewalDate: string
  frequency?: BillingFrequency
}

export async function createReminder(input: CreateReminderInput): Promise<void> {
  const res = await fetch(REMINDERS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to create reminder (${res.status}): ${body || 'unknown error'}`)
  }
}

export async function deleteReminder(itemId: string): Promise<void> {
  const res = await fetch(`${REMINDERS_API_URL}/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  })
  if (!res.ok && res.status !== 404) {
    const body = await res.text()
    throw new Error(`Failed to delete reminder (${res.status}): ${body || 'unknown error'}`)
  }
}
