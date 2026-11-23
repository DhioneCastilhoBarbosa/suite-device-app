/**
 * Compat: garante UPDATE_SERVER_URL. Preferir validate-feed-url via build-*.cjs.
 */
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })
const feed = require('../config/default-feed.json')
const { validateFeedUrl } = require('./validate-feed-url.cjs')

const feedUrl = validateFeedUrl(process.env.UPDATE_SERVER_URL || feed.url)
process.env.UPDATE_SERVER_URL = feedUrl
console.log(`Feed de update: ${feedUrl}`)

module.exports = { feedUrl, validateFeedUrl }
