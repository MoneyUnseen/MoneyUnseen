import { kv } from '@vercel/kv'

const INDEX_KEY = 'reminders:index'

function reminderKey(itemId) {
  return `reminders:item:${itemId}`
}

export function toUtcDateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function isoDay(date) {
  return toUtcDateOnly(date).toISOString().slice(0, 10)
}

function addInterval(date, frequency) {
  const d = new Date(date.getTime())
  switch (frequency) {
    case 'weekly':
      d.setUTCDate(d.getUTCDate() + 7)
      return d
    case 'quarterly':
      d.setUTCMonth(d.getUTCMonth() + 3)
      return d
    case 'yearly':
      d.setUTCFullYear(d.getUTCFullYear() + 1)
      return d
    case 'monthly':
    default:
      d.setUTCMonth(d.getUTCMonth() + 1)
      return d
  }
}

export function getNextRenewalDate(renewalDateIso, frequency, now = new Date()) {
  let renewal = new Date(renewalDateIso)
  if (Number.isNaN(renewal.getTime())) {
    return null
  }
  const today = toUtcDateOnly(now)
  renewal = toUtcDateOnly(renewal)
  while (renewal < today) {
    renewal = toUtcDateOnly(addInterval(renewal, frequency || 'monthly'))
  }
  return renewal
}

export function daysUntil(targetDate, now = new Date()) {
  const ms = toUtcDateOnly(targetDate).getTime() - toUtcDateOnly(now).getTime()
  return Math.round(ms / 86400000)
}

export async function upsertReminder(input) {
  const reminder = {
    email: String(input.email || '').trim().toLowerCase(),
    itemId: String(input.itemId || '').trim(),
    serviceName: String(input.serviceName || '').trim(),
    renewalDate: new Date(input.renewalDate).toISOString(),
    frequency: input.frequency || 'monthly',
    leadDays: Number.isFinite(input.leadDays) ? Number(input.leadDays) : 7,
    active: true,
    updatedAt: new Date().toISOString(),
    lastReminderSentOn: input.lastReminderSentOn || null,
  }

  await kv.set(reminderKey(reminder.itemId), reminder)
  await kv.sadd(INDEX_KEY, reminder.itemId)
  return reminder
}

export async function removeReminder(itemId) {
  await kv.del(reminderKey(itemId))
  await kv.srem(INDEX_KEY, itemId)
}

export async function listReminders() {
  const ids = await kv.smembers(INDEX_KEY)
  if (!ids || ids.length === 0) return []
  const reminders = await Promise.all(ids.map((id) => kv.get(reminderKey(id))))
  return reminders.filter(Boolean)
}

export async function markReminderSent(itemId, now = new Date()) {
  const key = reminderKey(itemId)
  const reminder = await kv.get(key)
  if (!reminder) return
  reminder.lastReminderSentOn = isoDay(now)
  reminder.updatedAt = now.toISOString()
  await kv.set(key, reminder)
}

export function shouldSendToday(reminder, now = new Date()) {
  if (!reminder?.active) return false
  const nextRenewal = getNextRenewalDate(reminder.renewalDate, reminder.frequency, now)
  if (!nextRenewal) return false
  const dueInDays = daysUntil(nextRenewal, now)
  if (dueInDays !== (reminder.leadDays || 7)) return false
  if (reminder.lastReminderSentOn === isoDay(now)) return false
  return true
}

export async function sendReminderEmail(reminder) {
  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.REMINDER_FROM_EMAIL || 'MoneyUnseen <reminders@moneyunseen.com>'
  if (!resendKey) {
    throw new Error('RESEND_API_KEY missing')
  }
  const nextRenewal = getNextRenewalDate(reminder.renewalDate, reminder.frequency, new Date())
  const renewalLabel = nextRenewal ? nextRenewal.toISOString().slice(0, 10) : reminder.renewalDate.slice(0, 10)
  const subject = `Renewal reminder: ${reminder.serviceName} renews in 7 days`

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">Renewal reminder</h2>
      <p><strong>${reminder.serviceName}</strong> renews on <strong>${renewalLabel}</strong>.</p>
      <p>You still have time to review, pause, or cancel before the next charge.</p>
      <p style="margin-top: 18px; color: #6b7280; font-size: 12px;">Sent by MoneyUnseen reminders.</p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [reminder.email],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error (${res.status}): ${body || 'unknown error'}`)
  }
}
