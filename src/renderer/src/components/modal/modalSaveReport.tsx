import { useEffect, useState } from 'react'
import Button from '../button/Button'
import { DownloadSimple, Spinner } from '@phosphor-icons/react'

interface ModalProps {
  show: boolean
  onClose: () => void
  limit: string
  handleSaveToFile: (value: number, all: boolean) => void
  isLoading: boolean
  isLoadingAll: boolean
}

export function ModalSaveReport({
  show,
  onClose,
  limit,
  handleSaveToFile,
  isLoading,
  isLoadingAll
}: ModalProps): JSX.Element | null {
  const [value, setValue] = useState<string>(limit)

  useEffect(() => {
    setValue(limit)
  }, [limit])

  if (!show) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = Math.min(parseInt(e.target.value, 10) || 0, Number(limit))
    setValue(newValue.toString())
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-auto text-center">
        <h2 className="text-xl font-bold mb-4">Baixar relatórios</h2>
        <p className="mb-2">
          Foram encontrados <span className="font-bold text-sky-600">{limit} </span> registros.
          Deseja baixar quantos registros?
        </p>
        <div className="flex flex-row justify-center items-baseline gap-2">
          <span>Selecione:</span>
          <input
            type="number"
            value={value}
            onChange={handleChange}
            className="border rounded p-2 w-36 mb-4 text-center focus:outline-sky-500"
            min={0}
            max={limit}
          />
        </div>
        <div className="flex justify-between mx-8 gap-2">
          <Button
            size="medium"
            filled={true}
            onClick={onClose}
            disabled={isLoading}
            className={'h-10'}
          >
            Cancelar
          </Button>

          <Button
            size="medium"
            filled={true}
            onClick={() => handleSaveToFile(Number(limit), true)}
            disabled={isLoadingAll}
            className={'h-10'}
          >
            <div className="flex flex-row justify-center items-center gap-2">
              {isLoadingAll ? (
                <Spinner size={20} className="animate-spin" />
              ) : (
                <DownloadSimple size={20} />
              )}
              <span>{isLoadingAll ? 'Baixando...' : 'Baixar todos'}</span>
            </div>
          </Button>

          <Button
            size="medium"
            filled={true}
            onClick={() => handleSaveToFile(Number(value), false)}
            disabled={isLoading}
            className={'h-10'}
          >
            <div className="flex flex-row justify-center items-center gap-2">
              {isLoading ? (
                <Spinner size={20} className="animate-spin" />
              ) : (
                <DownloadSimple size={20} />
              )}
              <span>{isLoading ? 'Baixando...' : 'Baixar selecionado'}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
