const STORAGE_KEY = 'gym_notifications'
const CHANGE_EVENT = 'gym-notifications-changed'
const MAX_ITEMS = 40

const MOTIVATION_QUOTES = [
  'Push yourself, because no one else is going to do it for you!',
  'The only bad workout is the one that didn\'t happen.',
  'Your body can stand almost anything. It\'s your mind that you have to convince.',
  'Success isn\'t always about greatness. It\'s about consistency.',
  'Don\'t wait for motivation. Create it.',
  'The pain you feel today will be the strength you feel tomorrow.',
  'Your limitation—it\'s only your imagination.',
  'Great things never came from comfort zones.',
  'Dream bigger. Do bigger.',
  'Believe in yourself and all that you are.',
  'You don\'t have to be great to start, but you have to start to be great.',
  'The hardest lift is the first one off the couch.',
  'Train hard, stay humble.',
  'Rest when you\'re tired. But never give up.',
  'Your future self will thank you for the effort you put in today.',
]

function getRandomQuote() {
  return MOTIVATION_QUOTES[Math.floor(Math.random() * MOTIVATION_QUOTES.length)]
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readNotifications() {
  if (!canUseStorage()) return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeNotifications(notifications) {
  if (!canUseStorage()) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  // Dispatch custom event immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(CHANGE_EVENT))
    // Also trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(notifications),
      oldValue: null,
      storageArea: window.localStorage,
    }))
  }
}

export function getNotifications() {
  return readNotifications()
}

export function addNotification({ title, message, type = 'info', link = '' }) {
  if (!title || !message) return null

  const next = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message,
    type,
    link,
    createdAt: new Date().toISOString(),
    read: false,
  }

  const current = readNotifications()
  const updated = [next, ...current].slice(0, MAX_ITEMS)
  writeNotifications(updated)
  return next
}

export function markNotificationRead(id) {
  if (!id) return
  const current = readNotifications()
  const updated = current.map(notification => (
    notification.id === id ? { ...notification, read: true } : notification
  ))
  writeNotifications(updated)
}

export function markAllNotificationsRead() {
  const current = readNotifications()
  const updated = current.map(notification => ({ ...notification, read: true }))
  writeNotifications(updated)
}

export function clearNotifications() {
  writeNotifications([])
}

export function getMotivationalQuote() {
  return getRandomQuote()
}

export const notificationChangeEvent = CHANGE_EVENT
