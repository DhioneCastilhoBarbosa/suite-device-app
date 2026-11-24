/**
 * No GitHub Actions o electron-builder com identity: '-' muitas vezes NÃO assina
 * ("0 identities found") e deixa a assinatura do Electron quebrada após o pack.
 * ShipIt / codesign --verify exigem assinatura válida — ad-hoc resolve sem Developer ID.
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)
  if (!fs.existsSync(appPath)) {
    throw new Error(`afterPack Mac: .app não encontrado em ${appPath}`)
  }

  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit'
  })

  const verify = execFileSync(
    'codesign',
    ['--verify', '--deep', '--strict', appPath],
    { encoding: 'utf8' }
  )
  console.log(`ok  codesign ad-hoc: ${appPath}${verify ? ` ${verify}` : ''}`)
}
