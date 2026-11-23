/**
 * GitHub Releases troca espaços por "." no nome do asset.
 * Alinha arquivos + latest*.yml antes do gh release upload/create.
 *
 * Uso: node scripts/prepare-github-release-assets.cjs <pasta-artefatos>
 */
const fs = require('fs')
const path = require('path')

const dir = process.argv[2]
if (!dir) {
  console.error('Uso: node scripts/prepare-github-release-assets.cjs <pasta>')
  process.exit(1)
}

const root = path.resolve(dir)
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`Pasta inválida: ${root}`)
  process.exit(1)
}

const names = fs.readdirSync(root)
const renames = names
  .filter((name) => name.includes(' '))
  .map((name) => [name, name.replace(/ /g, '.')])
  // nomes longos primeiro (exe antes de path parcial)
  .sort((a, b) => b[0].length - a[0].length)

if (renames.length === 0) {
  console.log('ok  nenhum arquivo com espaço; GitHub assets já alinhados')
  process.exit(0)
}

for (const name of names.filter((n) => /\.ya?ml$/i.test(n))) {
  const file = path.join(root, name)
  let text = fs.readFileSync(file, 'utf8')
  const before = text
  for (const [from, to] of renames) {
    text = text.split(from).join(to)
  }
  if (text !== before) {
    fs.writeFileSync(file, text)
    console.log(`ok  manifesto atualizado: ${name}`)
  }
}

for (const [from, to] of renames) {
  const src = path.join(root, from)
  const dest = path.join(root, to)
  if (fs.existsSync(dest)) {
    console.error(`destino já existe: ${to}`)
    process.exit(1)
  }
  fs.renameSync(src, dest)
  console.log(`ok  renomeado: ${from} → ${to}`)
}

console.log('ok  artefatos prontos para GitHub Releases')
