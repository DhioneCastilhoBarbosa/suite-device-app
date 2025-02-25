import { UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useState } from 'react'

export function Report(): JSX.Element {
  const options = [
    'Pulso1',
    'Pulso2',
    'Geolocalização',
    'Bateria',
    'Sinal',
    'Motivo da transmissão',
    'SDI-12'
  ]
  const [switches, setSwitches] = useState(
    options.reduce((acc, option) => ({ ...acc, [option]: false }), {})
  )
  const toggleSwitch = (option: string) => {
    setSwitches((prev) => ({
      ...prev,
      [option]: !prev[option]
    }))
    console.log(`Switch ${option} está: ${!switches[option] ? 'Ligado' : 'Desligado'}`)
  }
  return (
    <div className="mt-2 flex flex-col gap-2">
      <ul className="space-y-2">
        {options.map((option) => (
          <li key={option} className="flex items-center justify-between">
            <span>{option}</span>
            <button
              onClick={() => toggleSwitch(option)}
              className={`relative w-12 h-6 flex items-center rounded-full transition-colors ${
                switches[option] ? 'bg-sky-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  switches[option] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-end mt-6 border-t-[1px] border-gray-200 pt-4">
        <Button>
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
