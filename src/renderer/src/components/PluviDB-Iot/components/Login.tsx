import { Eye, EyeClosed } from '@phosphor-icons/react'
import { useState } from 'react'

interface ModalProps {
  onClose: () => void
  onValidatePassword: (password: string) => Promise<boolean>
}

export default function PasswordModal({ onClose, onValidatePassword }: ModalProps): JSX.Element {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (): Promise<void> => {
    try {
      //console.log('Enviando senha:', password) // Log para depuração
      const isValid = await onValidatePassword(password) // Aguarda a validação
      //console.log('Senha válida?', isValid) // Log para depuração

      if (isValid) {
        onClose()
      } else {
        setError('Senha incorreta. Tente novamente.')
      }
    } catch (error) {
      //console.error('Erro na validação da senha:', error)
      setError('Erro ao validar a senha. Tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded shadow-lg text-center ">
        <h1 className="text-xl font-bold mb-4">Digite a senha de acesso do PluviDB-IoT</h1>
        <div className="flex flex-col items-center my-8">
          <div className=" flex flex-row  items-center justify-center border border-gray-200 rounded-md  focus-within:border-sky-500  focus-within:ring-sky-500 w-64 ">
            <input
              type={showPassword ? 'text' : 'password'}
              className="border-r-[1px] p-1 mr-1 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <span
              className="flex items-center justify-center cursor-pointer ml-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye size={24} /> : <EyeClosed size={24} />}
            </span>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2 ">
          <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={onClose}>
            Cancelar
          </button>
          <button className="px-4 py-2 bg-sky-500 text-white rounded" onClick={handleSubmit}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
