import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

dotenv.config({ path: 'server/.env' })
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Set it in server/.env or .env before running seed.')
  process.exit(1)
}

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['admin', 'trainer', 'member'], default: 'member' },
}, { timestamps: true })

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  plan: String,
  status: String,
  joined: String,
  expiry: String,
}, { timestamps: true })

const sessionSchema = new mongoose.Schema({
  trainer: String,
  member: String,
  date: String,
  time: String,
  duration: Number,
  type: String,
  status: String,
  invoice: String,
}, { timestamps: true })

const paymentSchema = new mongoose.Schema({
  member: String,
  plan: String,
  amount: Number,
  date: String,
  method: String,
  status: String,
}, { timestamps: true })

const workoutPlanSchema = new mongoose.Schema({
  name: String,
  trainer: String,
  goal: String,
  level: String,
  weeks: Number,
  sessions: Number,
  assignedTo: [String],
  exercises: [{ name: String, sets: Number, reps: String, rest: String }],
}, { timestamps: true })

const subscriptionSchema = new mongoose.Schema({
  member: String,
  plan: String,
  start: String,
  end: String,
  status: String,
  autoRenew: Boolean,
}, { timestamps: true })

const attendanceSchema = new mongoose.Schema({
  member: String,
  date: String,
  checkIn: String,
  checkOut: String,
  duration: Number,
}, { timestamps: true })

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  submittedAt: String,
}, { timestamps: true })

const User = mongoose.model('User', userSchema)
const Member = mongoose.model('Member', memberSchema)
const Session = mongoose.model('Session', sessionSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema)
const Subscription = mongoose.model('Subscription', subscriptionSchema)
const Attendance = mongoose.model('Attendance', attendanceSchema)
const Message = mongoose.model('Message', messageSchema)

async function run() {
  await mongoose.connect(MONGODB_URI)

  await Promise.all([
    User.deleteMany({}),
    Member.deleteMany({}),
    Session.deleteMany({}),
    Payment.deleteMany({}),
    WorkoutPlan.deleteMany({}),
    Subscription.deleteMany({}),
    Attendance.deleteMany({}),
    Message.deleteMany({}),
  ])

  const users = [
    { name: 'Admin User', email: 'admin@ironcore.com', passwordHash: await bcrypt.hash('admin123', 10), role: 'admin' },
    { name: 'John Trainer', email: 'trainer@ironcore.com', passwordHash: await bcrypt.hash('train123', 10), role: 'trainer' },
    { name: 'Sara Member', email: 'member@ironcore.com', passwordHash: await bcrypt.hash('member123', 10), role: 'member' },
  ]

  const members = [
    { name: 'Sara Al Mansoori', email: 'sara@email.com', phone: '+971 50 111 2222', plan: 'Pro', status: 'active', joined: '2024-01-15', expiry: '2025-03-31' },
    { name: 'Ahmed Khalil', email: 'ahmed@email.com', phone: '+971 55 333 4444', plan: 'Elite', status: 'active', joined: '2023-11-02', expiry: '2025-11-02' },
    { name: 'Maria Santos', email: 'maria@email.com', phone: '+971 52 555 6666', plan: 'Basic', status: 'active', joined: '2024-06-10', expiry: '2025-06-10' },
    { name: 'Omar Al Rashidi', email: 'omar@email.com', phone: '+971 56 777 8888', plan: 'Pro', status: 'active', joined: '2024-03-22', expiry: '2025-03-22' },
  ]

  const sessions = [
    { trainer: 'James Okafor', member: 'Ahmed Khalil', date: '2025-03-27', time: '09:00', duration: 60, type: 'Strength', status: 'confirmed', invoice: 'INV-001' },
    { trainer: 'Lisa Chen', member: 'Sara Al Mansoori', date: '2025-03-27', time: '10:30', duration: 45, type: 'Yoga', status: 'confirmed', invoice: 'INV-002' },
  ]

  const payments = [
    { member: 'Ahmed Khalil', plan: 'Elite', amount: 499, date: '2025-03-01', method: 'Card', status: 'paid' },
    { member: 'Sara Al Mansoori', plan: 'Pro', amount: 299, date: '2025-03-01', method: 'Card', status: 'paid' },
    { member: 'Maria Santos', plan: 'Basic', amount: 149, date: '2025-03-05', method: 'Cash', status: 'paid' },
  ]

  const workouts = [
    {
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
    {
      name: 'HIIT Fat Burn',
      trainer: 'Mark Torres',
      goal: 'Weight Loss',
      level: 'Intermediate',
      weeks: 6,
      sessions: 4,
      assignedTo: ['Sara Al Mansoori'],
      exercises: [
        { name: 'Burpees', sets: 4, reps: '15', rest: '30s' },
        { name: 'Jump Squats', sets: 4, reps: '20', rest: '30s' },
      ],
    },
  ]

  const subscriptions = [
    { member: 'Sara Al Mansoori', plan: 'Pro', start: '2025-01-01', end: '2025-03-31', status: 'active', autoRenew: true },
    { member: 'Ahmed Khalil', plan: 'Elite', start: '2024-11-02', end: '2025-11-02', status: 'active', autoRenew: true },
    { member: 'Maria Santos', plan: 'Basic', start: '2025-01-10', end: '2025-06-10', status: 'active', autoRenew: false },
  ]

  const today = new Date().toISOString().split('T')[0]
  const attendance = [
    { member: 'Sara Al Mansoori', date: today, checkIn: '07:12', checkOut: '08:45', duration: 93 },
    { member: 'Ahmed Khalil', date: today, checkIn: '08:00', checkOut: null, duration: null },
  ]

  await Promise.all([
    User.insertMany(users),
    Member.insertMany(members),
    Session.insertMany(sessions),
    Payment.insertMany(payments),
    WorkoutPlan.insertMany(workouts),
    Subscription.insertMany(subscriptions),
    Attendance.insertMany(attendance),
  ])

  console.log('Seed complete: users, members, sessions, payments, workouts, subscriptions, attendance')
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error('Seed failed:', error.message)
  await mongoose.disconnect()
  process.exit(1)
})
