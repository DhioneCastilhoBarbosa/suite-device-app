import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { FolderOpen, FloppyDisk, Broom, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { selectFile } from '@renderer/utils/fileUtils'
import { t } from 'i18next'

interface SendProps {
  handleDownInformation: (newValue: string) => void
  handleClearInformation: (newValue: boolean) => void
  handleFileInformations: (newValue: string) => void
  handleSaveInformation: () => void
  handleSendInformation: () => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function ButtonSet({
  handleDownInformation,
  handleClearInformation,
  handleFileInformations,
  handleSaveInformation,
  handleSendInformation
}: SendProps) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const [fileContent, setFileContent] = useState('')

  function handleDown() {
    handleDownInformation('!POLL%')
  }
  function handleClear() {
    handleClearInformation(true)
  }

  function handleSaveToFile() {
    handleSaveInformation()
  }

  function handleSend() {
    handleSendInformation()
  }

  const handleSelectFile = () => {
    const handleFileContentLoad = (content: string) => {
      setFileContent(content)
    }
    selectFile(handleFileContentLoad, 'txt')
  }

  useEffect(() => {
    handleFileInformations(fileContent)
  }, [fileContent])

  return (
    <>
      <div className="mx-8 mt-8 mb-2 border-b border-sky-500"></div>
      <div className="mx-8 mb-4 mt-5 flex flex-row flex-wrap items-stretch justify-between gap-2">
        <Button
          filled={false}
          size={'medium'}
          className="h-12 min-h-12 px-2 py-2 text-[12px] leading-tight"
          onClick={handleDown}
        >
          <DownloadSimple size={24} />
          {t('Baixar informação')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="h-12 min-h-12 px-2 py-2 text-[12px] leading-tight"
          onClick={handleSelectFile}
        >
          <FolderOpen size={24} />
          {t('Selecionar o Arquivo')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="h-12 min-h-12 px-2 py-2 text-[12px] leading-tight"
          onClick={handleSaveToFile}
        >
          <FloppyDisk size={24} />
          {t('Salvar')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="h-12 min-h-12 px-2 py-2 text-[12px] leading-tight"
          onClick={handleSend}
        >
          <UploadSimple size={24} />
          {t('Enviar configuração')}
        </Button>
        <Button
          filled={false}
          size={'medium'}
          className="h-12 min-h-12 px-2 py-2 text-[12px] leading-tight"
          onClick={handleClear}
        >
          <Broom size={24} />
          {t('Limpar')}
        </Button>
      </div>
    </>
  )
}
