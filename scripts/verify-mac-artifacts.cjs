const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const pkg = require('../package.json')
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')
const { findForbiddenCalls } = require('./verify-lib.cjs')

function inspectMacRelease(dir, expected) {
  const errors = []
  const notes = []
  const latestPath = path.join(dir, 'latest-mac.yml')

  if (!fs.existsSync(latestPath)) {
    errors.push('latest-mac.yml ausente.')
  } else {
    const latest = fs.readFileSync(latestPath, 'utf8')
    if (!latest.includes(`version: ${expected.version}`)) {
      errors.push(`latest-mac.yml não declara a versão ${expected.version}.`)
    }
    if (!/sha512:/.test(latest)) errors.push('latest-mac.yml sem sha512.')
    notes.push('latest-mac.yml encontrado.')
  }

  const names = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  const zips = names.filter((name) => name.endsWith('.zip'))
  const dmgs = names.filter((name) => name.endsWith('.dmg'))
  if (zips.length === 0) errors.push('Arquivo .zip ausente na pasta release.')
  else notes.push(`Zip: ${zips.join(', ')}`)
  if (dmgs.length === 0) errors.push('Arquivo .dmg ausente na pasta release.')
  else notes.push(`DMG: ${dmgs.join(', ')}`)

  const embeddedCandidates = [
    path.join(dir, 'mac-arm64', `${expected.executableName}.app`, 'Contents', 'Resources', 'app-update.yml'),
    path.join(dir, 'mac', `${expected.executableName}.app`, 'Contents', 'Resources', 'app-update.yml'),
    path.join(dir, 'mac-arm64', `${expected.productName}.app`, 'Contents', 'Resources', 'app-update.yml'),
    path.join(dir, 'mac', `${expected.productName}.app`, 'Contents', 'Resources', 'app-update.yml')
  ]
  const embedded = embeddedCandidates.find((candidate) => fs.existsSync(candidate))
  if (!embedded) {
    errors.push('app-update.yml não foi embutido no .app.')
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

  const appPath = embedded ? path.dirname(path.dirname(path.dirname(embedded))) : null
  if (appPath && fs.existsSync(appPath) && process.platform === 'darwin') {
    const signed = spawnSync('codesign', ['--verify', '--deep', '--strict', appPath], {
      encoding: 'utf8'
    })
    if (signed.status !== 0) {
      errors.push(`assinatura inválida: ${(signed.stderr || signed.stdout || '').trim()}`)
    } else {
      notes.push(`codesign ok: ${path.relative(dir, appPath)}`)
    }
  }

  return { ok: errors.length === 0, errors, notes }
}

function main() {
  const root = path.join(__dirname, '..')
  const feedUrl = validateFeedUrl(process.env.UPDATE_SERVER_URL || feed.url)
  const forbidden = findForbiddenCalls(root)
  const report = inspectMacRelease(path.join(root, 'release'), {
    version: pkg.version,
    feedUrl,
    productName: 'suite-device-app',
    executableName: 'suite-device-app'
  })

  for (const note of report.notes) console.log(`ok  ${note}`)
  for (const hit of forbidden) console.error(`erro  ${hit}`)
  for (const error of report.errors) console.error(`erro  ${error}`)

  if (forbidden.length > 0 || !report.ok) process.exit(1)
  console.log(`Artefatos Mac da ${pkg.version} conferidos para ${feedUrl}`)
}

if (require.main === module) main()

module.exports = { inspectMacRelease, main }
