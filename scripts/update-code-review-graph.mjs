import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const outputFile = path.join(projectRoot, 'code-review-graph.md')
const roots = ['src', 'server']
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx'])

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).split(path.sep).join('/')
}

function getGroup(relativePath) {
  if (relativePath.startsWith('src/pages/')) return 'pages'
  if (relativePath.startsWith('src/components/')) return 'components'
  if (relativePath.startsWith('src/context/')) return 'context'
  if (relativePath.startsWith('src/lib/')) return 'shared'
  if (relativePath.startsWith('src/styles/')) return 'styles'
  if (relativePath.startsWith('server/')) return 'backend'
  return 'other'
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example') continue
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) continue
      files.push(...await walk(path.join(directory, entry.name)))
      continue
    }

    if (extensions.has(path.extname(entry.name))) {
      files.push(path.join(directory, entry.name))
    }
  }

  return files
}

function extractImports(source) {
  const results = []
  const patterns = [
    /import\s+(?:[\w*\s{},]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g,
    /export\s+[^;]*?\s+from\s+['"]([^'"]+)['"]/g,
  ]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      if (match[1]) results.push(match[1])
    }
  }

  return results
}

async function resolveImport(sourceFile, specifier) {
  if (!specifier.startsWith('.')) return null

  const basePath = path.resolve(path.dirname(sourceFile), specifier)
  const candidates = [
    basePath,
    ...Array.from(extensions, extension => `${basePath}${extension}`),
    ...Array.from(extensions, extension => path.join(basePath, `index${extension}`)),
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

async function buildGraph() {
  const files = []

  for (const root of roots) {
    const absRoot = path.join(projectRoot, root)
    try {
      const stats = await fs.stat(absRoot)
      if (stats.isDirectory()) files.push(...await walk(absRoot))
    } catch {
      continue
    }
  }

  const sorted = files.sort((left, right) => toRelative(left).localeCompare(toRelative(right)))
  const nodes = []
  const edges = []

  for (const filePath of sorted) {
    const relativePath = toRelative(filePath)
    const content = await fs.readFile(filePath, 'utf8')
    const imports = []

    for (const specifier of extractImports(content)) {
      const resolved = await resolveImport(filePath, specifier)
      if (!resolved) continue
      imports.push(toRelative(resolved))
      edges.push({ source: relativePath, target: toRelative(resolved) })
    }

    nodes.push({
      id: relativePath,
      label: path.basename(relativePath),
      path: relativePath,
      group: getGroup(relativePath),
      importCount: imports.length,
    })
  }

  const incoming = new Map(nodes.map(node => [node.id, 0]))
  const outgoing = new Map(nodes.map(node => [node.id, 0]))

  for (const edge of edges) {
    outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + 1)
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1)
  }

  const enriched = nodes.map(node => ({
    ...node,
    incoming: incoming.get(node.id) || 0,
    outgoing: outgoing.get(node.id) || 0,
    degree: (incoming.get(node.id) || 0) + (outgoing.get(node.id) || 0),
  }))

  const hotspots = [...enriched].sort((left, right) => right.degree - left.degree).slice(0, 10)

  const lines = []
  lines.push('# Code Review Graph')
  lines.push('')
  lines.push('Visible generated graph for the current workspace. Regenerate with `npm run graph:update`.')
  lines.push('')
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Files scanned: ${enriched.length}`)
  lines.push(`- Dependency edges: ${edges.length}`)
  lines.push(`- Frontend files: ${enriched.filter(node => node.path.startsWith('src/')).length}`)
  lines.push(`- Backend files: ${enriched.filter(node => node.path.startsWith('server/')).length}`)
  lines.push('')
  lines.push('## Hotspots')
  lines.push('')
  for (const item of hotspots) {
    lines.push(`- ${item.path} (${item.degree} connections)`)
  }
  lines.push('')
  lines.push('## Graph')
  lines.push('')
  lines.push('```mermaid')
  lines.push('flowchart LR')
  lines.push('  classDef pages fill:#dc26261f,stroke:#dc2626,color:#fff;')
  lines.push('  classDef components fill:#3b82f61f,stroke:#3b82f6,color:#fff;')
  lines.push('  classDef context fill:#22c55e1f,stroke:#22c55e,color:#fff;')
  lines.push('  classDef shared fill:#f59e0b1f,stroke:#f59e0b,color:#fff;')
  lines.push('  classDef backend fill:#a855f71f,stroke:#a855f7,color:#fff;')
  lines.push('  classDef styles fill:#94a3b81f,stroke:#94a3b8,color:#fff;')
  lines.push('  classDef other fill:#64748b1f,stroke:#64748b,color:#fff;')
  lines.push('')

  for (const node of enriched.slice(0, 80)) {
    const safeId = node.id.replace(/[^a-zA-Z0-9_]/g, '_')
    lines.push(`  ${safeId}["${node.path}"]:::${node.group}`)
  }

  lines.push('')

  for (const edge of edges.slice(0, 180)) {
    const from = edge.source.replace(/[^a-zA-Z0-9_]/g, '_')
    const to = edge.target.replace(/[^a-zA-Z0-9_]/g, '_')
    lines.push(`  ${from} --> ${to}`)
  }

  lines.push('```')
  lines.push('')
  lines.push('## Update Notes')
  lines.push('')
  lines.push('- Run `npm run graph:update` after small code changes to refresh this file.')
  lines.push('- The graph is derived from import relationships in `src/` and `server/`.')

  await fs.writeFile(outputFile, `${lines.join('\n')}\n`, 'utf8')
}

buildGraph().catch(error => {
  console.error(error)
  process.exitCode = 1
})