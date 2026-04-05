import { removeReminder } from '../_lib/reminders.js'

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(body))
}

export default async function handler(req, res) {
  const itemId = String(req.query?.itemId || '').trim()
  if (!itemId) {
    json(res, 400, { error: 'Missing itemId' })
    return
  }

  if (req.method !== 'DELETE') {
    json(res, 405, { error: 'Method not allowed' })
    return
  }

  try {
    await removeReminder(itemId)
    json(res, 200, { ok: true })
  } catch (err) {
    json(res, 500, { error: err instanceof Error ? err.message : 'Failed to remove reminder' })
  }
}
