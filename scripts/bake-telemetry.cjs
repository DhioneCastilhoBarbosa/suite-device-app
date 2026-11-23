/**
 * Grava config/default-telemetry.json a partir de TELEMETRY_* (CI / .env).
 * O electron-vite 1.x não substitui process.env.TELEMETRY_* no bundle de forma
 * confiável — o app empacotado lia só o JSON default (localhost).
 */
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const file = path.join(__dirname, '..', 'config', 'default-telemetry.json')
const current = JSON.parse(fs.readFileSync(file, 'utf8'))

const enabledEnv = process.env.TELEMETRY_ENABLED
const enabled =
  enabledEnv === 'true' ? true : enabledEnv === 'false' ? false : Boolean(current.enabled)

const next = {
  enabled,
  url: (process.env.TELEMETRY_URL || '').trim() || current.url,
  token: (process.env.TELEMETRY_TOKEN || '').trim() || current.token,
  application: (process.env.TELEMETRY_APPLICATION || '').trim() || current.application
}

fs.writeFileSync(file, JSON.stringify(next, null, 2) + '\n')
console.log(
  `ok  telemetry baked enabled=${next.enabled} url=${next.url} tokenLen=${next.token.length} app=${next.application}`
)
