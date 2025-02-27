import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useState } from 'react'

export function General(): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled)
    console.log('Switch está:', !isEnabled ? 'Ligado' : 'Desligado')
  }
  return (
    <div className="flex flex-col gap-4 p-2 mt-4 mb-4">
      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">Dispositivo</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Nome do dispositivo:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">Geolocalização</span>
        <div className="flex flex-col justify-center items-center ">
          <div className="flex flex-row justify-between items-center gap-3 m-2 w-64">
            <span>Latitude:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2 w-64">
            <span>Longitude:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2 w-64">
            <span>Altura:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">Data e hora</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Usar hora UTC:</span>
            <button
              onClick={toggleSwitch}
              className={`relative w-12 h-6 flex items-center rounded-full transition-colors ${
                isEnabled ? 'bg-sky-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Time zone:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 border-t-[1px] border-gray-200 pt-4 w-full gap-4">
        <Button>
          <ArrowsClockwise size={24} />
          Atualizar
        </Button>
        <Button>
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
