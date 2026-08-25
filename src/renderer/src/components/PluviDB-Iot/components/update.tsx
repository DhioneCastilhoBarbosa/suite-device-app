import {
  ArrowsClockwise,
  CheckCircle,
  Circle,
  FolderOpen,
  HardDrives,
  WarningCircle,
  XCircle
} from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SerialManager } from '@renderer/utils/serialManager'
import { pluviFirmware } from '../PluviDBIot'
import { ModalUpdate } from '@renderer/components/modal/modalUpdate'
import { ModalSucess } from '@renderer/components/modal/modalSucces'
import { ModalFailUpdate } from '@renderer/components/modal/modalFailUpdate'
import { useTranslation } from 'react-i18next'

interface UpdateProps {
  isConect: boolean
}

type RecoveryState = 'idle' | 'checking' | 'ready' | 'failed'
type FlashState = 'idle' | 'in_progress' | 'done'

type LogEntry = {
  id: string
  ts: string
  key: string
  params?: Record<string, string | number>
}

const UPLOAD_LOG_ENTRY_ID = 'upload-progress'

function fileNameFromPath(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] ?? filePath
}

const disabledStepButtonClass =
  'cursor-not-allowed opacity-50 border-zinc-300 text-zinc-400 bg-zinc-50 hover:bg-zinc-50 hover:text-zinc-400 hover:border-zinc-300 disabled:cursor-not-allowed'

function formatLogTimestamp(): string {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const ms = String(now.getMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}:${ms}`
}

function StepItem({
  done,
  active,
  failed,
  label
}: {
  done: boolean
  active: boolean
  failed?: boolean
  label: string
}): JSX.Element {
  const className = done
    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
    : failed
      ? 'border-red-300 bg-red-50 text-red-700'
      : active
        ? 'border-sky-300 bg-sky-50 text-sky-700'
        : 'border-sky-100 bg-[#F7FBFF] text-zinc-400'

  const icon = done ? (
    <CheckCircle size={18} weight="fill" />
  ) : failed ? (
    <XCircle size={18} weight="fill" />
  ) : active ? (
    <WarningCircle size={18} />
  ) : (
    <Circle size={18} />
  )

  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${className}`}>
      {icon}
      <span>{label}</span>
    </div>
  )
}

export function Update({ isConect }: UpdateProps): JSX.Element {
  const { t, i18n } = useTranslation()
  const [recoveryState, setRecoveryState] = useState<RecoveryState>('idle')
  const [flashState, setFlashState] = useState<FlashState>('idle')
  const [firmwarePath, setFirmwarePath] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showProgress, setShowProgress] = useState(false)
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showModalSuccess, setShowModalSuccess] = useState(false)
  const [showModalFail, setShowModalFail] = useState(false)

  const logText = useMemo(
    () => logEntries.map((e) => `[${e.ts}] ${t(e.key, e.params)}\n`).join(''),
    [logEntries, i18n.language, t]
  )

  const portName = pluviFirmware.getPortName()
  const portConnected = isConect && pluviFirmware.isPortOpen()
  const recoveryReady = recoveryState === 'ready'
  const workflowLocked = busy || flashState === 'in_progress'

  const resetWorkflow = useCallback((): void => {
    setRecoveryState('idle')
    setFlashState('idle')
    setFirmwarePath(null)
    setShowProgress(false)
    setProgress(0)
    pluviFirmware.dispose()
    SerialManager.setIdle()
  }, [])

  const appendLogEntry = useCallback((key: string, params?: Record<string, string | number>) => {
    const ts = formatLogTimestamp()
    setLogEntries((prev) => [...prev, { id: `${ts}-${prev.length}`, ts, key, params }])
  }, [])

  const beginUploadLog = useCallback(() => {
    const ts = formatLogTimestamp()
    setLogEntries((prev) => [
      ...prev,
      { id: UPLOAD_LOG_ENTRY_ID, ts, key: 'Enviando...' }
    ])
  }, [])

  const updateUploadLog = useCallback((off: number, total: number) => {
    setLogEntries((prev) =>
      prev.map((entry) =>
        entry.id === UPLOAD_LOG_ENTRY_ID
          ? {
              ...entry,
              key:
                total > 0 ? 'Enviado {{off}}/{{total}} bytes...' : 'Enviando...',
              params: total > 0 ? { off, total } : undefined
            }
          : entry
      )
    )
  }, [])

  useEffect(() => {
    return () => {
      pluviFirmware.dispose()
      SerialManager.setIdle()
    }
  }, [])

  const handleCheckRecovery = async (): Promise<void> => {
    if (!portConnected || workflowLocked || recoveryState === 'checking') return

    setBusy(true)
    setRecoveryState('checking')
    setFirmwarePath(null)
    setFlashState('idle')
    setShowProgress(false)
    setProgress(0)
    appendLogEntry('Verificando modo recovery na conexão existente...')

    try {
      SerialManager.setBusy()
      const result = await pluviFirmware.checkRecovery()
      if (result.ok) {
        setRecoveryState('ready')
        appendLogEntry('Dispositivo em modo recovery — pronto para atualizar')
      } else {
        setRecoveryState('failed')
        setFirmwarePath(null)
        if (result.reason === 'serial_io') {
          appendLogEntry(
            'Falha de I/O serial (flush/drain) ao verificar recovery — a porta permanece aberta'
          )
          appendLogEntry('Detalhe: {{detail}}', { detail: result.detail })
          appendLogEntry('Tente Verificar recovery novamente')
        } else if (result.reason === 'timeout') {
          appendLogEntry('Timeout — a placa não respondeu ao probe mcumgr')
          appendLogEntry('Detalhe: {{detail}}', { detail: result.detail })
          appendLogEntry(
            'Coloque a placa em recovery e clique novamente em Verificar recovery'
          )
        } else if (result.reason === 'port_closed') {
          appendLogEntry('Porta serial não está aberta.')
          appendLogEntry('Detalhe: {{detail}}', { detail: result.detail })
        } else {
          appendLogEntry(
            'Conexão serial OK — a placa não está em modo recovery/bootloader'
          )
          appendLogEntry('Detalhe: {{detail}}', { detail: result.detail })
          appendLogEntry(
            'Coloque a placa em recovery e clique novamente em Verificar recovery'
          )
        }
        pluviFirmware.dispose()
        SerialManager.setIdle()
      }
    } catch (err) {
      setRecoveryState('failed')
      setFirmwarePath(null)
      appendLogEntry('Erro ao verificar recovery: {{detail}}', {
        detail: err instanceof Error ? err.message : String(err)
      })
      pluviFirmware.dispose()
      SerialManager.setIdle()
    } finally {
      setBusy(false)
    }
  }

  const handleSelectFile = async (): Promise<void> => {
    if (!recoveryReady || workflowLocked) return

    const result = await window.pluvidbUpdater.selectFile()
    if (result.canceled) return
    if (!result.success || !result.filePath) {
      appendLogEntry('Erro ao selecionar arquivo: {{detail}}', {
        detail: result.error ?? ''
      })
      return
    }

    setFirmwarePath(result.filePath)
    setFlashState('idle')
    appendLogEntry('Firmware selecionado: {{name}}', {
      name: fileNameFromPath(result.filePath)
    })
  }

  const handleFlash = async (): Promise<void> => {
    if (!recoveryReady || !firmwarePath || workflowLocked) return

    setBusy(true)
    setFlashState('in_progress')
    setShowProgress(true)
    setProgress(0)
    appendLogEntry('Iniciando upload do firmware...')
    beginUploadLog()

    try {
      await pluviFirmware.upload(firmwarePath, (off, total) => {
        const percent = total > 0 ? Math.min(100, Math.round((off / total) * 100)) : 0
        setProgress(percent)
        updateUploadLog(off, total)
      })

      appendLogEntry('Upload concluído!')
      await pluviFirmware.reset()
      appendLogEntry('Dispositivo reiniciado')

      setShowProgress(false)
      setProgress(0)
      setFlashState('done')
      setShowModalSuccess(true)
    } catch (err) {
      appendLogEntry('Erro no upload: {{detail}}', {
        detail: err instanceof Error ? err.message : String(err)
      })
      setShowProgress(false)
      setFlashState('idle')
      setShowModalFail(true)
    } finally {
      pluviFirmware.dispose()
      SerialManager.setIdle()
      setBusy(false)
    }
  }

  const handleConfirmUpdate = (): void => {
    setShowModal(false)
    void handleFlash()
  }

  const handleCloseModals = (): void => {
    setShowModalSuccess(false)
    setShowModalFail(false)
    setLogEntries([])
    resetWorkflow()
  }

  const canVerifyRecovery = portConnected && !workflowLocked && recoveryState !== 'checking'
  const canSelectFile = recoveryReady && !workflowLocked && flashState !== 'done'
  const canFlash = recoveryReady && Boolean(firmwarePath) && !workflowLocked && flashState !== 'done'

  if (!isConect) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
        <HardDrives size={48} className="mb-4 text-sky-300" />
        <p className="text-sm">
          {t('Conecte o dispositivo pela porta COM no painel lateral para atualizar o firmware.')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-2 pb-6">
      <div className="overflow-hidden rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white shadow-sm">
        <div className="border-b border-sky-600 bg-sky-500 px-3 py-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-white">
            {t('Atualização de Firmware')}
          </span>
        </div>
        <div className="flex flex-col gap-4 p-4">
          <p className="text-xs leading-relaxed text-zinc-500">
            {t(
              'Utiliza a conexão serial já aberta. Coloque o dispositivo em modo recovery/bootloader e conclua cada etapa em ordem.'
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <StepItem done={portConnected} active={!portConnected} label={t('Conexão serial')} />
            <StepItem
              done={recoveryReady || flashState === 'done'}
              failed={recoveryState === 'failed'}
              active={
                portConnected &&
                recoveryState !== 'ready' &&
                recoveryState !== 'failed' &&
                flashState !== 'done'
              }
              label={t('Modo recovery')}
            />
            <StepItem
              done={Boolean(firmwarePath) || flashState === 'done'}
              active={recoveryReady && !firmwarePath && flashState !== 'done'}
              label={t('Arquivo .dblos')}
            />
            <StepItem
              done={flashState === 'done'}
              active={canFlash && flashState === 'idle'}
              label={t('Gravação')}
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex flex-col min-w-[140px]">
              <span className="text-zinc-400 text-xs">{t('Porta COM')}</span>
              <span className="font-semibold text-zinc-700">{portName ?? '—'}</span>
            </div>
            <div className="flex flex-col min-w-[140px]">
              <span className="text-zinc-400 text-xs">{t('Status da conexão')}</span>
              <span
                className={`font-semibold ${portConnected ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {portConnected ? t('Conectado') : t('Desconectado')}
              </span>
            </div>
            {firmwarePath && (
              <div className="flex flex-col flex-1 min-w-[200px]">
                <span className="text-zinc-400 text-xs">{t('Firmware')}</span>
                <span className="font-semibold text-zinc-700 truncate">
                  {fileNameFromPath(firmwarePath)}
                </span>
              </div>
            )}
          </div>

          {showProgress && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{t('Progresso')}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-sky-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-wide text-sky-700">{t('Log')}</span>
            <textarea
              className="h-28 resize-none whitespace-pre-wrap rounded-md border border-sky-200 bg-white px-3 py-2 font-mono text-xs leading-relaxed text-zinc-700 outline-none focus:border-sky-400"
              value={logText}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t border-sky-100 pt-3">
        <Button
          size="medium"
          className="shrink-0"
          onClick={() => void handleCheckRecovery()}
          disabled={!canVerifyRecovery}
        >
          <WarningCircle size={20} />
          {recoveryState === 'checking' ? t('Verificando...') : t('Verificar recovery')}
        </Button>
        <Button
          size="large"
          className={!canSelectFile ? disabledStepButtonClass : 'shrink-0'}
          onClick={() => void handleSelectFile()}
          disabled={!canSelectFile}
          title={
            !recoveryReady
              ? t('Verifique o modo recovery antes de selecionar o arquivo')
              : undefined
          }
        >
          <FolderOpen size={20} />
          {t('Selecionar arquivo')}
        </Button>
        <Button
          size="medium"
          className={!canFlash ? disabledStepButtonClass : 'shrink-0'}
          onClick={() => setShowModal(true)}
          disabled={!canFlash}
          title={
            !firmwarePath
              ? t('Selecione o arquivo de firmware antes de atualizar')
              : undefined
          }
        >
          <ArrowsClockwise size={20} />
          {t('Atualizar')}
        </Button>
      </div>

      <ModalUpdate
        show={showModal}
        onUpdate={handleConfirmUpdate}
        onClose={() => setShowModal(false)}
      />
      <ModalSucess show={showModalSuccess} onClose={handleCloseModals} />
      <ModalFailUpdate show={showModalFail} onClose={handleCloseModals} />
    </div>
  )
}
