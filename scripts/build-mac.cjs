const { spawnSync } = require('child_process')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')

const feedUrl = validateFeedUrl(process.env.UPDATE_SERVER_URL || feed.url)
process.env.UPDATE_SERVER_URL = feedUrl
// identity: '-' + afterPack (scripts/after-pack-mac.cjs) para ad-hoc no CI.
// Não forçar CSC_IDENTITY_AUTO_DISCOVERY=false — atrapalha assinatura local.
process.env.ELECTRON_BUILDER_CACHE = path.join(__dirname, '..', '.cache', 'electron-builder')
console.log(`Gerando build Mac (ad-hoc) com feed ${feedUrl}`)

const build = spawnSync(
  'npx',
  ['electron-builder', '--mac', '--arm64', '--config', 'electron-builder.yml'],
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

const verify = spawnSync('node', ['scripts/verify-mac-artifacts.cjs'], {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  stdio: 'inherit',
  shell: true
})

process.exit(verify.status === null ? 1 : verify.status)
