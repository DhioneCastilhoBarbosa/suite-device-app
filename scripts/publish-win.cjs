/**
 * Publicação Windows: carrega .env e executa electron-builder com --publish always.
 */
require('./patch-nsis-windows.cjs')

const { execSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const RUNNING_EXE_NAMES = ['suite-device.exe', 'suite-device-app.exe']

function assertAppNotRunning() {
  for (const imageName of RUNNING_EXE_NAMES) {
    try {
      const out = execSync(`tasklist /FI "IMAGENAME eq ${imageName}" /NH`, { encoding: 'utf8' })
      if (out.toLowerCase().includes(imageName.toLowerCase())) {
        console.error(`\nErro: ${imageName} está em execução.`)
        console.error('Feche o Suite Device (Gestor de tarefas) e execute npm run publish novamente.\n')
        process.exit(1)
      }
    } catch {
      /* tasklist sem correspondência */
    }
  }
}

assertAppNotRunning()

if (!process.env.CSC_IDENTITY_AUTO_DISCOVERY) {
  process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false'
}

const distDir = path.join(__dirname, '..', 'dist')
try {
  for (const f of fs.readdirSync(distDir)) {
    if ((f.endsWith('.exe') && f.includes('Setup')) || f.startsWith('__uninstaller')) {
      fs.unlinkSync(path.join(distDir, f))
    }
  }
} catch {
  /* dist pode não existir */
}

if (!process.env.GH_TOKEN) {
  console.error('GH_TOKEN não definido no .env — necessário para publicar no GitHub.')
  process.exit(1)
}

const args = ['electron-builder', '--win', '--publish', 'always', '--config=electron-builder.yml']
const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const result = spawnSync(cmd, args, {
  stdio: 'inherit',
  env: process.env,
  shell: true,
  cwd: require('path').join(__dirname, '..')
})

process.exit(result.status === null ? 1 : result.status)
