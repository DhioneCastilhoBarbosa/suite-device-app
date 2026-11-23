const fs = require('fs')
const path = require('path')

const FEED_BASE = 'https://app-suite-update.dualbase.com.br/suite-device-app'

function readPackageVersion(root) {
  const packagePath = path.join(root, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  const version = typeof packageJson.version === 'string' ? packageJson.version.trim() : ''
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('package.json precisa ter version SemVer numérico, como 1.2.12.')
  }
  return version
}

function validatePublishInputs({ version, channel, environment }) {
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('A versão precisa ser SemVer numérico, como 1.1.0.')
  }
  if (channel !== 'stable' && channel !== 'beta') {
    throw new Error('O canal precisa ser stable ou beta.')
  }
  if (environment !== 'staging' && environment !== 'production') {
    throw new Error('O ambiente precisa ser staging ou production.')
  }

  return {
    version,
    channel,
    environment,
    mode: environment === 'production' ? 'publish' : 'stage',
    feedUrl: `${FEED_BASE}/${channel}`
  }
}

function writePublishParams(params, file) {
  const body = [
    `VERSION=${params.version}`,
    `CHANNEL=${params.channel}`,
    `MODE=${params.mode}`,
    `FEED_URL=${params.feedUrl}`,
    ''
  ].join('\n')
  fs.writeFileSync(file, body, 'utf8')
}

function main() {
  const root = process.env.PUBLISH_PACKAGE_ROOT || path.join(__dirname, '..')
  const version = process.env.PUBLISH_VERSION || readPackageVersion(root)
  const params = validatePublishInputs({
    version,
    channel: process.env.PUBLISH_CHANNEL,
    environment: process.env.PUBLISH_ENVIRONMENT
  })
  const destination = process.env.PUBLISH_PARAMS_FILE || path.join(process.cwd(), 'publish-params.env')
  writePublishParams(params, destination)
  console.log(
    `Publicação ${params.version} (package.json) no canal ${params.channel}, modo ${params.mode}.`
  )
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

module.exports = { readPackageVersion, validatePublishInputs, writePublishParams, FEED_BASE }
