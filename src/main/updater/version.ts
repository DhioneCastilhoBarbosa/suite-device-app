const VERSION_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/

interface ParsedVersion {
  core: [number, number, number]
  pre: string | null
}

export function parseVersion(value: string): ParsedVersion {
  const match = VERSION_RE.exec(value.trim())
  if (!match) {
    throw new Error(`Versão SemVer inválida: ${value}`)
  }
  return {
    core: [Number(match[1]), Number(match[2]), Number(match[3])],
    pre: match[4] ?? null
  }
}

/** Retorna negativo se left < right, zero se iguais, positivo se left > right. */
export function compareVersions(left: string, right: string): number {
  const a = parseVersion(left)
  const b = parseVersion(right)
  for (let index = 0; index < 3; index += 1) {
    if (a.core[index] !== b.core[index]) {
      return a.core[index] < b.core[index] ? -1 : 1
    }
  }
  if (a.pre === b.pre) return 0
  if (a.pre === null) return 1
  if (b.pre === null) return -1
  if (a.pre < b.pre) return -1
  if (a.pre > b.pre) return 1
  return 0
}
