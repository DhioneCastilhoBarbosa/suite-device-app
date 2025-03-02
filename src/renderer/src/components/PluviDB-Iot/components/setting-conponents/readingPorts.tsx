import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'

type Props = {
  handleUpdateSettingsPort: () => void
  handleSendSettingsPort: (settings: string[]) => void
  receivedPortP1: string | undefined
  receivedPortP2: string | undefined
  receivedPortSdi: string | undefined
}

export function ReadingPorts({
  handleUpdateSettingsPort,
  handleSendSettingsPort,
  receivedPortP1,
  receivedPortP2,
  receivedPortSdi
}: Props): JSX.Element {
  const [selectedPort1, setSelectedPort1] = useState('Anual')
  const [selectedPort2, setSelectedPort2] = useState('Anual')
  const [NamePort1, setNamePort1] = useState('')
  const [NamePort2, setNamePort2] = useState('')
  const [ResolutionPort1, setResolutionPort1] = useState('')
  const [ResolutionPort2, setResolutionPort2] = useState('')
  const [AddressSdi, setAddressSdi] = useState('')
  const [FieldsSdi, setFieldsSdi] = useState('')
  const [LabelsSdi, setLabelsSdi] = useState('')

  function handleClickSend(): void {
    handleSendSettingsPort &&
      handleSendSettingsPort([
        `${ResolutionPort1};${selectedPort1}`,
        `${ResolutionPort2};${selectedPort2}`,
        `${AddressSdi};${FieldsSdi};${LabelsSdi}`
      ])
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateSettingsPort()
      //console.log('Atualizando campos...')
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (receivedPortP1) {
      // console.log('Porta 1:', receivedPortP1)
      const name = receivedPortP1.split('=')[0]
      const cleanString = receivedPortP1?.replace('p1=', '').replace('!', '')
      const [resolution, reset] = cleanString.split(';')
      setNamePort1(name)
      setResolutionPort1(resolution)
      setSelectedPort1(reset)
    }
    if (receivedPortP2) {
      //console.log('Porta 2:', receivedPortP2)
      const name = receivedPortP2.split('=')[0]
      const cleanString = receivedPortP2?.replace('p2=', '').replace('!', '')
      const [resolution, reset] = cleanString.split(';')
      setNamePort2(name)
      setResolutionPort2(resolution)
      setSelectedPort2(reset)
    }
    if (receivedPortSdi) {
      //console.log('Porta SDI-12:', receivedPortSdi)
      const cleanString = receivedPortSdi?.replace('sdi=', '').replace('!', '')
      const [adrress, fields, label] = cleanString.split(';')
      setAddressSdi(adrress)
      setFieldsSdi(fields)
      setLabelsSdi(label)
    }
  }, [receivedPortP1, receivedPortP2, receivedPortSdi])

  return (
    <div className="flex flex-col gap-2 p-2 mt-4 mb-4">
      <div className="flex-1 rounded-md border-[1px] border-gray-200 ">
        <span className="w-full bg-gray-300  block pl-2">Pulso 1</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2 h-14">
            <span>Nome da Porta:</span>
            <input
              type="text"
              value={NamePort1}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setNamePort1(e.target.value)}
              disabled
            />
            <span>Reset:</span>
            <select
              value={selectedPort1}
              onChange={(e) => setSelectedPort1(e.target.value)}
              className="mr-2 block  p-1 border rounded-md bg-white text-gray-700 shadow-sm focus:ring focus:ring-blue-300 w-24"
            >
              <option value="" disabled></option>
              <option value="ANO">Anual</option>
              <option value="MEN">Mensal</option>
              <option value="NUN">Nunca</option>
            </select>
          </div>

          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Resolução:</span>
            <input
              step="0.100"
              min="0"
              type="number"
              value={ResolutionPort1}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => {
                let value = parseFloat(e.target.value)

                // Garante que o valor mínimo é 0
                if (isNaN(value) || value < 0) {
                  value = 0
                }

                // Formata para 3 casas decimais
                setResolutionPort1(value.toFixed(3))
              }}
              onBlur={(e) => {
                // Garante que o input sempre exibe 3 casas ao perder o foco
                setResolutionPort1(parseFloat(e.target.value).toFixed(3))
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-md border-[1px] border-gray-200 ">
        <span className="w-full bg-gray-300  block pl-2">Pulso 2</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2 h-14">
            <span>Nome da Porta:</span>
            <input
              type="text"
              value={NamePort2}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setNamePort2(e.target.value)}
              disabled
            />
            <span>Reset:</span>
            <select
              value={selectedPort2}
              onChange={(e) => setSelectedPort2(e.target.value)}
              className="mr-2 block  p-1 border rounded-md bg-white text-gray-700 shadow-sm focus:ring focus:ring-blue-300 w-24"
            >
              <option value="" disabled></option>
              <option value="ANO">Anual</option>
              <option value="MEN">Mensal</option>
              <option value="NUN">Nunca</option>
            </select>
          </div>

          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Resolução:</span>
            <input
              step="0.100"
              min="0"
              type="number"
              value={ResolutionPort2}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => {
                let value = parseFloat(e.target.value)

                // Garante que o valor mínimo é 0
                if (isNaN(value) || value < 0) {
                  value = 0
                }

                // Formata para 3 casas decimais
                setResolutionPort2(value.toFixed(3))
              }}
              onBlur={(e) => {
                // Garante que o input sempre exibe 3 casas ao perder o foco
                setResolutionPort2(parseFloat(e.target.value).toFixed(3))
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 rounded-md border-[1px] border-gray-200 pb-2">
        <span className="w-full bg-gray-300  block pl-2">SDI-12</span>
        <div className="flex flex-col justify-center items-start gap-3 m-2">
          <div className="flex flex-row gap-3 justify-center items-center">
            <span>Endereço:</span>
            <input
              type="text"
              value={AddressSdi}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setAddressSdi(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-3 justify-center items-center">
            <span>Numero de campos:</span>
            <input
              type="number"
              value={FieldsSdi}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setFieldsSdi(e.target.value)}
            />
          </div>
          <div className="flex flex-row gap-3 justify-center items-center">
            <span>Rótulos das leituras:</span>
            <input
              type="text"
              value={LabelsSdi}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setLabelsSdi(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4 border-t-[1px] border-gray-200 pt-4 gap-4">
        <Button onClick={handleUpdateSettingsPort}>
          <ArrowsClockwise size={24} />
          Atualizar
        </Button>
        <Button onClick={handleClickSend}>
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
