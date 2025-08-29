import { Eye, EyeClosed } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface ModalProps {
  onClose: () => void
  onCancel?: () => void // [CHANGE]
  onValidatePassword: (password: string) => Promise<{
    success: boolean
    errorCode?: 'wrong-password' | 'invalid-command' | 'connection-error' | 'unexpected' | string
    message?: string
  }>
}

export default function PasswordModal({
  onClose,
  onValidatePassword,
  onCancel
}: ModalProps): JSX.Element {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberPassword, setRememberPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const savedPassword = localStorage.getItem('savedPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      setRememberPassword(true)
    }
  }, [])

  const handleSubmit = async (): Promise<void> => {
    if (!password) return
    setSubmitting(true)
    try {
      setError('') // limpa erro sob o input
      const result = await onValidatePassword(password)

      if (result.success) {
        if (rememberPassword) localStorage.setItem('savedPassword', password)
        else localStorage.removeItem('savedPassword')
        onClose()
        return
      }

      // Só mostra erro de senha quando realmente for senha incorreta
      if (result.errorCode === 'wrong-password') {
        setError('Senha incorreta. Tente novamente.')
        return
      }

      const isTimeout =
        result.errorCode === 'connection-error' &&
        /TIMEOUT|tempo\s*excedido/i.test(result.message || '')

      console.warn('Falha de conexão/comando:', result.message || result.errorCode)
      if (!isTimeout) {
        toast.error('Erro ao conectar. Tente novamente.')
      }
    } catch (e) {
      console.error('Erro inesperado:', e)
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded shadow-lg text-center w-[360px]">
        <h1 className="text-xl font-bold mb-4">Digite a senha de acesso do PluviDB-IoT</h1>

        <div className="flex flex-col items-center my-4">
          <div className="flex flex-row items-center justify-center border border-gray-200 rounded-md focus-within:border-sky-500 focus-within:ring-sky-500 w-64">
            <input
              type={showPassword ? 'text' : 'password'}
              className="border-r-[1px] p-1 mr-1 outline-none w-full"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <button
              type="button"
              className="flex items-center justify-center px-2"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-2 self-start">
            <input
              id="remember"
              type="checkbox"
              checked={rememberPassword}
              onChange={() => setRememberPassword(!rememberPassword)}
            />
            <label htmlFor="remember">Lembrar minha senha</label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => (onCancel ? onCancel() : onClose())} // [CHANGE]
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${password ? 'bg-sky-500 hover:bg-sky-600' : 'bg-sky-300 cursor-not-allowed'}`}
            onClick={handleSubmit}
            disabled={!password || submitting}
          >
            {submitting ? 'Validando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
