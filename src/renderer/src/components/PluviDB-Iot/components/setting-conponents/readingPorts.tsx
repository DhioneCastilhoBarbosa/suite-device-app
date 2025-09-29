import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'
import { t } from 'i18next'

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
  const [selectedPort1, setSelectedPort1] = useState('ano')
  const [selectedPort2, setSelectedPort2] = useState('ano')
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
    <div className="flex flex-col gap-2 p-2 mt-4 mb-4 items-stretch">
      <div className="w-full rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">{t('Pulso 1')}</span>
        <div className="flex flex-row items-center justify-center">
          <div className="flex flex-row justify-start items-center gap-3 p-2">
            <span>{t('Reset:')}</span>
            <select
              value={selectedPort1}
              onChange={(e) => setSelectedPort1(e.target.value)}
              className="mr-2 block p-1 border rounded-md bg-white text-gray-700 shadow-sm focus:ring focus:ring-blue-300 w-24"
            >
              <option value="" disabled></option>
              <option value="ano">{t('Anual')}</option>
              <option value="men">{t('Mensal')}</option>
              <option value="nun">{t('Nunca')}</option>
            </select>
          </div>

          <div className="flex flex-row justify-start items-center gap-3 p-2">
            <span>{t('Resolução:')}</span>
            <input
              step="0.001"
              min="0"
              type="number"
              value={ResolutionPort1}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 w-24"
              onChange={(e) => {
                const rawValue = e.target.value

                // Permite digitar números intermediários como "1." ou "1.3"
                if (rawValue === '' || rawValue === '.' || rawValue === '0.') {
                  setResolutionPort1(rawValue)
                  return
                }

                // Limita a entrada a um máximo de 4 caracteres (2 inteiros e 3 decimais)
                if (!/^\d{0,2}(\.\d{0,3})?$/.test(rawValue)) return

                setResolutionPort1(rawValue)
              }}
              onBlur={(e) => {
                const value = e.target.value

                // Garante que o número tenha até 3 casas decimais
                if (!isNaN(Number(value)) && value !== '') {
                  let formattedValue = value

                  // Verifica se o valor contém parte decimal
                  if (formattedValue.indexOf('.') !== -1) {
                    const parts = formattedValue.split('.')

                    // Se a parte decimal tiver menos de 3 casas, completa com zeros
                    if (parts[1].length < 3) {
                      formattedValue = `${parts[0]}.${parts[1].padEnd(3, '0')}`
                    }
                  } else {
                    // Se não houver parte decimal, adiciona ".000"
                    formattedValue = `${formattedValue}.000`
                  }

                  // Verifica se o número já tem 2 casas decimais, caso contrário, mantém como está
                  const [integer, decimal] = formattedValue.split('.')
                  if (decimal && decimal.length === 2) {
                    formattedValue = `${integer}.${decimal}` // Não altera, mantém as 2 casas decimais
                  }

                  setResolutionPort1(formattedValue)
                } else {
                  setResolutionPort1('0.000') // Caso o valor não seja válido
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">{t('Pulso 2')}</span>
        <div className="flex flex-row items-center justify-center">
          <div className="flex flex-row justify-start items-center gap-3 p-2">
            <span>{t('Reset:')}</span>
            <select
              value={selectedPort2}
              onChange={(e) => setSelectedPort2(e.target.value)}
              className="mr-2 block p-1 border rounded-md bg-white text-gray-700 shadow-sm focus:ring focus:ring-blue-300 w-24"
            >
              <option value="" disabled></option>
              <option value="ano">{t('Anual')}</option>
              <option value="men">{t('Mensal')}</option>
              <option value="nun">{t('Nunca')}</option>
            </select>
          </div>

          <div className="flex flex-row justify-start items-center gap-3 p-2">
            <span>{t('Resolução:')}</span>
            <input
              step="0.001"
              min="0"
              type="number"
              value={ResolutionPort2}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 w-24"
              onChange={(e) => {
                const rawValue = e.target.value

                // Permite digitar números intermediários como "1." ou "1.3"
                if (rawValue === '' || rawValue === '.' || rawValue === '0.') {
                  setResolutionPort2(rawValue)
                  return
                }

                // Limita a entrada a um máximo de 4 caracteres (2 inteiros e 3 decimais)
                if (!/^\d{0,2}(\.\d{0,3})?$/.test(rawValue)) return

                setResolutionPort2(rawValue)
              }}
              onBlur={(e) => {
                const value = e.target.value

                // Garante que o número tenha até 3 casas decimais
                if (!isNaN(Number(value)) && value !== '') {
                  let formattedValue = value

                  // Verifica se o valor contém parte decimal
                  if (formattedValue.indexOf('.') !== -1) {
                    const parts = formattedValue.split('.')

                    // Se a parte decimal tiver menos de 3 casas, completa com zeros
                    if (parts[1].length < 3) {
                      formattedValue = `${parts[0]}.${parts[1].padEnd(3, '0')}`
                    }
                  } else {
                    // Se não houver parte decimal, adiciona ".000"
                    formattedValue = `${formattedValue}.000`
                  }

                  // Verifica se o número já tem 2 casas decimais, caso contrário, mantém como está
                  const [integer, decimal] = formattedValue.split('.')
                  if (decimal && decimal.length === 2) {
                    formattedValue = `${integer}.${decimal}` // Não altera, mantém as 2 casas decimais
                  }

                  setResolutionPort2(formattedValue)
                } else {
                  setResolutionPort2('0.000') // Caso o valor não seja válido
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-full rounded-md border-[1px] border-gray-200 pb-2">
        <span className="w-full bg-gray-300 block pl-2">SDI-12</span>
        <div className="flex flex-col gap-3 p-2">
          <div className="flex flex-row justify-between items-center w-72">
            <span>{t('Endereço:')}</span>
            <input
              type="text"
              value={AddressSdi}
              className="w-36 border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setAddressSdi(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center w-72">
            <span>{t('Número de campos:')}</span>
            <input
              type="number"
              value={FieldsSdi}
              className="w-36 border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setFieldsSdi(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center w-72">
            <span>{t('Rótulos das leituras:')}</span>
            <input
              type="text"
              value={LabelsSdi}
              className="w-36 border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setLabelsSdi(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-4 border-t-[1px] border-gray-200 pt-4 gap-4">
        <Button onClick={handleUpdateSettingsPort}>
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
        <Button onClick={handleClickSend}>
          <UploadSimple size={24} />
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
