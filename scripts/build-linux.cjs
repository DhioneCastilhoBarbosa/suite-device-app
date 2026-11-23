const { spawnSync } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')

const feedUrl = validateFeedUrl(process.env.UPDATE_SERVER_URL || feed.url)
process.env.UPDATE_SERVER_URL = feedUrl
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false'
process.env.ELECTRON_BUILDER_CACHE = path.join(__dirname, '..', '.cache', 'electron-builder')
console.log(`Gerando build Linux (AppImage) com feed ${feedUrl}`)

const build = spawnSync(
  'npx',
  ['electron-builder', '--linux', '--x64', '--config', 'electron-builder.yml'],
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

const verify = spawnSync('node', ['scripts/verify-linux-artifacts.cjs'], {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  stdio: 'inherit',
  shell: true
})

process.exit(verify.status === null ? 1 : verify.status)
