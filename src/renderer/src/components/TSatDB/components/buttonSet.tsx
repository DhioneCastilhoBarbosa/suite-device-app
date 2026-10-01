import Button from '@renderer/components/button/Button'
import { t } from 'i18next'

import {
  FolderOpen,
  FloppyDisk,
  UploadSimple,
  ArrowCounterClockwise,
  ArrowsClockwise,
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
      <div className="mt-1 flex w-full flex-row flex-wrap items-center justify-between gap-y-2 pb-2">
        <Button
          filled={false}
          size={'medium'}
          className="px-1 py-2 text-[11px]"
          onClick={handleClearFailSafe}
        >
          <Broom size={24} />
          {t('Limpar Failsafe')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="px-1 py-2 text-[11px]"
          onClick={handleRetornFactory}
        >
          <ArrowCounterClockwise size={24} />
          {t('Restaurar')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="px-1 py-2 text-[11px]"
          onClick={handleSelectFile}
        >
          <FolderOpen size={24} />
          {t('Selecionar Arquivo')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="px-1 py-2 text-[11px]"
          onClick={handleSaveToFile}
        >
          <FloppyDisk size={24} />
          {t('Salvar')}
        </Button>

        <Button
          filled={false}
          size={'medium'}
          onClick={handleDown}
          className="px-1 py-2 text-[11px]"
        >
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="px-1 py-2 text-[11px]"
          onClick={handleSend}
        >
          <UploadSimple size={24} />
          {t('Enviar configuração')}
        </Button>
      </div>
    </>
  )
}
