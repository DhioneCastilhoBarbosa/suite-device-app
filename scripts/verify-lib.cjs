const fs = require('fs')
const path = require('path')

const FORBIDDEN = ['setFeedURL', 'forceDevUpdateConfig']

function walkTypeScript(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'out' ||
        entry.name === 'release' ||
        entry.name === 'dist'
      ) {
        continue
      }
      walkTypeScript(full, acc)
      continue
    }
    if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) acc.push(full)
  }
  return acc
}

function findForbiddenCalls(root) {
  const hits = []
  for (const file of walkTypeScript(path.join(root, 'src'))) {
    const text = fs.readFileSync(file, 'utf8')
    for (const token of FORBIDDEN) {
      if (text.includes(token)) hits.push(`${path.relative(root, file)} contém ${token}`)
    }
  }
  return hits
}

function inspectRelease(dir, expected) {
  const errors = []
  const notes = []
  const latestPath = path.join(dir, 'latest.yml')

  if (!fs.existsSync(latestPath)) {
    errors.push('latest.yml ausente.')
  } else {
    const latest = fs.readFileSync(latestPath, 'utf8')
    if (!latest.includes(`version: ${expected.version}`)) {
      errors.push(`latest.yml não declara a versão ${expected.version}.`)
    }
    if (!/sha512:/.test(latest)) errors.push('latest.yml sem sha512.')
    const fileUrl = /^\s+-\s+url:\s+(.+)$/m.exec(latest)
    if (!fileUrl) errors.push('latest.yml sem arquivo de instalação.')
    else if (!fileUrl[1].trim().toLowerCase().endsWith('.exe')) {
      errors.push('latest.yml não aponta para um instalador .exe.')
    }
    notes.push('latest.yml encontrado.')
  }

  const names = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  const installers = names.filter((name) => name.endsWith('.exe') && !name.endsWith('.blockmap'))
  const blockmaps = names.filter((name) => name.endsWith('.exe.blockmap') || name.endsWith('.blockmap'))
  if (installers.length === 0) errors.push('Instalador .exe ausente na pasta release.')
  else notes.push(`Instalador: ${installers.join(', ')}`)
  if (blockmaps.length === 0) errors.push('.blockmap ausente.')
  else notes.push(`Blockmap: ${blockmaps.join(', ')}`)

  const embeddedCandidates = names
    .filter((name) => name.startsWith('win') && name.endsWith('-unpacked'))
    .map((name) => path.join(dir, name, 'resources', 'app-update.yml'))
  embeddedCandidates.push(path.join(dir, 'win-unpacked', 'resources', 'app-update.yml'))
  const embedded = embeddedCandidates.find((candidate) => fs.existsSync(candidate))
  if (!embedded) {
    errors.push('app-update.yml não foi embutido em win-unpacked/resources.')
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

module.exports = { findForbiddenCalls, inspectRelease }
