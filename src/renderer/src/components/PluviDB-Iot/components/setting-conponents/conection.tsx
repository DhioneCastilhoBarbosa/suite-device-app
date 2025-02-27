import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useState } from 'react'

interface InputFieldProps {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

import PropTypes from 'prop-types'

const InputField: React.FC<InputFieldProps> = ({ id, label, value, onChange }) => (
  <div className="flex flex-row justify-between items-center gap-4 w-64">
    <span className="text-gray-600 font-semibold">{label}:</span>
    <input
      type="text"
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
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

export function Conection(): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'auto',
    apn: 'null',
    usuario: 'null',
    senha: 'null',
    pin: '0000'
  })

  const toggleSwitch = () => {
    setIsEnabled(!isEnabled)
    console.log('Switch está:', !isEnabled ? 'Ligado' : 'Desligado')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }))
    console.log('Input mudou:', id, value)
  }

  return (
    <div className="flex flex-col  justify-center items-center gap-2 mt-12">
      <div className="flex flex-row justify-between items-center gap-3 mb-2 w-64">
        <span className="text-gray-600 font-semibold">APN auto:</span>
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
      <div className="flex flex-col  justify-evenly items-start gap-2">
        <InputField id="tipo" label="Tipo" value={formData.tipo} onChange={handleInputChange} />
        <InputField id="apn" label="APN" value={formData.apn} onChange={handleInputChange} />
        <InputField
          id="usuario"
          label="Usuario"
          value={formData.usuario}
          onChange={handleInputChange}
        />
        <InputField id="senha" label="Senha" value={formData.senha} onChange={handleInputChange} />
        <InputField id="pin" label="PIN" value={formData.pin} onChange={handleInputChange} />
      </div>
      <div className="flex justify-end mt-10 border-t-[1px] border-gray-200 pt-4 w-full gap-4">
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
