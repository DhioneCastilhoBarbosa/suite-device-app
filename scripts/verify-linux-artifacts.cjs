const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const pkg = require('../package.json')
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')
const { findForbiddenCalls } = require('./verify-lib.cjs')

function inspectLinuxRelease(dir, expected) {
  const errors = []
  const notes = []
  const latestPath = path.join(dir, 'latest-linux.yml')

  if (!fs.existsSync(latestPath)) {
    errors.push('latest-linux.yml ausente.')
  } else {
    const latest = fs.readFileSync(latestPath, 'utf8')
    if (!latest.includes(`version: ${expected.version}`)) {
      errors.push(`latest-linux.yml não declara a versão ${expected.version}.`)
    }
    if (!/sha512:/.test(latest)) errors.push('latest-linux.yml sem sha512.')
    notes.push('latest-linux.yml encontrado.')
  }

  const names = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  const images = names.filter((name) => name.endsWith('.AppImage') && !name.endsWith('.blockmap'))
  if (images.length === 0) errors.push('Arquivo .AppImage ausente na pasta release.')
  else notes.push(`AppImage: ${images.join(', ')}`)
  const blockmaps = names.filter((name) => name.endsWith('.AppImage.blockmap'))
  if (blockmaps.length === 0) {
    notes.push('Blockmap lateral ausente (normal no AppImage; o mapa vai embutido).')
  } else {
    notes.push(`Blockmap: ${blockmaps.join(', ')}`)
  }

  const embeddedCandidates = [
    path.join(dir, 'linux-unpacked', 'resources', 'app-update.yml'),
    path.join(dir, 'linux-x64-unpacked', 'resources', 'app-update.yml')
  ]
  const embedded = embeddedCandidates.find((candidate) => fs.existsSync(candidate))
  if (!embedded) {
    errors.push('app-update.yml não foi embutido em linux-unpacked/resources.')
  } else {
    const text = fs.readFileSync(embedded, 'utf8')
    if (!/^provider:\s*generic\s*$/m.test(text)) {
      errors.push('app-update.yml não usa provider generic.')
    }
    if (!text.includes(expected.feedUrl)) {
      errors.push('app-update.yml não contém a URL esperada do feed.')
    }
    notes.push(`app-update.yml embutido: ${path.relative(dir, embedded)}`)
  }

  return { ok: errors.length === 0, errors, notes }
}

function main() {
  const root = path.join(__dirname, '..')
  const feedUrl = validateFeedUrl(process.env.UPDATE_SERVER_URL || feed.url)
  const forbidden = findForbiddenCalls(root)
  const report = inspectLinuxRelease(path.join(root, 'release'), {
    version: pkg.version,
    feedUrl
  })

  for (const note of report.notes) console.log(`ok  ${note}`)
  for (const hit of forbidden) console.error(`erro  ${hit}`)
  for (const error of report.errors) console.error(`erro  ${error}`)

  if (forbidden.length > 0 || !report.ok) process.exit(1)
  console.log(`Artefatos Linux da ${pkg.version} conferidos para ${feedUrl}`)
}

if (require.main === module) main()

module.exports = { inspectLinuxRelease, main }
