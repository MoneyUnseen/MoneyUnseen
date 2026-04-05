import { listReminders, markReminderSent, sendReminderEmail, shouldSendToday } from '../_lib/reminders.js'

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(body))
}

function isAuthorizedCron(req) {
  if (req.headers['x-vercel-cron']) return true
  const token = process.env.CRON_SECRET
  if (!token) return true
  return req.headers['x-cron-secret'] === token || req.query?.token === token
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }
  if (!isAuthorizedCron(req)) {
    json(res, 401, { error: 'Unauthorized' })
    return
  }

  try {
    const reminders = await listReminders()
    let sent = 0
    let skipped = 0
    const errors = []

    for (const reminder of reminders) {
      if (!shouldSendToday(reminder, new Date())) {
        skipped += 1
        continue
      }
      try {
        await sendReminderEmail(reminder)
        await markReminderSent(reminder.itemId, new Date())
        sent += 1
      } catch (err) {
        errors.push({
          itemId: reminder.itemId,
          error: err instanceof Error ? err.message : 'Failed to send reminder',
        })
      }
    }

    json(res, 200, {
      ok: true,
      scanned: reminders.length,
      sent,
      skipped,
      errors,
    })
  } catch (err) {
    json(res, 500, { error: err instanceof Error ? err.message : 'Reminder cron failed' })
  }
}
