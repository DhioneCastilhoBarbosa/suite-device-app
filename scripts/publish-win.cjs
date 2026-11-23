/**
 * Publicação Windows de TRANSIÇÃO: build com feed generic embutido + upload ao GitHub Releases.
 * NÃO use em produção sem autorização explícita.
 * Pós-transição: workflow publish-windows.yml (servidor).
 */
require('./patch-nsis-windows.cjs')

const { execSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')

const RUNNING_EXE_NAMES = ['suite-device.exe', 'suite-device-app.exe']
const root = path.join(__dirname, '..')

function assertAppNotRunning() {
  if (process.platform !== 'win32') return
  for (const imageName of RUNNING_EXE_NAMES) {
    try {
      const out = execSync(`tasklist /FI "IMAGENAME eq ${imageName}" /NH`, { encoding: 'utf8' })
      if (out.toLowerCase().includes(imageName.toLowerCase())) {
        console.error(`\nErro: ${imageName} está em execução.`)
        console.error('Feche o Suite Device e execute npm run publish novamente.\n')
        process.exit(1)
      }
    } catch {
      /* ok */
    }
  }
}

assertAppNotRunning()

const feedUrl = validateFeedUrl(process.env.UPDATE_SERVER_URL || feed.url)
process.env.UPDATE_SERVER_URL = feedUrl
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false'

if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
  console.error('GH_TOKEN (ou GITHUB_TOKEN) não definido — necessário para GitHub Releases.')
  process.exit(1)
}
if (!process.env.GITHUB_TOKEN && process.env.GH_TOKEN) {
  process.env.GITHUB_TOKEN = process.env.GH_TOKEN
}

const version = require(path.join(root, 'package.json')).version
const tag = `v${version}`

console.log(`\n⚠  Publish de transição: build + GitHub Releases (${tag})`)
console.log(`   app-update.yml embutido: generic → ${feedUrl}\n`)

const build = spawnSync('node', [path.join(__dirname, 'build-win.cjs')], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
  shell: true
})
if (build.status !== 0) {
  process.exit(build.status === null ? 1 : build.status)
}

const releaseDir = path.join(root, 'release')
const artifacts = []
for (const name of fs.readdirSync(releaseDir)) {
  if (
    name === 'latest.yml' ||
    (name.endsWith('.exe') && !name.endsWith('.blockmap')) ||
    name.endsWith('.exe.blockmap')
  ) {
    artifacts.push(path.join(releaseDir, name))
  }
}
if (artifacts.length === 0) {
  console.error('Nenhum artefato em release/ (latest.yml / Setup .exe / .blockmap).')
  process.exit(1)
}

const ghCheck = spawnSync('gh', ['--version'], { encoding: 'utf8' })
if (ghCheck.status !== 0) {
  console.error('GitHub CLI (gh) é necessário. Ou use .github/workflows/publish-windows-github.yml')
  process.exit(1)
}

const existing = spawnSync('gh', ['release', 'view', tag], {
  cwd: root,
  encoding: 'utf8',
  env: process.env
})

if (existing.status === 0) {
  const upload = spawnSync('gh', ['release', 'upload', tag, ...artifacts, '--clobber'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env
  })
  process.exit(upload.status === null ? 1 : upload.status)
}

const create = spawnSync(
  'gh',
  [
    'release',
    'create',
    tag,
    ...artifacts,
    '--title',
    `Suite Device ${version}`,
    '--notes',
    `Versão de transição ${version}. Feed embutido: servidor próprio (suite-device-app/stable).`
  ],
  { cwd: root, stdio: 'inherit', env: process.env }
)
process.exit(create.status === null ? 1 : create.status)
