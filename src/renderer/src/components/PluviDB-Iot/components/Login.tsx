import { Eye, EyeClosed } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface ModalProps {
  onClose: () => void
  onCancel?: () => void
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
    if (!password || submitting) return
    setSubmitting(true)
    try {
      setError('')
      const result = await onValidatePassword(password)

      if (result.success) {
        if (rememberPassword) localStorage.setItem('savedPassword', password)
        else localStorage.removeItem('savedPassword')
        onClose()
        return
      }

      if (result.errorCode === 'wrong-password') {
        setError('Senha incorreta. Tente novamente.')
        return
      }

      const isTimeout =
        result.errorCode === 'connection-error' &&
        /TIMEOUT|tempo\s*excedido/i.test(result.message || '')

      console.warn('Falha de conexão/comando:', result.message || result.errorCode)
      if (!isTimeout) toast.error('Erro ao conectar. Tente novamente.')
    } catch (e) {
      console.error('Erro inesperado:', e)
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/75">
      <div
        className={`bg-white p-8 rounded shadow-lg text-center w-[360px] ${submitting ? 'opacity-90' : ''}`}
        aria-busy={submitting}
        aria-live="polite"
      >
        <h1 className="text-xl font-bold mb-4">Digite a senha de acesso do PluviDB-IoT</h1>

        <div className="flex flex-col items-center my-4">
          <div
            className={`flex flex-row items-center justify-center border rounded-md w-64 ${
              submitting
                ? 'pointer-events-none bg-gray-50'
                : 'border-gray-200 focus-within:border-sky-500 focus-within:ring-sky-500'
            }`}
          >
            <input
              type={showPassword ? 'text' : 'password'}
              className="border-r p-1 mr-1 outline-none w-full disabled:bg-gray-100"
              value={password}
              onChange={(e) => {
                if (submitting) return
                setPassword(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
              disabled={submitting}
              autoFocus
            />
            <button
              type="button"
              className="flex items-center justify-center px-2 disabled:opacity-50"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              disabled={submitting}
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
              disabled={submitting}
            />
            <label htmlFor="remember" className={submitting ? 'text-gray-400' : ''}>
              Lembrar minha senha
            </label>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            disabled={submitting}
            className={`px-4 py-2 rounded text-white
      ${submitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'}`}
            onClick={() => (onCancel ? onCancel() : onClose())}
          >
            Cancelar
          </button>

          <button
            disabled={!password || submitting}
            className={`px-4 py-2 rounded text-white
      ${!password || submitting ? 'bg-sky-500 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'}`}
            onClick={handleSubmit}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                  />
                </svg>
                Validando...
              </span>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
