import Button from '@renderer/components/button/Button'
import { t } from 'i18next'

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
      <div className="flex flex-row justify-center gap-1 items-center  mb-8 ">
        <Button
          filled={false}
          size={'medium'}
          className="text-[11px] px-0 py-6"
          onClick={handleClearFailSafe}
        >
          <Broom size={24} />
          {t('Limpar Failsafe')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="text-[11px] px-0 py-6"
          onClick={handleRetornFactory}
        >
          <ArrowCounterClockwise size={24} />
          {t('Restaurar')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="text-[11px] px-0 py-6"
          onClick={handleSelectFile}
        >
          <FolderOpen size={24} />
          {t('Selecionar Arquivo')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="text-[11px] px-0 py-6"
          onClick={handleSaveToFile}
        >
          <FloppyDisk size={24} />
          {t('Salvar')}
        </Button>

        <Button
          filled={false}
          size={'medium'}
          onClick={handleDown}
          className="text-[11px] px-1 py-6"
        >
          <DownloadSimple size={24} />
          {t('Baixar informação')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="text-[11px] px-1 py-6"
          onClick={handleSend}
        >
          <UploadSimple size={24} />
          {t('Enviar configuração')}
        </Button>
      </div>
    </>
  )
}
