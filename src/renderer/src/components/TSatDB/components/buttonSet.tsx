import Button from '@renderer/components/button/Button'

import {
  FolderOpen,
  FloppyDisk,
  DownloadSimple,
  UploadSimple,
  ArrowCounterClockwise,
  Broom
} from '@phosphor-icons/react'

interface SendProps {
  handleDownInformation: () => void
  handleRetornSettingsFactory: () => void
  handleFileInformations: () => void
  handleSaveInformation: () => void
  handleSendInformation: () => void
  ClearFailSafe: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function ButtonSet({
  handleDownInformation,
  handleRetornSettingsFactory,
  handleFileInformations,
  handleSaveInformation,
  handleSendInformation,
  ClearFailSafe
}: SendProps) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type

  function handleClearFailSafe(): void {
    ClearFailSafe()
  }
  function handleDown(): void {
    handleDownInformation()
  }
  function handleRetornFactory(): void {
    handleRetornSettingsFactory()
  }

  function handleSaveToFile(): void {
    handleSaveInformation()
  }

  function handleSend(): void {
    handleSendInformation()
  }

  function handleSelectFile(): void {
    handleFileInformations()
  }
  return (
    <>
      <div className="flex items-start justify-between  mb-2 border-b-[1px] border-sky-500  "></div>
      <div className="flex flex-row justify-center gap-2 items-end  mb-8 ">
        <Button
          filled={false}
          size={'medium'}
          className="text-[12px] p-6"
          onClick={handleClearFailSafe}
        >
          <Broom size={24} />
          Limpar Failsafe
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="text-[12px] p-6"
          onClick={handleRetornFactory}
        >
          <ArrowCounterClockwise size={24} />
          Restaurar
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="text-[12px] p-6"
          onClick={handleSelectFile}
        >
          <FolderOpen size={36} />
          Selecionar o Arquivo
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="text-[12px] p-6"
          onClick={handleSaveToFile}
        >
          <FloppyDisk size={24} />
          Salvar
        </Button>

        <Button filled={false} size={'medium'} onClick={handleDown} className="text-[12px] p-6">
          <DownloadSimple size={24} />
          Baixar informação
        </Button>
        <Button filled={false} size={'medium'} className="text-[12px] p-6" onClick={handleSend}>
          <UploadSimple size={24} />
          Enviar configuração
        </Button>
      </div>
    </>
  )
}
