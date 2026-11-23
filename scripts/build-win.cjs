/**
 * Build Windows alinhado ao electron-update-test (+ patch NSIS e guard de processo do Suite Device).
 */
require('./patch-nsis-windows.cjs')

const { execSync, spawnSync } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')

const RUNNING_EXE_NAMES = ['suite-device.exe', 'suite-device-app.exe']

function assertAppNotRunning() {
  if (process.platform !== 'win32') return
  for (const imageName of RUNNING_EXE_NAMES) {
    try {
      const out = execSync(`tasklist /FI "IMAGENAME eq ${imageName}" /NH`, { encoding: 'utf8' })
      if (out.toLowerCase().includes(imageName.toLowerCase())) {
        console.error(`\nErro: ${imageName} está em execução. Feche o Suite Device e tente novamente.\n`)
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
process.env.ELECTRON_BUILDER_CACHE = path.join(__dirname, '..', '.cache', 'electron-builder')
console.log(`Gerando instalador com feed ${feedUrl}`)

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const build = spawnSync(
  cmd,
  ['electron-builder', '--win', '--x64', '--config', 'electron-builder.yml'],
  {
    cwd: path.join(__dirname, '..'),
    env: process.env,
    stdio: 'inherit',
    shell: true
  }
)

if (build.status !== 0) {
  process.exit(build.status === null ? 1 : build.status)
}

const verify = spawnSync('node', ['scripts/verify-update-artifacts.cjs'], {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  stdio: 'inherit',
  shell: true
})

process.exit(verify.status === null ? 1 : verify.status)
