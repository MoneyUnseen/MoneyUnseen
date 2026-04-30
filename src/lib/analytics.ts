type EventValue = string | number | boolean | null

type EventPayload = Record<string, EventValue>

export type MonetizationEventName =
  | 'premium_hook_impression'
  | 'premium_hook_click'
  | 'premium_hook_enabled'
  | 'reminder_toggle_attempt'
  | 'reminder_toggle_success'
  | 'reminder_toggle_blocked'
  | 'reminder_toggle_failed'
  | 'signup_started'
  | 'signup_completed'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'first_item_added'
  | 'third_item_added'
  | 'return_visit'

interface MonetizationEvent {
  id: string
  name: MonetizationEventName
  timestamp: string
  sessionId: string
  userId: string
  payload: EventPayload
}

const EVENT_QUEUE_KEY = 'moneyunseen-monetization-events'
const SESSION_ID_KEY = 'moneyunseen-session-id'
const USER_ID_KEY = 'moneyunseen-anon-user-id'
const MAX_QUEUE_SIZE = 300

function randomId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_KEY)
    if (existing) return existing
    const created = randomId()
    sessionStorage.setItem(SESSION_ID_KEY, created)
    return created
  } catch {
    return 'session-unavailable'
  }
}

function readQueue(): MonetizationEvent[] {
  try {
    const raw = localStorage.getItem(EVENT_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as MonetizationEvent[]
  } catch {
    return []
  }
}

function getUserId(): string {
  try {
    const existing = localStorage.getItem(USER_ID_KEY)
    if (existing) return existing
    const created = randomId()
    localStorage.setItem(USER_ID_KEY, created)
    return created
  } catch {
    return 'user-unavailable'
  }
}

function writeQueue(queue: MonetizationEvent[]) {
  try {
    localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE_SIZE)))
  } catch {
    // Ignore storage failures; telemetry is non-critical.
  }
}

async function shipEvent(event: MonetizationEvent) {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim()
  if (!endpoint) return

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    })
  } catch {
    // Keep local queue even when shipping fails.
  }
}

export function trackMonetizationEvent(
  name: MonetizationEventName,
  payload: EventPayload = {}
) {
  const event: MonetizationEvent = {
    id: randomId(),
    name,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    userId: getUserId(),
    payload,
  }

  const queue = readQueue()
  queue.push(event)
  writeQueue(queue)
  void shipEvent(event)
}
