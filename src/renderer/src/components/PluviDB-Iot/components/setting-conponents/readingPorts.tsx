import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useState } from 'react'

export function ReadingPorts(): JSX.Element {
  const [selectedPort1, setSelectedPort1] = useState('Anual')
  const [selectedPort2, setSelectedPort2] = useState('Anual')
  return (
    <div className="flex flex-col gap-2 p-2 mt-4 mb-4">
      <div className="flex-1 rounded-md border-[1px] border-gray-200 ">
        <span className="w-full bg-gray-300  block pl-2">Pulso 1</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2 h-14">
            <span>Nome da Porta:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
            <span>Reset:</span>
            <select
              value={selectedPort1}
              onChange={(e) => setSelectedPort1(e.target.value)}
              className="mr-2 block  p-1 border rounded-md bg-white text-gray-700 shadow-sm focus:ring focus:ring-blue-300 w-24"
            >
              <option value="" disabled></option>
              <option value="Anual">Anual</option>
              <option value="Mensal">Mensal</option>
              <option value="diario">Diario</option>
            </select>
          </div>

          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Resolução:</span>
            <input type="number" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-md border-[1px] border-gray-200 ">
        <span className="w-full bg-gray-300  block pl-2">Pulso 2</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2 h-14">
            <span>Nome da Porta:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
            <span>Reset:</span>
            <select
              value={selectedPort2}
              onChange={(e) => setSelectedPort2(e.target.value)}
              className="mr-2 block  p-1 border rounded-md bg-white text-gray-700 shadow-sm focus:ring focus:ring-blue-300 w-24"
            >
              <option value="" disabled></option>
              <option value="Anual">Anual</option>
              <option value="Mensal">Mensal</option>
              <option value="diario">Diario</option>
            </select>
          </div>

          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Resolução:</span>
            <input type="number" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-md border-[1px] border-gray-200 pb-2">
        <span className="w-full bg-gray-300  block pl-2">SDI-12</span>
        <div className="flex flex-col justify-center items-start gap-3 m-2">
          <div className="flex flex-row gap-3 justify-center items-center">
            <span>Endereço:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
          <div className="flex flex-row gap-3 justify-center items-center">
            <span>Numero de campos:</span>
            <input type="number" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
          <div className="flex flex-row gap-3 justify-center items-center">
            <span>Rótulos das leituras:</span>
            <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4 border-t-[1px] border-gray-200 pt-4 gap-4">
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
