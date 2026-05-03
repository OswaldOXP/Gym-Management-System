import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getStoredToken } from '../lib/api'
import { addNotification, getMotivationalQuote } from '../lib/notifications'

const GymDataContext = createContext(null)

const STORAGE_KEYS = {
  members: 'gym_members',
  sessions: 'gym_sessions',
  attendance: 'gym_attendance',
  payments: 'gym_payments',
  workoutPlans: 'gym_workout_plans',
  subscriptions: 'gym_subscriptions',
  pendingBooking: 'gym_pending_booking',
  pendingPlanPurchase: 'gym_pending_plan_purchase',
  contactMessages: 'gym_contact_messages',
}

const TRAINERS = [
  { id: 1, name: 'James Okafor', specialty: 'Strength & Conditioning', rating: 4.9, sessions: 142, avatar: 'J', available: true },
  { id: 2, name: 'Lisa Chen', specialty: 'Yoga & Pilates', rating: 4.8, sessions: 118, avatar: 'L', available: true },
  { id: 3, name: 'Mark Torres', specialty: 'HIIT & Cardio', rating: 4.7, sessions: 97, avatar: 'M', available: false },
  { id: 4, name: 'Aisha Al Zaabi', specialty: 'Nutrition & Wellness', rating: 4.9, sessions: 85, avatar: 'A', available: true },
]

const INITIAL_MEMBERS = [
  { id: 1, name: 'Sara Al Mansoori', email: 'sara@email.com', phone: '+971 50 111 2222', plan: 'Pro', status: 'active', joined: '2024-01-15', expiry: '2025-03-31' },
  { id: 2, name: 'Ahmed Khalil', email: 'ahmed@email.com', phone: '+971 55 333 4444', plan: 'Elite', status: 'active', joined: '2023-11-02', expiry: '2025-11-02' },
  { id: 3, name: 'Maria Santos', email: 'maria@email.com', phone: '+971 52 555 6666', plan: 'Basic', status: 'active', joined: '2024-06-10', expiry: '2025-06-10' },
  { id: 4, name: 'Omar Al Rashidi', email: 'omar@email.com', phone: '+971 56 777 8888', plan: 'Pro', status: 'active', joined: '2024-03-22', expiry: '2025-03-22' },
]

const INITIAL_SESSIONS = [
  { id: 1, trainer: 'James Okafor', member: 'Ahmed Khalil', date: '2025-03-27', time: '09:00', duration: 60, type: 'Strength', status: 'confirmed' },
  { id: 2, trainer: 'Lisa Chen', member: 'Sara Al Mansoori', date: '2025-03-27', time: '10:30', duration: 45, type: 'Yoga', status: 'confirmed' },
]

const INITIAL_ATTENDANCE = [
  { id: 1, member: 'Sara Al Mansoori', date: new Date().toISOString().split('T')[0], checkIn: '07:12', checkOut: '08:45', duration: 93 },
  { id: 2, member: 'Ahmed Khalil', date: new Date().toISOString().split('T')[0], checkIn: '08:00', checkOut: null, duration: null },
]

const INITIAL_PAYMENTS = [
  { id: 'INV-001', member: 'Ahmed Khalil', plan: 'Elite', amount: 499, date: '2025-03-01', method: 'Card', status: 'paid' },
  { id: 'INV-002', member: 'Sara Al Mansoori', plan: 'Pro', amount: 299, date: '2025-03-01', method: 'Card', status: 'paid' },
]

const INITIAL_WORKOUT_PLANS = [
  {
    id: 1,
    name: 'Beginner Strength',
    trainer: 'James Okafor',
    goal: 'Build Strength',
    level: 'Beginner',
    weeks: 8,
    sessions: 3,
    assignedTo: ['Maria Santos'],
    exercises: [
      { name: 'Barbell Squat', sets: 3, reps: '8-10', rest: '90s' },
      { name: 'Bench Press', sets: 3, reps: '8-10', rest: '90s' },
    ],
  },
]

const INITIAL_SUBSCRIPTIONS = [
  { id: 1, member: 'Sara Al Mansoori', plan: 'Pro', start: '2025-01-01', end: '2025-03-31', status: 'active', autoRenew: true },
  { id: 2, member: 'Ahmed Khalil', plan: 'Elite', start: '2024-11-02', end: '2025-11-02', status: 'active', autoRenew: true },
]

function readState(key, fallback) {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function normalizeRecord(record) {
  if (!record) return record
  const copy = { ...record }
  if (copy._id && !copy.id) copy.id = copy._id
  return copy
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readState(key, fallback))

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}

function nextInvoiceId(payments) {
  const max = payments.reduce((highest, payment) => {
    const number = Number(String(payment.id).replace(/^INV-/, ''))
    return Number.isFinite(number) && number > highest ? number : highest
  }, 0)
  return `INV-${String(max + 1).padStart(3, '0')}`
}

function resolvePaymentMethod(paymentMethod, walletProvider) {
  if (paymentMethod === 'digital') {
    if (walletProvider === 'apple-pay') return 'Apple Pay'
    if (walletProvider === 'google-pay') return 'Google Pay'
    if (walletProvider === 'samsung-pay') return 'Samsung Pay'
    if (walletProvider === 'tabby') return 'Tabby'
    return 'Digital Wallet'
  }

  return 'Card'
}

export function GymDataProvider({ children }) {
  const [apiOnline, setApiOnline] = useState(false)
  const [syncVersion, setSyncVersion] = useState(0)
  const [members, setMembers] = useStoredState(STORAGE_KEYS.members, INITIAL_MEMBERS)
  const [sessions, setSessions] = useStoredState(STORAGE_KEYS.sessions, INITIAL_SESSIONS)
  const [attendance, setAttendance] = useStoredState(STORAGE_KEYS.attendance, INITIAL_ATTENDANCE)
  const [payments, setPayments] = useStoredState(STORAGE_KEYS.payments, INITIAL_PAYMENTS)
  const [workoutPlans, setWorkoutPlans] = useStoredState(STORAGE_KEYS.workoutPlans, INITIAL_WORKOUT_PLANS)
  const [subscriptions, setSubscriptions] = useStoredState(STORAGE_KEYS.subscriptions, INITIAL_SUBSCRIPTIONS)
  const [pendingBooking, setPendingBooking] = useStoredState(STORAGE_KEYS.pendingBooking, null)
  const [pendingPlanPurchase, setPendingPlanPurchase] = useStoredState(STORAGE_KEYS.pendingPlanPurchase, null)
  const [contactMessages, setContactMessages] = useStoredState(STORAGE_KEYS.contactMessages, [])

  const refreshFromApi = async () => {
    const token = getStoredToken()
    try {
      const health = await api.health()
      const healthy = Boolean(health?.ok)
      setApiOnline(healthy)
      if (!healthy || !token) return

      const [
        membersData,
        sessionsData,
        attendanceData,
        paymentsData,
        workoutsData,
        subscriptionsData,
      ] = await Promise.all([
        api.list('members'),
        api.list('sessions'),
        api.list('attendance'),
        api.list('payments'),
        api.list('workouts'),
        api.list('subscriptions'),
      ])

      if (Array.isArray(membersData) && membersData.length) setMembers(membersData.map(normalizeRecord))
      if (Array.isArray(sessionsData) && sessionsData.length) setSessions(sessionsData.map(normalizeRecord))
      if (Array.isArray(attendanceData) && attendanceData.length) setAttendance(attendanceData.map(normalizeRecord))
      if (Array.isArray(paymentsData) && paymentsData.length) setPayments(paymentsData.map(normalizeRecord))
      if (Array.isArray(workoutsData) && workoutsData.length) setWorkoutPlans(workoutsData.map(normalizeRecord))
      if (Array.isArray(subscriptionsData) && subscriptionsData.length) setSubscriptions(subscriptionsData.map(normalizeRecord))
    } catch {
      setApiOnline(false)
    }
  }

  useEffect(() => {
    refreshFromApi()
  }, [syncVersion])

  useEffect(() => {
    const handleAuthChanged = () => setSyncVersion(v => v + 1)
    window.addEventListener('auth-changed', handleAuthChanged)
    return () => window.removeEventListener('auth-changed', handleAuthChanged)
  }, [])

  const addMember = async member => {
    if (apiOnline && getStoredToken()) {
      try {
        const created = normalizeRecord(await api.create('members', member))
        setMembers(current => [created, ...current])
        return created
      } catch {}
    }
    const created = { ...member, id: Date.now() }
    setMembers(current => [...current, created])
    return created
  }

  const updateMember = async (id, updates) => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.update('members', id, updates)
      } catch {}
    }
    setMembers(current => current.map(member => (String(member.id) === String(id) ? { ...member, ...updates } : member)))
  }

  const deleteMember = async id => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.remove('members', id)
      } catch {}
    }
    setMembers(current => current.filter(member => String(member.id) !== String(id)))
  }

  const addSession = async session => {
    if (apiOnline && getStoredToken()) {
      try {
        const created = normalizeRecord(await api.create('sessions', session))
        setSessions(current => [created, ...current])
        return created
      } catch {}
    }
    const created = { ...session, id: Date.now() }
    setSessions(current => [...current, created])
    return created
  }

  const updateSession = async (id, updates) => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.update('sessions', id, updates)
      } catch {}
    }
    setSessions(current => current.map(session => (String(session.id) === String(id) ? { ...session, ...updates } : session)))
  }

  const deleteSession = async id => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.remove('sessions', id)
      } catch {}
    }
    setSessions(current => current.filter(session => String(session.id) !== String(id)))
  }

  const checkInMember = async memberName => {
    const today = new Date().toISOString().split('T')[0]
    const now = new Date().toTimeString().slice(0, 5)
    const alreadyCheckedIn = attendance.some(record => record.member === memberName && record.date === today && !record.checkOut)
    if (alreadyCheckedIn) return { success: false, error: 'Member is already checked in today.' }

    const payload = { member: memberName, date: today, checkIn: now, checkOut: null, duration: null }

    if (apiOnline && getStoredToken()) {
      try {
        const created = normalizeRecord(await api.create('attendance', payload))
        setAttendance(current => [created, ...current])
        addNotification({
          title: 'Member Checked In',
          message: `${memberName} checked in at ${now}. ${getMotivationalQuote()}`,
          type: 'success',
          link: '/attendance',
        })
        return { success: true, time: now }
      } catch {}
    }

    setAttendance(current => [...current, { ...payload, id: Date.now() }])
    addNotification({
      title: 'Member Checked In',
      message: `${memberName} checked in at ${now}. ${getMotivationalQuote()}`,
      type: 'success',
      link: '/attendance',
    })
    return { success: true, time: now }
  }

  const checkOutMember = async id => {
    const now = new Date().toTimeString().slice(0, 5)
    const target = attendance.find(record => String(record.id) === String(id))
    if (!target || target.checkOut) return now

    const [checkInHour, checkInMinute] = target.checkIn.split(':').map(Number)
    const [checkOutHour, checkOutMinute] = now.split(':').map(Number)
    const duration = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute)
    const updates = { checkOut: now, duration }

    if (apiOnline && getStoredToken()) {
      try {
        await api.update('attendance', id, updates)
      } catch {}
    }

    setAttendance(current => current.map(record => (String(record.id) === String(id) ? { ...record, ...updates } : record)))
    addNotification({
      title: 'Member Checked Out',
      message: `${target.member} checked out at ${now}.`,
      type: 'info',
      link: '/attendance',
    })
    return now
  }

  const addPayment = async payment => {
    const payload = { ...payment, id: payment.id || nextInvoiceId(payments), amount: Number(payment.amount) }

    if (apiOnline && getStoredToken()) {
      try {
        const created = normalizeRecord(await api.create('payments', payload))
        setPayments(current => [created, ...current])
        return created
      } catch {}
    }

    setPayments(current => [...current, payload])
    return payload
  }

  const markPaymentPaid = async id => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.update('payments', id, { status: 'paid' })
      } catch {}
    }
    setPayments(current => current.map(payment => (String(payment.id) === String(id) ? { ...payment, status: 'paid' } : payment)))
    addNotification({
      title: 'Payment Received',
      message: `Invoice ${id} marked as paid.`,
      type: 'success',
      link: '/payments',
    })
  }

  const refundPayment = async id => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.update('payments', id, { status: 'refunded' })
      } catch {}
    }
    setPayments(current => current.map(payment => (String(payment.id) === String(id) ? { ...payment, status: 'refunded' } : payment)))
    addNotification({
      title: 'Payment Refunded',
      message: `Invoice ${id} has been refunded.`,
      type: 'warning',
      link: '/payments',
    })
  }

  const addWorkoutPlan = async plan => {
    const payload = { ...plan, assignedTo: plan.assignedTo || [], exercises: plan.exercises || [] }

    if (apiOnline && getStoredToken()) {
      try {
        const created = normalizeRecord(await api.create('workouts', payload))
        setWorkoutPlans(current => [created, ...current])
        return created
      } catch {}
    }

    const created = { ...payload, id: Date.now() }
    setWorkoutPlans(current => [...current, created])
    return created
  }

  const deleteWorkoutPlan = async id => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.remove('workouts', id)
      } catch {}
    }
    setWorkoutPlans(current => current.filter(plan => String(plan.id) !== String(id)))
  }

  const toggleSubscriptionRenewal = async id => {
    const target = subscriptions.find(subscription => String(subscription.id) === String(id))
    if (!target) return
    const updates = { autoRenew: !target.autoRenew }

    if (apiOnline && getStoredToken()) {
      try {
        await api.update('subscriptions', id, updates)
      } catch {}
    }

    setSubscriptions(current => current.map(subscription => (String(subscription.id) === String(id) ? { ...subscription, ...updates } : subscription)))
  }

  const renewSubscription = async id => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.update('subscriptions', id, { status: 'active' })
      } catch {}
    }
    setSubscriptions(current => current.map(subscription => (String(subscription.id) === String(id) ? { ...subscription, status: 'active' } : subscription)))
    addNotification({
      title: 'Subscription Renewed',
      message: `Subscription #${id} is now active.`,
      type: 'success',
      link: '/plans',
    })
  }

  const cancelSubscription = async id => {
    if (apiOnline && getStoredToken()) {
      try {
        await api.update('subscriptions', id, { status: 'expired' })
      } catch {}
    }
    setSubscriptions(current => current.map(subscription => (String(subscription.id) === String(id) ? { ...subscription, status: 'expired' } : subscription)))
    addNotification({
      title: 'Subscription Cancelled',
      message: `Subscription #${id} was cancelled.`,
      type: 'warning',
      link: '/plans',
    })
  }

  const upsertSubscription = async payload => {
    const existing = subscriptions.find(subscription => subscription.member === payload.member)

    if (existing) {
      if (apiOnline && getStoredToken()) {
        try {
          await api.update('subscriptions', existing.id, payload)
        } catch {}
      }
      setSubscriptions(current => current.map(subscription => (
        String(subscription.id) === String(existing.id)
          ? { ...subscription, ...payload }
          : subscription
      )))
      return { ...existing, ...payload }
    }

    if (apiOnline && getStoredToken()) {
      try {
        const created = normalizeRecord(await api.create('subscriptions', payload))
        setSubscriptions(current => [created, ...current])
        return created
      } catch {}
    }

    const created = { ...payload, id: Date.now() }
    setSubscriptions(current => [created, ...current])
    return created
  }

  const saveContactMessage = async message => {
    const payload = { ...message, id: Date.now(), submittedAt: new Date().toISOString() }
    setContactMessages(current => [...current, payload])
    addNotification({
      title: 'New Contact Message',
      message: `Message received from ${message.name || 'visitor'}.`,
      type: 'info',
      link: '/contact',
    })

    if (apiOnline) {
      try {
        await api.postPublicMessage(payload)
      } catch {}
    }

    return payload
  }

  const confirmBooking = async ({ memberName, paymentMethod = 'Card', walletProvider } = {}) => {
    if (!pendingBooking) return { success: false, error: 'No booking to confirm.' }

    const member = memberName || 'Walk-in Member'
    const sessionDate = new Date().toISOString().split('T')[0]
    const resolvedMethod = resolvePaymentMethod(paymentMethod, walletProvider)

    const invoice = await addPayment({
      member,
      plan: pendingBooking.sessionType === 'package' ? 'Trainer Package' : 'Trainer Session',
      amount: pendingBooking.totalPrice,
      date: sessionDate,
      method: resolvedMethod,
      walletProvider: paymentMethod === 'digital' ? walletProvider : null,
      status: 'paid',
    })

    await addSession({
      trainer: pendingBooking.trainer.name,
      member,
      date: sessionDate,
      time: pendingBooking.timeSlot,
      duration: pendingBooking.sessionType === 'package' ? 60 : 45,
      type: pendingBooking.trainer.specialty,
      status: 'confirmed',
      invoice: invoice.id,
    })

    addNotification({
      title: 'Session Booked',
      message: `${member} booked ${pendingBooking.trainer.name} at ${pendingBooking.timeSlot}. ${getMotivationalQuote()}`,
      type: 'success',
      link: '/booking',
    })

    setPendingBooking(null)
    return { success: true, invoice }
  }

  const confirmPlanPurchase = async ({ memberName, paymentMethod = 'Card', walletProvider } = {}) => {
    if (!pendingPlanPurchase) return { success: false, error: 'No plan selected for checkout.' }

    const member = memberName || 'Walk-in Member'
    const now = new Date()
    const start = now.toISOString().split('T')[0]
    const endDate = new Date(now)
    endDate.setMonth(endDate.getMonth() + (pendingPlanPurchase.period === 'year' ? 12 : 1))
    const end = endDate.toISOString().split('T')[0]
    const resolvedMethod = resolvePaymentMethod(paymentMethod, walletProvider)

    const invoice = await addPayment({
      member,
      plan: pendingPlanPurchase.name,
      amount: pendingPlanPurchase.price,
      date: start,
      method: resolvedMethod,
      walletProvider: paymentMethod === 'digital' ? walletProvider : null,
      status: 'paid',
    })

    const subscription = await upsertSubscription({
      member,
      plan: pendingPlanPurchase.name,
      start,
      end,
      status: 'active',
      autoRenew: true,
      invoice: invoice.id,
    })

    addNotification({
      title: 'Plan Purchased',
      message: `${member} purchased ${pendingPlanPurchase.name}. ${getMotivationalQuote()}`,
      type: 'success',
      link: '/plans',
    })

    setPendingPlanPurchase(null)
    return { success: true, invoice, subscription }
  }

  const value = useMemo(() => ({
    apiOnline,
    refreshFromApi,
    trainers: TRAINERS,
    members,
    setMembers,
    addMember,
    updateMember,
    deleteMember,
    sessions,
    setSessions,
    addSession,
    updateSession,
    deleteSession,
    attendance,
    setAttendance,
    checkInMember,
    checkOutMember,
    payments,
    setPayments,
    addPayment,
    markPaymentPaid,
    refundPayment,
    workoutPlans,
    setWorkoutPlans,
    addWorkoutPlan,
    deleteWorkoutPlan,
    subscriptions,
    setSubscriptions,
    toggleSubscriptionRenewal,
    renewSubscription,
    cancelSubscription,
    upsertSubscription,
    pendingBooking,
    setPendingBooking,
    confirmBooking,
    pendingPlanPurchase,
    setPendingPlanPurchase,
    confirmPlanPurchase,
    contactMessages,
    saveContactMessage,
  }), [
    apiOnline,
    refreshFromApi,
    members,
    sessions,
    attendance,
    payments,
    workoutPlans,
    subscriptions,
    pendingBooking,
    pendingPlanPurchase,
    contactMessages,
  ])

  return <GymDataContext.Provider value={value}>{children}</GymDataContext.Provider>
}

export function useGymData() {
  const context = useContext(GymDataContext)
  if (!context) throw new Error('useGymData must be used inside GymDataProvider')
  return context
}
