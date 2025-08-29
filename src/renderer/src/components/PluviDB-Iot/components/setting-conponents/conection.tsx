import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'

interface InputFieldProps {
  id: string
  label: string
  value: string
  type: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

import PropTypes from 'prop-types'

const InputField: React.FC<InputFieldProps> = ({ id, label, type, value, onChange }) => (
  <div className="flex flex-row justify-between items-center gap-4 w-64">
    <span className="text-gray-600 font-semibold">{label}:</span>
    <input
      type={type}
      id={id}
      className="border-[1px] border-gray-200 p-1 rounded-lg text-center focus:outline-sky-300"
      value={value}
      onChange={onChange}
    />
  </div>
)

InputField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

type Props = {
  handleUpdateSettingsConection: () => void
  handleSendSettingsConection: (settings: string[]) => void
  receivedSettingsConection: string | undefined
}

export function Conection({
  handleSendSettingsConection,
  handleUpdateSettingsConection,
  receivedSettingsConection
}: Props): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)
  const [formData, setFormData] = useState<string[]>(['null', 'null', 'null', 'null', '0000'])

  const toggleSwitch = (): void => {
    setIsEnabled(!isEnabled)
    setFormData((prevData) => {
      const newData = [...prevData]
      if (!isEnabled) {
        // Se o switch estava ligado, desliga e limpa os campos
        newData[1] = 'auto'
        newData[2] = 'null'
        newData[3] = 'null'
        newData[4] = '0000'
      } else {
        // Se o switch estava desligado, mantém os valores atuais
        newData[1] = prevData[1]
        newData[2] = prevData[2]
        newData[3] = prevData[3]
      }
      return newData
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target

    const fieldIndexMap: { [key: string]: number } = {
      tipo: 0,
      apn: 1,
      usuario: 2,
      senha: 3,
      pin: 4
    }

    const index = fieldIndexMap[id]

    if (index !== undefined) {
      setFormData((prevData) => {
        const newData = [...prevData]
        newData[index] = value
        return newData
      })
    }
  }

  useEffect(() => {
    if (receivedSettingsConection != null) {
      const parts = receivedSettingsConection.split('=')

      if (parts.length > 1) {
        // Garante que há um "=" na string
        const Data = parts[1] // Remove "conex="
          ?.replace('!', '') // Remove o "!"
          .split(';') // Divide pelos ";"
          .map((item, index) => (index === 4 ? item.padStart(4, '0') : item)) // Garante que o último item tenha 4 dígitos

        setFormData(Data)

        if (Data[1] === 'auto') {
          setIsEnabled(true)
        } else {
          setIsEnabled(false)
        }

        //console.log('Dados recebidos:', Data)
      } else {
        // console.warn('receivedSettingsConection não contém "=":', receivedSettingsConection)
      }
    }
  }, [receivedSettingsConection])

  useEffect(() => {
    //console.log('Form data updated:', formData)
  }, [formData])

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateSettingsConection()
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex flex-col  justify-center items-center gap-2 mt-12">
      <div className="flex flex-col  justify-evenly items-start gap-4">
        <div className="flex flex-row justify-between items-center gap-6 mb-4 mt-4">
          <span className="text-gray-600 font-semibold">Tipo:</span>

          {/* Radio buttons para os tipos */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="nb"
                checked={formData[0] === 'nb'}
                onChange={() => {
                  const newFormData = [...formData]
                  newFormData[0] = 'nb' // Atualiza o valor para "nb"
                  setFormData(newFormData) // Atualiza o estado com o novo array
                }}
                className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
              />
              NB-IoT
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                value="catm"
                checked={formData[0] === 'catm'}
                onChange={() => {
                  const newFormData = [...formData]
                  newFormData[0] = 'catm' // Atualiza o valor para "catm"
                  setFormData(newFormData) // Atualiza o estado com o novo array
                }}
                className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
              />
              CAT-M
            </label>

            <label className="flex items-center">
              <input
                type="radio"
                value="auto"
                checked={formData[0] === 'auto'}
                onChange={() => {
                  const newFormData = [...formData]
                  newFormData[0] = 'auto' // Atualiza o valor para "catm"
                  setFormData(newFormData) // Atualiza o estado com o novo array
                }}
                className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
              />
              Ambos
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-[1px] border-gray-200 p-2 rounded-lg w-full">
          <div className="flex flex-row justify-between items-center gap-3  w-64 bg-gray-100 p-2 rounded-lg w-full">
            <span className="text-gray-600 font-semibold ">Autenticação:</span>
            <div className="flex gap-1">
              <span>Auto:</span>
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
          </div>
          {!isEnabled && (
            <>
              <InputField
                id="apn"
                label="APN"
                type="text"
                value={formData[1]}
                onChange={handleInputChange}
              />
              <InputField
                id="usuario"
                label="Usuario"
                type="text"
                value={formData[2]}
                onChange={handleInputChange}
              />
              <InputField
                id="senha"
                label="Senha"
                type="text"
                value={formData[3]}
                onChange={handleInputChange}
              />
              <InputField
                id="pin"
                label="PIN"
                type="text"
                value={formData[4]}
                onChange={handleInputChange}
              />
            </>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-10 border-t-[1px] border-gray-200 pt-4 w-full gap-4">
        <Button onClick={handleUpdateSettingsConection}>
          <ArrowsClockwise size={24} />
          Atualizar
        </Button>
        <Button
          onClick={() => {
            if (isEnabled) {
              handleSendSettingsConection([formData[0], formData[1], 'null', 'null', '0000'])
            } else {
              handleSendSettingsConection(formData)
            }
          }}
        >
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
