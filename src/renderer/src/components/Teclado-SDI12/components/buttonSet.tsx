import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { FolderOpen, FloppyDisk, Broom, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { selectFile } from '@renderer/utils/fileUtils'

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
    console.log(fileContent)
    handleFileInformations(fileContent)
  }, [fileContent])

  return (
    <>
      <div className="flex items-start justify-between  mt-8 mb-2 border-b-[1px] border-sky-500 mr-8 ml-8 "></div>
      <div className="flex flex-row justify-center gap-2 items-end mr-4 ml-4 mb-8 mt-8">
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
        <Button filled={false} size={'medium'} className="text-[12px] p-6" onClick={handleClear}>
          <Broom size={24} />
          Limpar
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
