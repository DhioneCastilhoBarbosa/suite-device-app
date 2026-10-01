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

  const actionClass =
    'flex min-h-[3.25rem] min-w-[7rem] flex-col gap-0.5 px-2.5 py-1.5 text-[11px] leading-tight'

  return (
    <>
      <div className="mb-2 flex items-start justify-between border-b border-sky-200"></div>
      <div className="mb-8 flex flex-row flex-wrap items-stretch justify-center gap-2 px-2">
        <Button filled={false} size="medium" className={actionClass} onClick={handleClearFailSafe}>
          <Broom size={18} />
          {t('Limpar Failsafe')}
        </Button>
        <Button filled={false} size="medium" className={actionClass} onClick={handleRetornFactory}>
          <ArrowCounterClockwise size={18} />
          {t('Restaurar')}
        </Button>
        <Button filled={false} size="medium" className={actionClass} onClick={handleSelectFile}>
          <FolderOpen size={18} />
          {t('Selecionar Arquivo')}
        </Button>
        <Button filled={false} size="medium" className={actionClass} onClick={handleSaveToFile}>
          <FloppyDisk size={18} />
          {t('Salvar')}
        </Button>
        <Button filled={false} size="medium" className={actionClass} onClick={handleDown}>
          <DownloadSimple size={18} />
          {t('Baixar informação')}
        </Button>
        <Button filled={false} size="medium" className={actionClass} onClick={handleSend}>
          <UploadSimple size={18} />
          {t('Enviar configuração')}
        </Button>
      </div>
    </>
  )
}
