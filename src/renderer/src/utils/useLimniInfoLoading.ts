import { useEffect, useRef } from 'react'
import { limniLog } from './limniDebug'

export function useLimniInfoLoading(isLoading: boolean, offline: boolean, portOpen: boolean): void {
  const loggedOpen = useRef(false)

  useEffect(() => {
    if (loggedOpen.current) return
    loggedOpen.current = true
    limniLog(`tela aberta: PortOpen=${portOpen} mode.state=${offline} isLoading=${isLoading}`)
  }, [isLoading, offline, portOpen])

  useEffect(() => {
    if (!isLoading || offline) return
    const timer = window.setTimeout(() => {
      limniLog('Atualizar continua desabilitado porque a leitura não terminou')
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [isLoading, offline])
}
