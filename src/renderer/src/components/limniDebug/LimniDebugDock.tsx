import { useEffect, useRef, useState } from 'react'
import { t } from 'i18next'
import { Device } from '../../Context/DeviceContext'
import {
  clearLimniDebug,
  copyLimniDebug,
  getLimniDebugText,
  isLimniDebugOpen,
  saveLimniDebug,
  showsDiagnosticDock,
  setLimniDebugOpen,
  subscribeLimniDebug
} from '../../utils/limniDebug'

export default function LimniDebugDock(): JSX.Element | null {
  const { device }: any = Device()
  const [open, setOpen] = useState(isLimniDebugOpen())
  const [text, setText] = useState(getLimniDebugText())
  const [notice, setNotice] = useState('')
  const logRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    return subscribeLimniDebug(() => {
      setOpen(isLimniDebugOpen())
      setText(getLimniDebugText())
    })
  }, [])

  useEffect(() => {
    const el = logRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [text, open])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 1600)
    return () => window.clearTimeout(timer)
  }, [notice])

  if (!showsDiagnosticDock(device?.name) || !open) return null

  const copy = () => {
    if (copyLimniDebug()) setNotice(t('Copiado'))
  }

  const save = async () => {
    const result = await saveLimniDebug()
    if (result === 'downloads') setNotice(t('Salvo na pasta de downloads'))
    else if (result === 'chosen') setNotice(t('Salvo'))
  }

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[60] flex w-[min(22rem,36vw)] flex-col items-end gap-2">
      {open && (
        <section className="pointer-events-auto flex max-h-48 w-full flex-col overflow-hidden rounded-md border border-sky-200 bg-white shadow-lg">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-sky-100 px-2 py-1.5">
            <span className="text-xs font-semibold text-sky-800">{t('Diagnóstico')}</span>
            <button
              type="button"
              className="text-[11px] font-semibold text-zinc-500"
              onClick={() => setLimniDebugOpen(false)}
            >
              {t('Fechar')}
            </button>
          </div>
          <pre
            ref={logRef}
            className="app-scroll min-h-24 flex-1 overflow-auto whitespace-pre px-2 py-1.5 font-mono text-[11px] leading-relaxed text-zinc-800"
          >
            {text || t('Nenhum evento ainda.')}
          </pre>
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-t border-sky-100 px-2 py-1.5">
            <button
              type="button"
              className="rounded bg-[#1769A0] px-2 py-1 text-[11px] font-semibold text-white"
              onClick={copy}
            >
              {t('Copiar')}
            </button>
            <button
              type="button"
              className="rounded border border-[#1769A0] px-2 py-1 text-[11px] font-semibold text-[#1769A0]"
              onClick={() => void save()}
            >
              {t('Salvar arquivo')}
            </button>
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-1 text-[11px] font-semibold text-zinc-600"
              onClick={() => clearLimniDebug()}
            >
              {t('Limpar')}
            </button>
            {notice ? <span className="text-[11px] font-semibold text-green-700">{notice}</span> : null}
          </div>
        </section>
      )}
    </div>
  )
}
