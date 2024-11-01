import { ArrowsClockwise, FolderOpen } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useState } from 'react'
import { selectFile } from '@renderer/utils/fileUtils'
import { atualizaFirmware } from '@renderer/utils/updateFirmware'
import { Device } from '@renderer/Context/DeviceContext'
import { ModalUpdate } from '../modal/modalUpdate'
import { ModalSucess } from '../modal/modalSucces'
import { ModalFailUpdate } from '../modal/modalFailUpdate'

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
    //console.log("Sincronizado com o sensor concluida")
    setStatus(
      (status) =>
        status + 'Sincronizado com o sensor concluida!\nAtualização em andamento aguarde... \n'
    )
  }

  const fail = () => {
    //console.log('Erro durante a atualização')
    setStatus((status) => status + 'Erro durante a atualização. \n')
    setShowModalFail(true)
  }

  const finished = () => {
    setStatus((status) => status + 'Atualização concluida com sucesso! \n')
    //SetPortOpen({state:false})
    setShowModalSucess(true)
  }

  const handleUpdate = () => {
    setStatus('Aguardando sincronizar com o sensor... \n')
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
    //console.log(baudRateSelect)
  }, [baudRateSelect])

  return (
    <div className="flex flex-col items-center  w-full h-96 ">
      <div className="flex flex-col w-2/3 mt-8">
        <label>Status</label>
        <textarea
          className=" h-36 leading-relaxed border border-[2px] border-zinc-200 resize-none whitespace-pre-wrap outline-none text-black text-sm rounded-md pl-4 pt-4"
          value={status}
          readOnly
        />
        <label className="mt-4">BaudRate</label>
        <select
          onChange={handleBaudSelect}
          value={baudRateSelect}
          className="w-40 h-6 rounded-md border border-zinc-400"
        >
          <option value="115200">115200</option>
          <option value="57600">57600</option>
          <option value="9600">9600</option>
        </select>
      </div>
      <div className="flex flex-row gap-8 mt-10">
        <Button size={'large'} onClick={handleSelectFile}>
          <FolderOpen size={24} />
          Selecionar arquivo
        </Button>
        <Button size={'large'} onClick={openModal} disabled={enable}>
          <ArrowsClockwise size={24} />
          Atualizar
        </Button>
      </div>
      <ModalUpdate show={showModal} onUpdate={handleUpdate} onClose={handleClose} />
      <ModalSucess show={showModalSucess} onClose={handleCloseModal} />
      <ModalFailUpdate show={showModalFail} onClose={handleCloseModal} />
    </div>
  )
}
