require('./patch-nsis-windows.cjs')

const { execSync, spawnSync } = require('child_process')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const RUNNING_EXE_NAMES = ['suite-device.exe', 'suite-device-app.exe']

function assertAppNotRunning() {
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

if (!process.env.CSC_IDENTITY_AUTO_DISCOVERY) {
  process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false'
}

const args = ['electron-builder', '--win', '--config=electron-builder.yml']
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const result = spawnSync(cmd, args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
  cwd: require('path').join(__dirname, '..')
})

process.exit(result.status === null ? 1 : result.status)
