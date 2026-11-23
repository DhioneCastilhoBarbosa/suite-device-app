/**
 * Confirma a versão do package.json antes do publish (igual espírito do electron-update-test).
 * Não altera UI do produto — só valida SemVer.
 */
const path = require('path')
const { readPackageVersion, validatePublishInputs } = require('./validate-publish-inputs.cjs')

function prepareRelease(root) {
  const version = readPackageVersion(root)
  // Valida formato; channel/environment reais vêm do workflow no passo seguinte.
  validatePublishInputs({
    version,
    channel: process.env.PUBLISH_CHANNEL || 'stable',
    environment: process.env.PUBLISH_ENVIRONMENT || 'staging'
  })
  return version
}

function main() {
  const root = path.join(__dirname, '..')
  const version = prepareRelease(root)
  console.log(`Release preparada na versão ${version} (package.json).`)
}

if (require.main === module) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

module.exports = { prepareRelease }
