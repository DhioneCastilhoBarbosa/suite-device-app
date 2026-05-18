/**
 * Gera resources/icon.ico a partir de resources/icon.png (binário válido).
 * Não uses PowerShell com ">" — corrompe o ficheiro em UTF-16.
 */
const fs = require('fs')
const path = require('path')

const pngPath = path.join(__dirname, '..', 'resources', 'icon.png')
const icoPath = path.join(__dirname, '..', 'resources', 'icon.ico')

async function main() {
  const pngToIco = require('png-to-ico')
  const buf = await pngToIco(pngPath)
  if (buf.length < 6 || buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) {
    throw new Error('png-to-ico produziu um ficheiro ICO inválido')
  }
  fs.writeFileSync(icoPath, buf)
  console.log(`icon.ico gerado (${buf.length} bytes) a partir de icon.png`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
