import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: 'server/.env' })
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'ironcore-demo-secret'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ironcore'
const MONGODB_DB = process.env.MONGODB_DB || 'mern'
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const GRAPH_ROOTS = ['src', 'server']
const GRAPH_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])
const sseClients = new Set()

app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  next()
})

function broadcastDataChanged(change = {}) {
  if (!sseClients.size) return
  const payload = JSON.stringify({
    type: 'data-changed',
    timestamp: new Date().toISOString(),
    ...change,
  })

  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`)
  }
}

app.get('/api/events', (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`)
  sseClients.add(res)

  const keepAliveTimer = setInterval(() => {
    res.write(': keepalive\n\n')
  }, 25000)

  res.on('close', () => {
    clearInterval(keepAliveTimer)
    sseClients.delete(res)
  })
})

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'ironcore-api', message: 'Use /api/health or the Postman collection endpoints.' })
})

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'trainer', 'member'], default: 'member' },
}, { timestamps: true })

const loginInfoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: String,
  email: { type: String, required: true, unique: true },
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
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  bio: String,
  rating: { type: Number, default: 5 },
  sessions: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  availability: [String],
  active: { type: Boolean, default: true },
  avatar: String,
}, { timestamps: true })

const membershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  period: { type: String, enum: ['month', 'year'], default: 'month' },
  features: [String],
  members: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  popular: { type: Boolean, default: false },
}, { timestamps: true })

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  color: String,
  active: { type: Boolean, default: true },
}, { timestamps: true })

const bookingSchema = new mongoose.Schema({
  memberId: String,
  trainerId: String,
  member: { type: String, required: true },
  trainer: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 45 },
  type: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
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

const models = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  LoginInfo: mongoose.models.LoginInfo || mongoose.model('LoginInfo', loginInfoSchema, 'Login_info'),
  Member: mongoose.models.Member || mongoose.model('Member', memberSchema),
  Trainer: mongoose.models.Trainer || mongoose.model('Trainer', trainerSchema),
  MembershipPlan: mongoose.models.MembershipPlan || mongoose.model('MembershipPlan', membershipPlanSchema),
  Category: mongoose.models.Category || mongoose.model('Category', categorySchema),
  Booking: mongoose.models.Booking || mongoose.model('Booking', bookingSchema),
  Session: mongoose.models.Session || mongoose.model('Session', sessionSchema),
  Payment: mongoose.models.Payment || mongoose.model('Payment', paymentSchema),
  WorkoutPlan: mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', workoutPlanSchema),
  Subscription: mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema),
  Attendance: mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema),
  Message: mongoose.models.Message || mongoose.model('Message', messageSchema),
}

const memory = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@ironcore.com', role: 'admin' },
    { id: 2, name: 'John Trainer', email: 'trainer@ironcore.com', role: 'trainer' },
    { id: 3, name: 'Sara Member', email: 'member@ironcore.com', role: 'member' },
  ],
  loginInfos: [
    { id: 1, userId: '1', name: 'Admin User', email: 'admin@ironcore.com', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: 2, userId: '2', name: 'John Trainer', email: 'trainer@ironcore.com', passwordHash: bcrypt.hashSync('train123', 10), role: 'trainer' },
    { id: 3, userId: '3', name: 'Sara Member', email: 'member@ironcore.com', passwordHash: bcrypt.hashSync('member123', 10), role: 'member' },
  ],
  members: [
    { id: 1, name: 'Sara Al Mansoori', email: 'sara@email.com', phone: '+971 50 111 2222', plan: 'Pro', status: 'active', joined: '2024-01-15', expiry: '2025-03-31' },
    { id: 2, name: 'Ahmed Khalil', email: 'ahmed@email.com', phone: '+971 55 333 4444', plan: 'Elite', status: 'active', joined: '2023-11-02', expiry: '2025-11-02' },
  ],
  trainers: [
    { id: 1, userId: '2', name: 'James Okafor', specialty: 'Strength & Conditioning', bio: 'Focused on progressive overload and injury-aware coaching.', rating: 4.9, sessions: 142, price: 150, availability: ['Mon', 'Tue', 'Thu', 'Fri'], active: true, avatar: 'J' },
    { id: 2, userId: '', name: 'Lisa Chen', specialty: 'Yoga & Pilates', bio: 'Mobility, posture, and recovery-driven sessions.', rating: 4.8, sessions: 118, price: 130, availability: ['Mon', 'Wed', 'Fri'], active: true, avatar: 'L' },
    { id: 3, userId: '', name: 'Mark Torres', specialty: 'HIIT & Cardio', bio: 'Fast-paced conditioning and fat-loss programs.', rating: 4.7, sessions: 97, price: 160, availability: ['Tue', 'Thu', 'Sat'], active: false, avatar: 'M' },
    { id: 4, userId: '', name: 'Aisha Al Zaabi', specialty: 'Nutrition & Wellness', bio: 'Lifestyle, nutrition, and sustainable habit coaching.', rating: 4.9, sessions: 85, price: 140, availability: ['Mon', 'Wed', 'Sat'], active: true, avatar: 'A' },
  ],
  membershipPlans: [
    { id: 1, name: 'Basic', price: 149, period: 'month', features: ['Full gym access', 'Locker room', 'Basic equipment'], members: 420, active: true, popular: false },
    { id: 2, name: 'Pro', price: 299, period: 'month', features: ['All Basic features', '2 trainer sessions/month', 'Nutrition guide'], members: 580, active: true, popular: true },
    { id: 3, name: 'Elite', price: 499, period: 'month', features: ['All Pro features', 'Unlimited trainer sessions', 'Priority booking'], members: 200, active: true, popular: false },
    { id: 4, name: 'Annual Basic', price: 1490, period: 'year', features: ['All Basic features', '2 months free', 'Annual health check'], members: 85, active: true, popular: false },
  ],
  categories: [
    { id: 1, name: 'Strength', description: 'Compound lifting and power development', color: '#7CFF49', active: true },
    { id: 2, name: 'Cardio', description: 'Endurance and conditioning classes', color: '#3b82f6', active: true },
    { id: 3, name: 'Mobility', description: 'Flexibility and recovery sessions', color: '#a855f7', active: true },
  ],
  bookings: [
    { id: 1, memberId: '3', trainerId: '1', member: 'Ahmed Khalil', trainer: 'James Okafor', date: '2025-03-27', time: '09:00', duration: 60, type: 'Strength', status: 'confirmed', invoice: 'INV-001', createdBy: '1', notes: '' },
    { id: 2, memberId: '1', trainerId: '2', member: 'Sara Al Mansoori', trainer: 'Lisa Chen', date: '2025-03-27', time: '10:30', duration: 45, type: 'Yoga', status: 'confirmed', invoice: 'INV-002', createdBy: '2', notes: '' },
  ],
  sessions: [],
  payments: [],
  workoutPlans: [],
  subscriptions: [],
  attendance: [],
  messages: [],
}

let connectedToMongo = false

function signUser(user) {
  return jwt.sign({ sub: String(user._id || user.id), role: user.role, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing token' })
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function permit(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user.toObject ? user.toObject() : user
  return safe
}

function sanitizeLoginInfo(loginInfo) {
  const { passwordHash, ...safe } = loginInfo.toObject ? loginInfo.toObject() : loginInfo
  return safe
}

function toPlain(document) {
  if (!document) return document
  if (Array.isArray(document)) return document.map(item => toPlain(item))
  if (document.toObject) return document.toObject()
  return { ...document }
}

function sendValidationError(res, message) {
  return res.status(400).json({ error: message })
}

function requireFields(fields, payload) {
  const missing = fields.filter(field => {
    const value = payload?.[field]
    return value === undefined || value === null || value === ''
  })
  return missing
}

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateBookingPayload(payload) {
  const missing = requireFields(['member', 'trainer', 'date', 'time', 'type'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  return null
}

function validatePlanPayload(payload) {
  const missing = requireFields(['name', 'price', 'period'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  if (!['month', 'year'].includes(payload.period)) return 'Period must be either month or year'
  if (Number.isNaN(Number(payload.price))) return 'Price must be a number'
  return null
}

function validateTrainerPayload(payload) {
  const missing = requireFields(['name', 'specialty'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  if (payload.price !== undefined && Number.isNaN(Number(payload.price))) return 'Price must be a number'
  return null
}

function validateCategoryPayload(payload) {
  const missing = requireFields(['name'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  return null
}

function validateMemberPayload(payload) {
  const missing = requireFields(['name', 'email'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  if (!validateEmail(payload.email)) return 'Email is invalid'
  return null
}

function validatePaymentPayload(payload) {
  const missing = requireFields(['member', 'plan', 'amount'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  if (Number.isNaN(Number(payload.amount))) return 'Amount must be a number'
  return null
}

function validateWorkoutPayload(payload) {
  const missing = requireFields(['name', 'trainer', 'goal', 'level'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  return null
}

function validateSubscriptionPayload(payload) {
  const missing = requireFields(['member', 'plan', 'start', 'end'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  return null
}

function validateAttendancePayload(payload) {
  const missing = requireFields(['member', 'date', 'checkIn'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  return null
}

function validateMessagePayload(payload) {
  const missing = requireFields(['name', 'email', 'message'], payload)
  if (missing.length) return `Missing required fields: ${missing.join(', ')}`
  if (!validateEmail(payload.email)) return 'Email is invalid'
  return null
}

function validateMaybe(res, validator, payload) {
  if (!validator) return null
  const message = validator(payload)
  if (message) {
    sendValidationError(res, message)
    return message
  }
  return null
}

function normalizeProjectPath(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join('/')
}

function getFileGroup(relativePath) {
  if (relativePath.startsWith('src/components/')) return 'components'
  if (relativePath.startsWith('src/pages/')) return 'pages'
  if (relativePath.startsWith('src/context/')) return 'context'
  if (relativePath.startsWith('src/lib/')) return 'shared'
  if (relativePath.startsWith('src/styles/')) return 'styles'
  if (relativePath.startsWith('server/')) return 'backend'
  return 'other'
}

async function walkSourceFiles(rootDirectory) {
  const entries = await fs.readdir(rootDirectory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example') continue
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) continue
      files.push(...await walkSourceFiles(path.join(rootDirectory, entry.name)))
      continue
    }

    if (GRAPH_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(path.join(rootDirectory, entry.name))
    }
  }

  return files
}

function extractImportSpecifiers(source) {
  const specifiers = []
  const patterns = [
    /import\s+(?:[\w*\s{},]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g,
    /export\s+[^;]*?\s+from\s+['"]([^'"]+)['"]/g,
  ]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]) specifiers.push(match[1])
    }
  }

  return specifiers
}

async function resolveImportFile(sourceFile, specifier) {
  if (!specifier.startsWith('.')) return null

  const basePath = path.resolve(path.dirname(sourceFile), specifier)
  const candidates = [
    basePath,
    ...Array.from(GRAPH_EXTENSIONS, extension => `${basePath}${extension}`),
    ...Array.from(GRAPH_EXTENSIONS, extension => path.join(basePath, `index${extension}`)),
  ]

  for (const candidate of candidates) {
    try {
      const stats = await fs.stat(candidate)
      if (stats.isFile()) return candidate
    } catch {
      continue
    }
  }

  return null
}

async function buildCodeReviewGraph() {
  const rootFiles = []

  for (const root of GRAPH_ROOTS) {
    const absoluteRoot = path.join(projectRoot, root)
    try {
      const stats = await fs.stat(absoluteRoot)
      if (stats.isDirectory()) {
        rootFiles.push(...await walkSourceFiles(absoluteRoot))
      }
    } catch {
      continue
    }
  }

  const sourceFiles = rootFiles.sort((left, right) => normalizeProjectPath(left).localeCompare(normalizeProjectPath(right)))
  const fileMap = new Map(sourceFiles.map(filePath => [filePath, normalizeProjectPath(filePath)]))
  const nodes = []
  const edges = []

  for (const filePath of sourceFiles) {
    const relativePath = fileMap.get(filePath)
    const fileContent = await fs.readFile(filePath, 'utf8')
    const imports = []

    for (const specifier of extractImportSpecifiers(fileContent)) {
      const resolved = await resolveImportFile(filePath, specifier)
      if (!resolved) continue
      imports.push(normalizeProjectPath(resolved))
      edges.push({ source: relativePath, target: normalizeProjectPath(resolved) })
    }

    nodes.push({
      id: relativePath,
      label: path.basename(relativePath),
      path: relativePath,
      group: getFileGroup(relativePath),
      imports: imports.length,
      exported: fileContent.includes('export '),
    })
  }

  const incoming = new Map(nodes.map(node => [node.id, 0]))
  const outgoing = new Map(nodes.map(node => [node.id, 0]))

  for (const edge of edges) {
    outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + 1)
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1)
  }

  const enrichedNodes = nodes.map(node => ({
    ...node,
    incoming: incoming.get(node.id) || 0,
    outgoing: outgoing.get(node.id) || 0,
    degree: (incoming.get(node.id) || 0) + (outgoing.get(node.id) || 0),
  }))

  const summary = {
    totalFiles: enrichedNodes.length,
    totalEdges: edges.length,
    frontendFiles: enrichedNodes.filter(node => node.path.startsWith('src/')).length,
    backendFiles: enrichedNodes.filter(node => node.path.startsWith('server/')).length,
    sharedFiles: enrichedNodes.filter(node => node.group === 'shared').length,
    updatedAt: new Date().toISOString(),
  }

  return {
    nodes: enrichedNodes,
    edges,
    summary,
    hotspots: [...enrichedNodes].sort((left, right) => right.degree - left.degree).slice(0, 6),
  }
}

async function findUserByEmail(email) {
  if (connectedToMongo) return models.User.findOne({ email })
  return memory.users.find(user => user.email === email) || null
}

async function findLoginInfoByEmail(email) {
  if (connectedToMongo) return models.LoginInfo.findOne({ email })
  return memory.loginInfos.find(loginInfo => loginInfo.email === email) || null
}

async function migrateLoginInfoCollection() {
  if (!connectedToMongo) return

  const users = await models.User.find()
  for (const user of users) {
    if (!user.email) continue
    const existing = await models.LoginInfo.findOne({ email: user.email })
    if (!existing && user.passwordHash) {
      await models.LoginInfo.create({
        userId: String(user._id),
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
      })
    }
  }

  await models.User.updateMany({}, { $unset: { passwordHash: '' } })
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, backend: 'ironcore-api', mongo: connectedToMongo })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const user = await findUserByEmail(email)
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const loginInfo = await findLoginInfoByEmail(email)
  const passwordHash = loginInfo?.passwordHash || user.passwordHash || user.password
  if (!passwordHash) return res.status(401).json({ error: 'Invalid email or password' })

  const valid = await bcrypt.compare(password, passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

  const safeUser = sanitizeUser(user)
  const token = signUser(safeUser)
  res.json({ user: safeUser, token })
})

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })

  const existing = await findUserByEmail(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const now = new Date()
  const joined = now.toISOString().split('T')[0]
  const expiryDate = new Date(now)
  expiryDate.setMonth(expiryDate.getMonth() + 1)
  const expiry = expiryDate.toISOString().split('T')[0]
  let user
  if (connectedToMongo) {
    user = await models.User.create({ name, email, role: 'member' })
    await models.LoginInfo.create({
      userId: String(user._id),
      name,
      email,
      passwordHash,
      role: 'member',
    })
    await models.Member.create({
      name,
      email,
      phone: '',
      plan: 'Basic',
      status: 'pending',
      joined,
      expiry,
    })
    broadcastDataChanged({ resource: 'users', action: 'create' })
    broadcastDataChanged({ resource: 'members', action: 'create' })
  } else {
    const userId = Date.now()
    user = { id: userId, name, email, role: 'member' }
    memory.users.push(user)
    memory.loginInfos.unshift({ id: userId, userId: String(userId), name, email, passwordHash, role: 'member' })
    memory.members.unshift({
      id: Date.now() + 1,
      name,
      email,
      phone: '',
      plan: 'Basic',
      status: 'pending',
      joined,
      expiry,
    })
    broadcastDataChanged({ resource: 'users', action: 'create' })
    broadcastDataChanged({ resource: 'members', action: 'create' })
  }

  const safeUser = sanitizeUser(user)
  const token = signUser(safeUser)
  res.status(201).json({ user: safeUser, token })
})

app.get('/api/me', authRequired, async (req, res) => {
  res.json({ user: req.user })
})

function crudRoutes(basePath, modelName, memoryKey, options = {}) {
  const createRoles = options.createRoles || ['admin', 'trainer']
  const updateRoles = options.updateRoles || ['admin', 'trainer']
  const deleteRoles = options.deleteRoles || ['admin']
  const validateCreate = options.validateCreate
  const validateUpdate = options.validateUpdate || validateCreate

  app.get(basePath, authRequired, async (_req, res) => {
    if (connectedToMongo) return res.json(toPlain(await models[modelName].find().sort({ createdAt: -1 })))
    return res.json(toPlain(memory[memoryKey]))
  })

  app.post(basePath, authRequired, permit(...createRoles), async (req, res) => {
    if (validateMaybe(res, validateCreate, req.body)) return
    if (connectedToMongo) {
      const created = await models[modelName].create(req.body)
      broadcastDataChanged({ resource: memoryKey, action: 'create' })
      return res.status(201).json(toPlain(created))
    }
    const created = { ...req.body, id: Date.now() }
    memory[memoryKey].unshift(created)
    broadcastDataChanged({ resource: memoryKey, action: 'create' })
    return res.status(201).json(created)
  })

  app.put(`${basePath}/:id`, authRequired, permit(...updateRoles), async (req, res) => {
    const { id } = req.params
    if (validateMaybe(res, validateUpdate, req.body)) return
    if (connectedToMongo) {
      const updated = await models[modelName].findByIdAndUpdate(id, req.body, { new: true })
      if (!updated) return res.status(404).json({ error: 'Not found' })
      broadcastDataChanged({ resource: memoryKey, action: 'update' })
      return res.json(toPlain(updated))
    }
    const index = memory[memoryKey].findIndex(item => String(item.id) === String(id))
    if (index < 0) return res.status(404).json({ error: 'Not found' })
    memory[memoryKey][index] = { ...memory[memoryKey][index], ...req.body }
    broadcastDataChanged({ resource: memoryKey, action: 'update' })
    return res.json(memory[memoryKey][index])
  })

  app.delete(`${basePath}/:id`, authRequired, permit(...deleteRoles), async (req, res) => {
    const { id } = req.params
    if (connectedToMongo) {
      const deleted = await models[modelName].findByIdAndDelete(id)
      if (!deleted) return res.status(404).json({ error: 'Not found' })
      broadcastDataChanged({ resource: memoryKey, action: 'delete' })
      return res.status(204).end()
    }
    const before = memory[memoryKey].length
    memory[memoryKey] = memory[memoryKey].filter(item => String(item.id) !== String(id))
    if (memory[memoryKey].length === before) return res.status(404).json({ error: 'Not found' })
    broadcastDataChanged({ resource: memoryKey, action: 'delete' })
    return res.status(204).end()
  })
}

crudRoutes('/api/members', 'Member', 'members', { createRoles: ['admin', 'trainer'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'], validateCreate: validateMemberPayload })
crudRoutes('/api/trainers', 'Trainer', 'trainers', { createRoles: ['admin'], updateRoles: ['admin'], deleteRoles: ['admin'], validateCreate: validateTrainerPayload })
crudRoutes('/api/plans', 'MembershipPlan', 'membershipPlans', { createRoles: ['admin'], updateRoles: ['admin'], deleteRoles: ['admin'], validateCreate: validatePlanPayload })
crudRoutes('/api/categories', 'Category', 'categories', { createRoles: ['admin'], updateRoles: ['admin'], deleteRoles: ['admin'], validateCreate: validateCategoryPayload })
crudRoutes('/api/bookings', 'Booking', 'bookings', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'], validateCreate: validateBookingPayload })
crudRoutes('/api/sessions', 'Booking', 'bookings', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'], validateCreate: validateBookingPayload })
crudRoutes('/api/payments', 'Payment', 'payments', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'], validateCreate: validatePaymentPayload })
crudRoutes('/api/workouts', 'WorkoutPlan', 'workoutPlans', { createRoles: ['admin', 'trainer'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'], validateCreate: validateWorkoutPayload })
crudRoutes('/api/subscriptions', 'Subscription', 'subscriptions', { createRoles: ['admin', 'member'], updateRoles: ['admin', 'member'], deleteRoles: ['admin'], validateCreate: validateSubscriptionPayload })
crudRoutes('/api/attendance', 'Attendance', 'attendance', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin', 'trainer', 'member'], deleteRoles: ['admin'], validateCreate: validateAttendancePayload })
crudRoutes('/api/messages', 'Message', 'messages', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin'], deleteRoles: ['admin'], validateCreate: validateMessagePayload })

app.get('/api/users', authRequired, permit('admin'), async (_req, res) => {
  const users = connectedToMongo ? await models.User.find().sort({ createdAt: -1 }) : memory.users
  res.json(toPlain(users).map(sanitizeUser))
})

app.post('/api/users', authRequired, permit('admin'), async (req, res) => {
  const { name, email, password, role = 'member' } = req.body || {}
  if (!name || !email || !password) return sendValidationError(res, 'Name, email, and password are required')
  if (!validateEmail(email)) return sendValidationError(res, 'Email is invalid')
  if (!['admin', 'trainer', 'member'].includes(role)) return sendValidationError(res, 'Invalid role')

  const existing = await findUserByEmail(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  let user
  if (connectedToMongo) {
    user = await models.User.create({ name, email, role })
    await models.LoginInfo.create({
      userId: String(user._id),
      name,
      email,
      passwordHash,
      role,
    })
    broadcastDataChanged({ resource: 'users', action: 'create' })
  } else {
    const userId = Date.now()
    user = { id: userId, name, email, role }
    memory.users.unshift(user)
    memory.loginInfos.unshift({ id: userId, userId: String(userId), name, email, passwordHash, role })
    broadcastDataChanged({ resource: 'users', action: 'create' })
  }

  res.status(201).json(sanitizeUser(user))
})

app.put('/api/users/:id', authRequired, permit('admin'), async (req, res) => {
  const { id } = req.params
  const { name, email, password, role } = req.body || {}
  if (email && !validateEmail(email)) return sendValidationError(res, 'Email is invalid')
  if (role && !['admin', 'trainer', 'member'].includes(role)) return sendValidationError(res, 'Invalid role')

  if (connectedToMongo) {
    const current = await models.User.findById(id)
    if (!current) return res.status(404).json({ error: 'Not found' })

    const updates = { ...req.body }
    delete updates.password
    const updated = await models.User.findByIdAndUpdate(id, updates, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })

    const loginInfoUpdates = {
      name: updated.name,
      email: updated.email,
      role: updated.role,
    }
    if (password) {
      loginInfoUpdates.passwordHash = await bcrypt.hash(password, 10)
    }
    await models.LoginInfo.findOneAndUpdate(
      { userId: String(updated._id) },
      { $set: loginInfoUpdates },
      { new: true, upsert: true },
    )

    broadcastDataChanged({ resource: 'users', action: 'update' })

    return res.json(sanitizeUser(updated))
  }

  const index = memory.users.findIndex(item => String(item.id) === String(id))
  if (index < 0) return res.status(404).json({ error: 'Not found' })
  const next = { ...memory.users[index], ...req.body }
  memory.users[index] = next

  const loginIndex = memory.loginInfos.findIndex(item => String(item.userId) === String(id))
  if (loginIndex >= 0) {
    const loginNext = {
      ...memory.loginInfos[loginIndex],
      name: next.name,
      email: next.email,
      role: next.role,
    }
    if (password) loginNext.passwordHash = bcrypt.hashSync(password, 10)
    memory.loginInfos[loginIndex] = loginNext
  }

  broadcastDataChanged({ resource: 'users', action: 'update' })

  return res.json(sanitizeUser(next))
})

app.delete('/api/users/:id', authRequired, permit('admin'), async (req, res) => {
  const { id } = req.params
  if (connectedToMongo) {
    const deleted = await models.User.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    await models.LoginInfo.deleteOne({ userId: String(deleted._id) })
    broadcastDataChanged({ resource: 'users', action: 'delete' })
    return res.status(204).end()
  }
  const before = memory.users.length
  memory.users = memory.users.filter(item => String(item.id) !== String(id))
  if (memory.users.length === before) return res.status(404).json({ error: 'Not found' })
  memory.loginInfos = memory.loginInfos.filter(item => String(item.userId) !== String(id))
  broadcastDataChanged({ resource: 'users', action: 'delete' })
  return res.status(204).end()
})

app.post('/api/public/messages', async (req, res) => {
  const payload = {
    name: req.body?.name || '',
    email: req.body?.email || '',
    subject: req.body?.subject || '',
    message: req.body?.message || '',
    submittedAt: req.body?.submittedAt || new Date().toISOString(),
  }

  if (!payload.name || !payload.email || !payload.message) {
    return res.status(400).json({ error: 'Name, email, and message are required' })
  }

  if (connectedToMongo) {
    const created = await models.Message.create(payload)
    broadcastDataChanged({ resource: 'messages', action: 'create' })
    return res.status(201).json(created)
  }

  const created = { ...payload, id: Date.now() }
  memory.messages.unshift(created)
  broadcastDataChanged({ resource: 'messages', action: 'create' })
  return res.status(201).json(created)
})

function buildOverviewSummary(source = {}) {
  const paidPayments = source.payments || []
  const bookings = source.bookings || source.sessions || []
  const members = source.members || []
  const subscriptions = source.subscriptions || []

  return {
    members: members.length,
    bookings: bookings.length,
    revenue: paidPayments.filter(payment => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    activeTrainers: (source.trainers || []).filter(trainer => trainer.active !== false).length,
    expiringSubscriptions: subscriptions.filter(subscription => subscription.status === 'expiring').length,
    plans: (source.membershipPlans || source.plans || []).length,
  }
}

app.get('/api/reports/summary', authRequired, permit('admin'), async (_req, res) => {
  const summary = connectedToMongo
    ? buildOverviewSummary({
      members: await models.Member.find(),
      bookings: await models.Booking.find(),
      payments: await models.Payment.find(),
      trainers: await models.Trainer.find(),
      subscriptions: await models.Subscription.find(),
    })
    : buildOverviewSummary(memory)

  res.json(summary)
})

app.get('/api/reports/full', authRequired, permit('admin'), async (_req, res) => {
  const source = connectedToMongo
    ? {
      users: await models.User.find(),
      members: await models.Member.find(),
      trainers: await models.Trainer.find(),
      plans: await models.MembershipPlan.find(),
      categories: await models.Category.find(),
      bookings: await models.Booking.find(),
      payments: await models.Payment.find(),
      attendance: await models.Attendance.find(),
      workouts: await models.WorkoutPlan.find(),
      subscriptions: await models.Subscription.find(),
      messages: await models.Message.find(),
    }
    : memory

  const bookings = source.bookings || []
  const payments = source.payments || []
  const attendance = source.attendance || []
  const subscriptions = source.subscriptions || []
  const trainers = source.trainers || []
  const members = source.members || []

  const revenueByMonth = payments.reduce((acc, payment) => {
    const month = String(payment.date || '').slice(0, 7)
    if (!month) return acc
    acc[month] = (acc[month] || 0) + Number(payment.amount || 0)
    return acc
  }, {})

  const bookingByTrainer = bookings.reduce((acc, booking) => {
    acc[booking.trainer] = (acc[booking.trainer] || 0) + 1
    return acc
  }, {})

  res.json({
    summary: buildOverviewSummary(source),
    counts: {
      users: (source.users || []).length,
      members: members.length,
      trainers: trainers.length,
      plans: (source.membershipPlans || source.plans || []).length,
      categories: (source.categories || []).length,
      bookings: bookings.length,
      payments: payments.length,
      attendance: attendance.length,
      workouts: (source.workouts || []).length,
      subscriptions: subscriptions.length,
      messages: (source.messages || []).length,
    },
    revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })).sort((a, b) => a.month.localeCompare(b.month)),
    bookingByTrainer: Object.entries(bookingByTrainer).map(([trainer, value]) => ({ trainer, value })).sort((a, b) => b.value - a.value),
    attendanceRate: members.length ? Math.round((attendance.length / members.length) * 100) : 0,
    membershipMix: subscriptions.reduce((acc, subscription) => {
      acc[subscription.plan] = (acc[subscription.plan] || 0) + 1
      return acc
    }, {}),
    latest: {
      bookings: bookings.slice(-5),
      payments: payments.slice(-5),
      attendance: attendance.slice(-5),
    },
  })
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((error, _req, res, _next) => {
  console.error('API error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB })
    await migrateLoginInfoCollection()
    connectedToMongo = true
    console.log('Connected to MongoDB:', `${MONGODB_URI.includes('@') ? 'atlas/remote' : MONGODB_URI} (db: ${MONGODB_DB})`)
  } catch (error) {
    console.warn('MongoDB unavailable, falling back to in-memory store:', error.message)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IronCore API listening on http://127.0.0.1:${PORT} and http://localhost:${PORT}`)
  })
}

start()