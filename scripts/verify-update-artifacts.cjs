const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const pkg = require('../package.json')
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')
const { findForbiddenCalls, inspectRelease } = require('./verify-lib.cjs')

function main() {
  const root = path.join(__dirname, '..')
  const feedUrl = validateFeedUrl(process.env.UPDATE_SERVER_URL || feed.url)
  const forbidden = findForbiddenCalls(root)
  const report = inspectRelease(path.join(root, 'release'), {
    version: pkg.version,
    feedUrl
  })

  for (const note of report.notes) console.log(`ok  ${note}`)
  for (const hit of forbidden) console.error(`erro  ${hit}`)
  for (const error of report.errors) console.error(`erro  ${error}`)

  if (forbidden.length > 0 || !report.ok) process.exit(1)
  console.log(`Artefatos da ${pkg.version} conferidos para ${feedUrl}`)
}

if (require.main === module) main()

module.exports = { main }
