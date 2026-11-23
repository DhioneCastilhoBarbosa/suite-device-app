import { ArrowsClockwise, FolderOpen } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useRef, useState } from 'react'
import { selectFile } from '@renderer/utils/fileUtils'
import { atualizaFirmware } from '@renderer/utils/updateFirmware'
import { Device } from '../../Context/DeviceContext'
import { ModalUpdate } from '../modal/modalUpdate'
import { ModalSucess } from '../modal/modalSucces'
import { ModalFailUpdate } from '../modal/modalFailUpdate'
import { SerialManager } from '@renderer/utils/serialManager'
import { t } from 'i18next'

function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  if (minutes === 0) return `${rest} s`
  return `${minutes} min ${rest.toString().padStart(2, '0')} s`
}

export default function UpdateModubus() {
  const [fileContent, setFileContent] = useState<string>('')
  const [enable, setEnable] = useState<boolean>(true)
  const { port, SetPortOpen, setResetUpdate }: any = Device()
  const [baudRateSelect, setBaudRateSelect] = useState<number>(57600)
  const [showModal, setShowModal] = useState(false)
  const [showModalSucess, setShowModalSucess] = useState(false)
  const [showModalFail, setShowModalFail] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [elapsedLabel, setElapsedLabel] = useState('')
  const [updating, setUpdating] = useState(false)
  const startedAt = useRef<number | null>(null)

  const handleSelectFile = () => {
    const handleFileContentLoad = (content: string) => {
      setFileContent(content)
    }
    setEnable(false)
    selectFile(handleFileContentLoad, 'dblos')
  }

  const synced = () => {
    startedAt.current = Date.now()
    setUpdating(true)
    setProgress(0)
    setElapsedLabel('0 s')
    setStatus(
      (status) =>
        status +
        t('Sincronização com o sensor concluída!\nAtualização em andamento, aguarde... \n') +
        t('Recebendo arquivo...') +
        '\n'
    )
  }

  const fail = () => {
    startedAt.current = null
    setUpdating(false)
    setStatus((status) => status + t('Erro durante a atualização. \n'))
    setShowModalFail(true)
    SerialManager.setIdle()
  }

  const finished = (seconds: number) => {
    const time = formatDuration(seconds)
    startedAt.current = null
    setUpdating(false)
    setProgress(100)
    setElapsedLabel(time)
    setStatus(
      (status) =>
        status +
        t('Atualização concluída com sucesso! \n') +
        t('Tempo da atualização: {{time}}', { time }) +
        '\n'
    )
    setShowModalSucess(true)
    SerialManager.setIdle()
  }

  const handleUpdate = () => {
    SerialManager.setBusy()
    startedAt.current = null
    setUpdating(false)
    setProgress(null)
    setElapsedLabel('')
    setStatus(t('Aguardando sincronizar com o sensor... \n'))
    setShowModal(false)
    atualizaFirmware({
      file: fileContent,
      portName: port.name,
      baudRate: baudRateSelect,
      synced,
      fail,
      finished,
      onProgress: setProgress
    })
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const handleCloseModal = () => {
    setShowModalSucess(false)
    SetPortOpen({ state: false })
    setResetUpdate({ state: true })
    setShowModalFail(false)
    setFileContent('')
  }

  const openModal = () => {
    setShowModal(true)
  }

  const handleBaudSelect = (event) => {
    setBaudRateSelect(parseInt(event.target.value))
  }

  useEffect(() => {
    if (!updating) return
    const timer = window.setInterval(() => {
      if (startedAt.current == null) return
      setElapsedLabel(formatDuration((Date.now() - startedAt.current) / 1000))
    }, 500)
    return () => window.clearInterval(timer)
  }, [updating])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 sm:px-6">
      <div className="rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white p-4 shadow-sm">
        {progress !== null && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-zinc-700">
              <span>
                {progress >= 100
                  ? t('Atualização concluída com sucesso! \n').trim()
                  : t('Recebendo arquivo...')}
              </span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {elapsedLabel ? (
              <p className="mt-1 text-xs text-zinc-500">
                {progress >= 100
                  ? t('Tempo da atualização: {{time}}', { time: elapsedLabel })
                  : elapsedLabel}
              </p>
            ) : null}
          </div>
        )}

        <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {t('Status')}
        </label>
        <textarea
          className="mt-2 h-36 w-full resize-none whitespace-pre-wrap rounded-md border border-sky-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-700 outline-none focus:border-sky-400"
          value={status}
          readOnly
        />

        <div className="mt-4 flex w-fit flex-col gap-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            {t('Baud rate')}
          </label>
          <select
            onChange={handleBaudSelect}
            value={baudRateSelect}
            className="h-9 w-auto min-w-[5.5rem] rounded-md border border-sky-200 bg-white px-2 text-sm text-sky-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
          >
            <option value="115200">115200</option>
            <option value="57600">57600</option>
            <option value="9600">9600</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-row flex-wrap justify-end gap-3">
        <Button size="large" onClick={handleSelectFile} disabled={updating}>
          <FolderOpen size={22} />
          {t('Selecionar arquivo')}
        </Button>
        <Button size="large" onClick={openModal} disabled={enable || updating}>
          <ArrowsClockwise size={22} />
          {t('Atualizar')}
        </Button>
      </div>

      <ModalUpdate show={showModal} onUpdate={handleUpdate} onClose={handleClose} />
      <ModalSucess
        show={showModalSucess}
        onClose={handleCloseModal}
        detail={
          elapsedLabel ? t('Tempo da atualização: {{time}}', { time: elapsedLabel }) : undefined
        }
      />
      <ModalFailUpdate show={showModalFail} onClose={handleCloseModal} />
    </div>
  )
}
