function validateFeedUrl(value) {
  if (typeof value !== 'string') {
    throw new Error('UPDATE_SERVER_URL precisa ser uma URL https.')
  }

  const trimmed = value.trim().replace(/\/+$/, '')
  let parsed
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('UPDATE_SERVER_URL precisa ser uma URL https.')
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('UPDATE_SERVER_URL precisa usar https.')
  }
  if (!parsed.hostname || parsed.username || parsed.password) {
    throw new Error('UPDATE_SERVER_URL não pode incluir credenciais.')
  }
  if (parsed.hostname === 'github.com' || parsed.hostname.endsWith('.github.com')) {
    throw new Error('O feed embutido não usa GitHub Releases (provider generic).')
  }
  if (!parsed.pathname || parsed.pathname === '/') {
    throw new Error('UPDATE_SERVER_URL precisa incluir o caminho da aplicação e do canal.')
  }
  if (parsed.pathname.includes('..')) {
    throw new Error('UPDATE_SERVER_URL contém um caminho inválido.')
  }

  const parts = parsed.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  if (parts.length < 2) {
    throw new Error('UPDATE_SERVER_URL precisa incluir o slug e o canal (ex.: /suite-device-app/stable).')
  }
  const channel = parts[parts.length - 1]
  if (channel !== 'stable' && channel !== 'beta') {
    throw new Error('UPDATE_SERVER_URL deve terminar em /stable ou /beta.')
  }

  return trimmed
}

module.exports = { validateFeedUrl }
