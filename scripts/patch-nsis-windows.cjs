/**
 * No Windows, electron-builder executa o instalador NSIS intermédio para extrair o
 * uninstaller (execWine → spawn EPERM com Defender / políticas corporativas).
 * UninstallerReader extrai do PE sem executar — já usado no macOS Catalina.
 */
function patchNsisUninstallerExtraction() {
  if (process.platform !== 'win32') return

  const { NsisTarget } = require('app-builder-lib/out/targets/nsis/NsisTarget')
  const nsisUtil = require('app-builder-lib/out/targets/nsis/nsisUtil')
  const wine = require('app-builder-lib/out/wine')
  const builder_util = require('builder-util')
  const fs = require('fs-extra')
  const path = require('path')
  const { exists } = require('builder-util/out/fs')
  const macosVersion = require('app-builder-lib/out/util/macosVersion')

  if (NsisTarget.prototype.__suiteDevicePatched) return
  NsisTarget.prototype.__suiteDevicePatched = true

  NsisTarget.prototype.computeScriptAndSignUninstaller = async function (
    defines,
    commands,
    installerPath,
    sharedHeader,
    archs
  ) {
    const packager = this.packager
    const customScriptPath = await packager.getResource(this.options.script, 'installer.nsi')
    const script = await fs.readFile(
      customScriptPath || path.join(nsisUtil.nsisTemplatesDir, 'installer.nsi'),
      'utf8'
    )
    if (customScriptPath != null) {
      builder_util.log.info(
        { reason: 'custom NSIS script is used' },
        'uninstaller is not signed by electron-builder'
      )
      return script
    }

    const uninstallerPath = path.join(
      this.outDir,
      `__uninstaller-${this.name}-${this.packager.appInfo.sanitizedName}.exe`
    )
    defines.BUILD_UNINSTALLER = null
    defines.UNINSTALLER_OUT_FILE = uninstallerPath
    await this.executeMakensis(
      defines,
      commands,
      sharedHeader + (await this.computeFinalScript(script, false, archs))
    )

    if (macosVersion.isMacOsCatalina()) {
      try {
        await nsisUtil.UninstallerReader.exec(installerPath, uninstallerPath)
      } catch (error) {
        builder_util.log.warn(`packager.vm is used: ${error.message}`)
        const vm = await packager.vm.value
        await vm.exec(installerPath, [])
        let i = 0
        while (!(await exists(uninstallerPath)) && i++ < 100) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      }
    } else if (process.platform === 'win32') {
      builder_util.log.info(
        'Extraindo uninstaller NSIS sem executar o stub (evita spawn EPERM no Windows)'
      )
      await nsisUtil.UninstallerReader.exec(installerPath, uninstallerPath)
    } else {
      await wine.execWine(installerPath, null, [], { env: { __COMPAT_LAYER: 'RunAsInvoker' } })
    }

    await packager.sign(uninstallerPath, 'signing NSIS uninstaller')
    delete defines.BUILD_UNINSTALLER
    defines.UNINSTALLER_OUT_FILE = uninstallerPath
    return script
  }
}

patchNsisUninstallerExtraction()
