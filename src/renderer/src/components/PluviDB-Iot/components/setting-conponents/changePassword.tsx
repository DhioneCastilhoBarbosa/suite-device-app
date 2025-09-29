import { Eye, EyeClosed, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useState } from 'react'
import { t } from 'i18next'

type Props = {
  handleSendChargePassword: (settings: string) => void
}
export function ChangePassword({ handleSendChargePassword }: Props): JSX.Element {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [match, setMatch] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState('') // Estado para armazenar o erro
  const [showPassword, setShowPassword] = useState(false)
  const handleSubmit = (): void => {
    if (!password.trim() || !confirmPassword.trim()) {
      setErrorMessage(t('A senha não pode estar vazia!'))
      setMatch(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('As senhas não conferem!'))
      setMatch(false)
      return
    }

    setErrorMessage('') // Reseta o erro se tudo estiver certo
    //console.log('Senhas conferem:', password)
    setMatch(true)
    handleSendChargePassword?.(password)
    // Salvar a senha ou enviar para API aqui
  }

  return (
    <div className="flex flex-col gap-2 mt-12">
      <div className="flex flex-row justify-normal items-center gap-3">
        <span>{t('Nova senha:')}</span>
        <div className=" flex flex-row border border-gray-200 rounded-md  focus-within:border-sky-500  focus-within:ring-sky-500">
          <input
            type={showPassword ? 'text' : 'password'}
            className="border-r-[1px] p-1 mr-1 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="flex items-center cursor-pointer mr-2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={24} /> : <EyeClosed size={24} />}
          </span>
        </div>
      </div>
      <div className="flex flex-row  justify-normal items-center gap-2">
        <span>{t('Confirmação:')}</span>
        <div className=" flex flex-row border border-gray-200 rounded-md focus-within:border-sky-500  focus-within:ring-sky-500">
          <input
            type={showPassword ? 'text' : 'password'}
            className=" p-1 outline-none "
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <p
        className={`flex flex-row items-center justify-center mt-4 text-red-500 text-sm transition-opacity duration-300 ${
          match === false ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {errorMessage}
      </p>

      <div className="flex justify-end mt-6 border-t-[1px] border-gray-200 pt-4">
        <Button onClick={handleSubmit}>
          <UploadSimple size={24} />
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
