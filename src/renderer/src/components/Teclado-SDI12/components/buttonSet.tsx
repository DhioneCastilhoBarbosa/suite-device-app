import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { FolderOpen, FloppyDisk, Broom, DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import SerialManagerRS232 from '@renderer/utils/serial'

const serialManagerRS232 = new SerialManagerRS232()
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type

interface SendProps {
  handleDownInformation: (newValue: string) => void
  handleClearInformation: (newValue: boolean) => void
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function ButtonSet({ handleDownInformation, handleClearInformation }: SendProps) {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleDown() {
    handleDownInformation('!POLL%')
  }

  function handleClear() {
    handleClearInformation(true)
  }
  return (
    <>
      <div className="flex items-start justify-between  mt-8 mb-2 border-b-[1px] border-sky-500 mr-8 ml-8 "></div>
      <div className="flex flex-row justify-center gap-2 items-end mr-4 ml-4 mb-8 mt-8">
        <Button filled={false} size={'medium'} className="text-[12px] p-6">
          <FolderOpen size={36} />
          Selecionar o Arquivo
        </Button>
        <Button filled={false} size={'medium'} className="text-[12px] p-6">
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
        <Button filled={false} size={'medium'} className="text-[12px] p-6">
          <UploadSimple size={24} />
          Enviar configuração
        </Button>
      </div>
    </>
  )
}
