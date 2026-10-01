import { Broom, PaperPlaneTilt } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useRef, useState } from 'react'
import { t } from 'i18next'

const TEST_CHANNEL = '195'

function responseLineClass(line: string): string {
  const text = line.trim().toLowerCase()
  if (text === 'ok') return 'font-semibold text-emerald-700'
  if (text.includes('bad parameter') || text.includes('must be enabled') || text.includes('error')) {
    return 'font-semibold text-red-600'
  }
  return 'text-zinc-700'
}

type TestLogEntry = { kind: 'sent' | 'response' | 'info'; text: string }

type Props = {
  savedPlatformId: string
  log: TestLogEntry[]
  busy: boolean
  status: string
  secondsLeft: number | null
  onSend: (platformId: string, channel: string, message: string) => void
  onClearLog: () => void
}

export function TransmissionTest({
  savedPlatformId,
  log,
  busy,
  status,
  secondsLeft,
  onSend,
  onClearLog
}: Props): JSX.Element {
  const [platformId, setPlatformId] = useState(savedPlatformId)
  const [message, setMessage] = useState('')
  const platformTouched = useRef(false)
  const logRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!platformTouched.current && savedPlatformId) setPlatformId(savedPlatformId)
  }, [savedPlatformId])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [log])

  function handleSend(): void {
    if (!platformId.trim() || !message.trim()) return
    onSend(platformId.trim(), TEST_CHANNEL, message.trim())
  }

  const fieldClass =
    'h-7 w-28 rounded-md border border-gray-500 px-2 text-center disabled:bg-zinc-100'

  return (
    <div className="mb-4 mt-6 flex w-full min-w-0 flex-col gap-4">
      <div className="flex flex-row flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <label>{t('ID da plataforma')}</label>
          <input
            className={fieldClass}
            type="text"
            value={platformId}
            disabled={busy}
            onChange={(e) => {
              platformTouched.current = true
              setPlatformId(e.target.value)
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>{t('Número do canal da transmissão')}</label>
          <input
            className="h-7 w-28 rounded-md border border-gray-300 bg-zinc-100 px-2 text-center text-zinc-600"
            type="text"
            value={TEST_CHANNEL}
            readOnly
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>{t('Mensagem a ser transmitida')}</label>
          <input
            className="h-7 w-96 max-w-full rounded-md border border-gray-500 px-2 text-left disabled:bg-zinc-100"
            type="text"
            value={message}
            disabled={busy}
            placeholder={t('Digite a mensagem a ser transmitida')}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      {(status || secondsLeft !== null) && (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
          {secondsLeft !== null && (
            <div className="font-semibold">
              {t('Tempo restante')}: {secondsLeft} s
            </div>
          )}
          {status && <div>{status}</div>}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-semibold">{t('Terminal de visualização')}</label>
        <div
          ref={logRef}
          className="h-40 w-full overflow-y-auto rounded-md border border-sky-500 bg-white p-2 font-mono text-sm"
        >
          {log.map((entry, index) =>
            entry.kind === 'sent' ? (
              <div key={index} className="mt-2 font-semibold text-sky-700 first:mt-0">
                {'TX=> '}
                {entry.text}
              </div>
            ) : entry.kind === 'info' ? (
              <div key={index} className="mt-1 text-amber-700">
                {entry.text}
              </div>
            ) : (
              <div key={index}>
                {entry.text.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className={responseLineClass(line)}>
                    {'RX=> '}
                    {line}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex flex-row items-center justify-end gap-2">
        <Button filled={false} size="medium" disabled={busy} onClick={onClearLog}>
          <Broom size={16} />
          {t('Limpar')}
        </Button>
        <Button filled size="medium" disabled={busy} onClick={handleSend}>
          <PaperPlaneTilt size={16} />
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
