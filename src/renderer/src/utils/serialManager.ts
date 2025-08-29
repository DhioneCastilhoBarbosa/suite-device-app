const { ipcRenderer } = require('electron');

function now() { return new Date().toISOString() }
function log(...a:any[]) { console.log('[SERIAL:UTIL]', now(), ...a) }

export const SerialManager = {
  async snapshot(): Promise<string[]> {
    const t0 = performance.now()
    const res = await ipcRenderer.invoke('serial:snapshot')
    log('snapshot ←', Array.isArray(res) ? res.length : 'n/a', 'tempo(ms)=', (performance.now()-t0).toFixed(1))
    return res ?? []
  },

  onAdded(cb: (port:{path:string}) => void) {
    const h = (_:any, port:any) => {
      log('event serial:added ←', port)
      cb(port)
    }
    ipcRenderer.on('serial:added', h)
    log('listener onAdded registrado')
    return () => { ipcRenderer.removeListener('serial:added', h); log('listener onAdded removido') }
  },

  onRemoved(cb: (port:{path:string}) => void) {
    const h = (_:any, port:any) => {
      log('event serial:removed ←', port)
      cb(port)
    }
    ipcRenderer.on('serial:removed', h)
    log('listener onRemoved registrado')
    return () => { ipcRenderer.removeListener('serial:removed', h); log('listener onRemoved removido') }
  },

  onError(cb: (msg:string) => void) {
    const h = (_:any, msg:any) => {
      log('event serial:error ←', msg)
      cb(String(msg))
    }
    ipcRenderer.on('serial:error', h)
    log('listener onError registrado')
    return () => { ipcRenderer.removeListener('serial:error', h); log('listener onError removido') }
  },

  setBusy() { log('→ send serial:busy'); ipcRenderer.send('serial:busy') },
  setIdle() { log('→ send serial:idle'); ipcRenderer.send('serial:idle') },
}
