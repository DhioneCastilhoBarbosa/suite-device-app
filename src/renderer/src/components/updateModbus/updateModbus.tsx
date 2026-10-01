import { ArrowsClockwise, FolderOpen } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useState } from 'react'
import { selectFile } from '@renderer/utils/fileUtils'
import { atualizaFirmware } from '@renderer/utils/updateFirmware'
import { Device } from '../../Context/DeviceContext'
import { ModalUpdate } from '../modal/modalUpdate'
import { ModalSucess } from '../modal/modalSucces'
import { ModalFailUpdate } from '../modal/modalFailUpdate'
import { SerialManager } from '@renderer/utils/serialManager'
import { t } from 'i18next'

export default function UpdateModubus() {
  const [fileContent, setFileContent] = useState<string>('')
  const [enable, setEnable] = useState<boolean>(true)
  const { port, SetPortOpen, setResetUpdate }: any = Device()
  const [baudRateSelect, setBaudRateSelect] = useState<number>(57600)
  const [showModal, setShowModal] = useState(false)
  const [showModalSucess, setShowModalSucess] = useState(false)
  const [showModalFail, setShowModalFail] = useState(false)
  const [status, setStatus] = useState('')

  const handleSelectFile = () => {
    const handleFileContentLoad = (content: string) => {
      setFileContent(content)
    }
    setEnable(false)
    selectFile(handleFileContentLoad, 'dblos')
  }

  const synced = () => {
    setStatus(
      (status) =>
        status + t('Sincronização com o sensor concluída!\nAtualização em andamento, aguarde... \n')
    )
  }

  const fail = () => {
    setStatus((status) => status + t('Erro durante a atualização. \n'))
    setShowModalFail(true)
    SerialManager.setIdle()
  }

  const finished = () => {
    setStatus((status) => status + t('Atualização concluída com sucesso! \n'))
    setShowModalSucess(true)
    SerialManager.setIdle()
  }

  const handleUpdate = () => {
    SerialManager.setBusy()
    setStatus(t('Aguardando sincronizar com o sensor... \n'))
    setShowModal(false)
    atualizaFirmware({
      file: fileContent,
      portName: port.name,
      baudRate: baudRateSelect,
      synced,
      fail,
      finished
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
    // baudRateSelect
  }, [baudRateSelect])

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 sm:px-6">
      <div className="rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white p-4 shadow-sm">
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
        <Button size="large" onClick={handleSelectFile}>
          <FolderOpen size={22} />
          {t('Selecionar arquivo')}
        </Button>
        <Button size="large" onClick={openModal} disabled={enable}>
          <ArrowsClockwise size={22} />
          {t('Atualizar')}
        </Button>
      </div>

      <ModalUpdate show={showModal} onUpdate={handleUpdate} onClose={handleClose} />
      <ModalSucess show={showModalSucess} onClose={handleCloseModal} />
      <ModalFailUpdate show={showModalFail} onClose={handleCloseModal} />
    </div>
  )
}
