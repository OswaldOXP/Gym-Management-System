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
const MONGODB_URI = process.env.MONGODB_URI || ''
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const GRAPH_ROOTS = ['src', 'server']
const GRAPH_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx'])

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

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
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

const models = {
  User: mongoose.models.User || mongoose.model('User', userSchema),
  Member: mongoose.models.Member || mongoose.model('Member', memberSchema),
  Session: mongoose.models.Session || mongoose.model('Session', sessionSchema),
  Payment: mongoose.models.Payment || mongoose.model('Payment', paymentSchema),
  WorkoutPlan: mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', workoutPlanSchema),
  Subscription: mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema),
  Attendance: mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema),
  Message: mongoose.models.Message || mongoose.model('Message', messageSchema),
}

const memory = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@ironcore.com', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: 2, name: 'John Trainer', email: 'trainer@ironcore.com', passwordHash: bcrypt.hashSync('train123', 10), role: 'trainer' },
    { id: 3, name: 'Sara Member', email: 'member@ironcore.com', passwordHash: bcrypt.hashSync('member123', 10), role: 'member' },
  ],
  members: [
    { id: 1, name: 'Sara Al Mansoori', email: 'sara@email.com', phone: '+971 50 111 2222', plan: 'Pro', status: 'active', joined: '2024-01-15', expiry: '2025-03-31' },
    { id: 2, name: 'Ahmed Khalil', email: 'ahmed@email.com', phone: '+971 55 333 4444', plan: 'Elite', status: 'active', joined: '2023-11-02', expiry: '2025-11-02' },
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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, backend: 'ironcore-api', mongo: connectedToMongo })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const user = await findUserByEmail(email)
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  const passwordHash = user.passwordHash || user.password
  const valid = connectedToMongo ? await bcrypt.compare(password, passwordHash) : await bcrypt.compare(password, passwordHash)
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
    user = await models.User.create({ name, email, passwordHash, role: 'member' })
    await models.Member.create({
      name,
      email,
      phone: '',
      plan: 'Basic',
      status: 'pending',
      joined,
      expiry,
    })
  } else {
    user = { id: Date.now(), name, email, passwordHash, role: 'member' }
    memory.users.push(user)
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

  app.get(basePath, authRequired, async (_req, res) => {
    if (connectedToMongo) return res.json(await models[modelName].find().sort({ createdAt: -1 }))
    return res.json(memory[memoryKey])
  })

  app.post(basePath, authRequired, permit(...createRoles), async (req, res) => {
    if (connectedToMongo) {
      const created = await models[modelName].create(req.body)
      return res.status(201).json(created)
    }
    const created = { ...req.body, id: Date.now() }
    memory[memoryKey].unshift(created)
    return res.status(201).json(created)
  })

  app.put(`${basePath}/:id`, authRequired, permit(...updateRoles), async (req, res) => {
    const { id } = req.params
    if (connectedToMongo) {
      const updated = await models[modelName].findByIdAndUpdate(id, req.body, { new: true })
      if (!updated) return res.status(404).json({ error: 'Not found' })
      return res.json(updated)
    }
    const index = memory[memoryKey].findIndex(item => String(item.id) === String(id))
    if (index < 0) return res.status(404).json({ error: 'Not found' })
    memory[memoryKey][index] = { ...memory[memoryKey][index], ...req.body }
    return res.json(memory[memoryKey][index])
  })

  app.delete(`${basePath}/:id`, authRequired, permit(...deleteRoles), async (req, res) => {
    const { id } = req.params
    if (connectedToMongo) {
      const deleted = await models[modelName].findByIdAndDelete(id)
      if (!deleted) return res.status(404).json({ error: 'Not found' })
      return res.status(204).end()
    }
    const before = memory[memoryKey].length
    memory[memoryKey] = memory[memoryKey].filter(item => String(item.id) !== String(id))
    if (memory[memoryKey].length === before) return res.status(404).json({ error: 'Not found' })
    return res.status(204).end()
  })
}

crudRoutes('/api/members', 'Member', 'members', { createRoles: ['admin', 'trainer'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'] })
crudRoutes('/api/sessions', 'Session', 'sessions', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin', 'trainer'] })
crudRoutes('/api/payments', 'Payment', 'payments', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'] })
crudRoutes('/api/workouts', 'WorkoutPlan', 'workoutPlans', { createRoles: ['admin', 'trainer'], updateRoles: ['admin', 'trainer'], deleteRoles: ['admin'] })
crudRoutes('/api/subscriptions', 'Subscription', 'subscriptions', { createRoles: ['admin', 'member'], updateRoles: ['admin', 'member'], deleteRoles: ['admin'] })
crudRoutes('/api/attendance', 'Attendance', 'attendance', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin', 'trainer', 'member'], deleteRoles: ['admin'] })
crudRoutes('/api/messages', 'Message', 'messages', { createRoles: ['admin', 'trainer', 'member'], updateRoles: ['admin'], deleteRoles: ['admin'] })

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
    return res.status(201).json(created)
  }

  const created = { ...payload, id: Date.now() }
  memory.messages.unshift(created)
  return res.status(201).json(created)
})

app.get('/api/reports/summary', authRequired, permit('admin'), async (_req, res) => {
  const members = connectedToMongo ? await models.Member.countDocuments() : memory.members.length
  const sessions = connectedToMongo ? await models.Session.countDocuments() : memory.sessions.length
  const revenue = connectedToMongo
    ? (await models.Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]))[0]?.total || 0
    : memory.payments.filter(payment => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)

  res.json({ members, sessions, revenue })
})

async function start() {
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI)
      connectedToMongo = true
      console.log('Connected to MongoDB')
    } catch (error) {
      console.warn('MongoDB unavailable, using in-memory store:', error.message)
    }
  }

  app.listen(PORT, () => {
    console.log(`IronCore API listening on http://localhost:${PORT}`)
  })
}

start()