import { upsertReminder } from './_lib/reminders.js'

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(body))
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  const { email, itemId, serviceName, renewalDate, frequency } = req.body || {}
  if (!email || !itemId || !serviceName || !renewalDate) {
    json(res, 400, { error: 'Missing required fields: email, itemId, serviceName, renewalDate' })
    return
  }

  const parsed = new Date(renewalDate)
  if (Number.isNaN(parsed.getTime())) {
    json(res, 400, { error: 'Invalid renewalDate' })
    return
  }

  try {
    const reminder = await upsertReminder({
      email,
      itemId,
      serviceName,
      renewalDate: parsed.toISOString(),
      frequency,
      leadDays: 7,
    })
    json(res, 200, { ok: true, reminder })
  } catch (err) {
    json(res, 500, { error: err instanceof Error ? err.message : 'Failed to store reminder' })
  }
}
