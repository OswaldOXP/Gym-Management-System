import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

dotenv.config({ path: 'server/.env' })
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ironcore'
const MONGODB_DB = process.env.MONGODB_DB || 'mern'

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['admin', 'trainer', 'member'], default: 'member' },
}, { timestamps: true })

const loginInfoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String,
  email: { type: String, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'trainer', 'member'], default: 'member' },
}, { timestamps: true, collection: 'Login_info' })

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  plan: String,
  status: String,
  joined: String,
  expiry: String,
}, { timestamps: true })

const trainerSchema = new mongoose.Schema({
  userId: String,
  name: String,
  specialty: String,
  bio: String,
  rating: Number,
  sessions: Number,
  price: Number,
  availability: [String],
  active: Boolean,
  avatar: String,
}, { timestamps: true })

const membershipPlanSchema = new mongoose.Schema({
  name: String,
  price: Number,
  period: String,
  features: [String],
  members: Number,
  active: Boolean,
  popular: Boolean,
}, { timestamps: true })

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
  color: String,
  active: Boolean,
}, { timestamps: true })

const bookingSchema = new mongoose.Schema({
  memberId: String,
  trainerId: String,
  member: String,
  trainer: String,
  date: String,
  time: String,
  duration: Number,
  type: String,
  status: String,
  invoice: String,
  createdBy: String,
  notes: String,
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
const LoginInfo = mongoose.model('LoginInfo', loginInfoSchema, 'Login_info')
const Member = mongoose.model('Member', memberSchema)
const Session = mongoose.model('Session', sessionSchema)
const Payment = mongoose.model('Payment', paymentSchema)
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema)
const Subscription = mongoose.model('Subscription', subscriptionSchema)
const Attendance = mongoose.model('Attendance', attendanceSchema)
const Message = mongoose.model('Message', messageSchema)
const Trainer = mongoose.model('Trainer', trainerSchema)
const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema)
const Category = mongoose.model('Category', categorySchema)
const Booking = mongoose.model('Booking', bookingSchema)

async function run() {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB })

  await Promise.all([
    User.deleteMany({}),
    LoginInfo.deleteMany({}),
    Member.deleteMany({}),
    Trainer.deleteMany({}),
    MembershipPlan.deleteMany({}),
    Category.deleteMany({}),
    Booking.deleteMany({}),
    Session.deleteMany({}),
    Payment.deleteMany({}),
    WorkoutPlan.deleteMany({}),
    Subscription.deleteMany({}),
    Attendance.deleteMany({}),
    Message.deleteMany({}),
  ])

  const users = [
    { name: 'Admin User', email: 'admin@ironcore.com', role: 'admin' },
    { name: 'John Trainer', email: 'trainer@ironcore.com', role: 'trainer' },
    { name: 'Sara Member', email: 'member@ironcore.com', role: 'member' },
  ]

  const loginInfos = [
    { userId: '1', name: 'Admin User', email: 'admin@ironcore.com', passwordHash: await bcrypt.hash('admin123', 10), role: 'admin' },
    { userId: '2', name: 'John Trainer', email: 'trainer@ironcore.com', passwordHash: await bcrypt.hash('train123', 10), role: 'trainer' },
    { userId: '3', name: 'Sara Member', email: 'member@ironcore.com', passwordHash: await bcrypt.hash('member123', 10), role: 'member' },
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

  const bookings = sessions.map((session, index) => ({
    id: index + 1,
    memberId: index === 0 ? '3' : '1',
    trainerId: index === 0 ? '1' : '2',
    member: session.member,
    trainer: session.trainer,
    date: session.date,
    time: session.time,
    duration: session.duration,
    type: session.type,
    status: session.status,
    invoice: session.invoice,
    createdBy: '1',
    notes: '',
  }))

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

  const trainers = [
    { userId: '2', name: 'James Okafor', specialty: 'Strength & Conditioning', bio: 'Focused on progressive overload and injury-aware coaching.', rating: 4.9, sessions: 142, price: 150, availability: ['Mon', 'Tue', 'Thu', 'Fri'], active: true, avatar: 'J' },
    { userId: '', name: 'Lisa Chen', specialty: 'Yoga & Pilates', bio: 'Mobility, posture, and recovery-driven sessions.', rating: 4.8, sessions: 118, price: 130, availability: ['Mon', 'Wed', 'Fri'], active: true, avatar: 'L' },
    { userId: '', name: 'Mark Torres', specialty: 'HIIT & Cardio', bio: 'Fast-paced conditioning and fat-loss programs.', rating: 4.7, sessions: 97, price: 160, availability: ['Tue', 'Thu', 'Sat'], active: false, avatar: 'M' },
    { userId: '', name: 'Aisha Al Zaabi', specialty: 'Nutrition & Wellness', bio: 'Lifestyle, nutrition, and sustainable habit coaching.', rating: 4.9, sessions: 85, price: 140, availability: ['Mon', 'Wed', 'Sat'], active: true, avatar: 'A' },
  ]

  const plans = [
    { name: 'Basic', price: 149, period: 'month', features: ['Full gym access', 'Locker room', 'Basic equipment'], members: 420, active: true, popular: false },
    { name: 'Pro', price: 299, period: 'month', features: ['All Basic features', '2 trainer sessions/month', 'Nutrition guide'], members: 580, active: true, popular: true },
    { name: 'Elite', price: 499, period: 'month', features: ['All Pro features', 'Unlimited trainer sessions', 'Priority booking'], members: 200, active: true, popular: false },
    { name: 'Annual Basic', price: 1490, period: 'year', features: ['All Basic features', '2 months free', 'Annual health check'], members: 85, active: true, popular: false },
  ]

  const categories = [
    { name: 'Strength', description: 'Compound lifting and power development', color: '#7CFF49', active: true },
    { name: 'Cardio', description: 'Endurance and conditioning classes', color: '#3b82f6', active: true },
    { name: 'Mobility', description: 'Flexibility and recovery sessions', color: '#a855f7', active: true },
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

  const messages = [
    {
      name: 'Ali Hassan',
      email: 'ali@email.com',
      subject: 'Membership inquiry',
      message: 'Do you offer family subscription discounts?',
      submittedAt: new Date().toISOString(),
    },
    {
      name: 'Noor Ahmed',
      email: 'noor@email.com',
      subject: 'Trainer availability',
      message: 'Can I book evening sessions on weekdays?',
      submittedAt: new Date().toISOString(),
    },
  ]

  await Promise.all([
    User.insertMany(users),
    LoginInfo.insertMany(loginInfos),
    Member.insertMany(members),
    Trainer.insertMany(trainers),
    MembershipPlan.insertMany(plans),
    Category.insertMany(categories),
    Booking.insertMany(bookings),
    Session.insertMany(sessions),
    Payment.insertMany(payments),
    WorkoutPlan.insertMany(workouts),
    Subscription.insertMany(subscriptions),
    Attendance.insertMany(attendance),
    Message.insertMany(messages),
  ])

  console.log(`Seed complete for database: ${MONGODB_DB}`)
  await mongoose.disconnect()
}

run().catch(async (error) => {
  console.error('Seed failed:', error.message)
  await mongoose.disconnect()
  process.exit(1)
})
