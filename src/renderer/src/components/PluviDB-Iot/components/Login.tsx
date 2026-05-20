import {
  ArrowsClockwise,
  Drop,
  Eye,
  EyeClosed,
  LockKey,
  Warning
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { t } from 'i18next'

interface ModalProps {
  onClose: () => void
  onCancel?: () => void
  onEnterRecoveryOnly: () => void
  onValidatePassword: (password: string) => Promise<{
    success: boolean
    errorCode?: 'wrong-password' | 'invalid-command' | 'connection-error' | 'unexpected' | string
    message?: string
  }>
}

export default function PasswordModal({
  onClose,
  onValidatePassword,
  onCancel,
  onEnterRecoveryOnly
}: ModalProps): JSX.Element {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberPassword, setRememberPassword] = useState(false)
  const [firmwareRecoveryMode, setFirmwareRecoveryMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (firmwareRecoveryMode) return
    const savedPassword = localStorage.getItem('savedPassword')
    if (savedPassword) {
      setPassword(savedPassword)
      setRememberPassword(true)
    }
  }, [firmwareRecoveryMode])

  const handleFirmwareRecoveryToggle = (): void => {
    const next = !firmwareRecoveryMode
    setFirmwareRecoveryMode(next)
    setError('')
    if (next) {
      setRememberPassword(false)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (submitting) return

    if (firmwareRecoveryMode) {
      onEnterRecoveryOnly()
      return
    }

    if (!password) return

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
        setError(t('Senha incorreta. Tente novamente.'))
        return
      }

      const isTimeout =
        result.errorCode === 'connection-error' &&
        /TIMEOUT|tempo\s*excedido/i.test(result.message || '')

      console.warn('Falha de conexão/comando:', result.message || result.errorCode)
      if (!isTimeout) toast.error(t('Erro ao conectar. Tente novamente.'))
    } catch (e) {
      console.error('Erro inesperado:', e)
      toast.error(t('Erro inesperado. Tente novamente.'))
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = firmwareRecoveryMode || Boolean(password)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div
        className={`w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 ${submitting ? 'pointer-events-none opacity-95' : ''}`}
        aria-busy={submitting}
        aria-live="polite"
        role="dialog"
        aria-labelledby="pluvi-login-title"
      >
        <div className="relative bg-gradient-to-br from-sky-500 to-sky-600 px-6 pt-6 pb-8 text-white">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/10" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
              <Drop size={32} weight="fill" />
            </div>
            <div className="min-w-0 text-left">
              <h1 id="pluvi-login-title" className="text-lg font-bold tracking-tight">
                PluviDB-IoT
              </h1>
              <p className="text-sm text-sky-100">{t('Acesso ao dispositivo')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <label
              htmlFor="pluvi-password"
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${firmwareRecoveryMode ? 'text-zinc-400' : 'text-zinc-500'}`}
            >
              <LockKey size={14} />
              {t('Senha de acesso')}
            </label>
            <div
              className={`flex items-center overflow-hidden rounded-lg border-2 bg-white transition-colors ${
                firmwareRecoveryMode || submitting
                  ? 'border-zinc-200 bg-zinc-50'
                  : error
                    ? 'border-red-300 focus-within:border-red-400'
                    : 'border-zinc-200 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20'
              }`}
            >
              <input
                id="pluvi-password"
                type={showPassword ? 'text' : 'password'}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 disabled:text-zinc-400"
                value={password}
                onChange={(e) => {
                  if (submitting || firmwareRecoveryMode) return
                  setPassword(e.target.value)
                  setError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSubmit()
                }}
                disabled={submitting || firmwareRecoveryMode}
                autoFocus={!firmwareRecoveryMode}
                placeholder={
                  firmwareRecoveryMode ? t('Não necessário neste modo') : t('Digite sua senha')
                }
              />
              <button
                type="button"
                className="flex shrink-0 items-center justify-center px-3 text-zinc-500 hover:text-sky-600 disabled:opacity-40"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('Ocultar senha') : t('Mostrar senha')}
                disabled={submitting || firmwareRecoveryMode}
                tabIndex={firmwareRecoveryMode ? -1 : 0}
              >
                {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
              </button>
            </div>
          </div>

          <label
            className={`box-border flex cursor-pointer items-center gap-2.5 rounded-lg border-2 px-3 py-2.5 transition-colors ${
              firmwareRecoveryMode || submitting
                ? 'cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-60'
                : 'border-zinc-200 hover:border-sky-300 hover:bg-sky-50/50'
            }`}
          >
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-zinc-300 text-sky-500 focus:ring-sky-500"
              checked={rememberPassword}
              onChange={() => setRememberPassword(!rememberPassword)}
              disabled={submitting || firmwareRecoveryMode}
            />
            <span className="text-sm text-zinc-600">{t('Lembrar minha senha')}</span>
          </label>

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all ${
              firmwareRecoveryMode
                ? 'border-amber-400 bg-amber-50 shadow-sm'
                : 'border-zinc-200 bg-zinc-50/80 hover:border-amber-300 hover:bg-amber-50/60'
            } ${submitting ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input
              id="firmware-recovery"
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-amber-400 text-amber-500 focus:ring-amber-500"
              checked={firmwareRecoveryMode}
              onChange={handleFirmwareRecoveryToggle}
              disabled={submitting}
            />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-semibold leading-snug text-zinc-800">
                {t('Atualizar firmware')}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {t('Acesso exclusivo para atualização de firmware')}
              </p>
            </div>
          </label>

          {firmwareRecoveryMode && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-left text-xs leading-relaxed text-amber-900">
              <Warning size={18} className="shrink-0 text-amber-600" weight="fill" />
              <p>
                {t(
                  'Acesso limitado: apenas a aba Atualização. Coloque a placa em modo recovery antes de gravar.'
                )}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-1 sm:flex-row">
            <button
              type="button"
              disabled={submitting}
              onClick={() => (onCancel ? onCancel() : onClose())}
              className="box-border min-h-[44px] flex-1 rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
            >
              {t('Cancelar')}
            </button>

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={() => void handleSubmit()}
              className="box-border min-h-[44px] flex-1 rounded-lg border-2 border-sky-500 bg-sky-500 px-3 py-2.5 text-sm font-semibold leading-snug text-white transition-colors hover:border-sky-600 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none">
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
                  {t('Validando...')}
                </span>
              ) : firmwareRecoveryMode ? (
                <span className="inline-flex items-center justify-center gap-2 text-center">
                  <ArrowsClockwise size={18} weight="bold" className="shrink-0" />
                  {t('Entrar em modo Atualização')}
                </span>
              ) : (
                t('Confirmar')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
