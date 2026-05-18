import { useEffect, useState } from 'react'
import { X } from '@phosphor-icons/react/dist/ssr'
import logo from '../../assets/icon.png'
import Footer from '../Footer'
import { t } from 'i18next'

interface LoadingDataProps {
  visible: boolean
  onClose: () => void
}

export default function About({ visible, onClose }: LoadingDataProps): JSX.Element | null {
  const [appVersion, setAppVersion] = useState<string>('—')
  const [checkingUpdates, setCheckingUpdates] = useState(false)
  const [updateCheckHint, setUpdateCheckHint] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setUpdateCheckHint(null)
    const api = window.api
    if (!api?.getAppVersion) {
      setAppVersion('—')
      return
    }
    void api.getAppVersion().then(setAppVersion).catch(() => setAppVersion('—'))
  }, [visible])

  const handleCheckForUpdates = async (): Promise<void> => {
    setUpdateCheckHint(null)
    const api = window.api
    if (!api?.checkForUpdates) {
      setUpdateCheckHint(t('Não foi possível verificar atualizações neste ambiente.'))
      return
    }
    setCheckingUpdates(true)
    try {
      const res = await api.checkForUpdates()
      if (!res.ok) {
        if (res.reason === 'dev') {
          setUpdateCheckHint(t('Atualizações não estão disponíveis em modo desenvolvimento.'))
        } else if (res.reason === 'disabled') {
          setUpdateCheckHint(t('Atualizações não estão configuradas ou estão desativadas.'))
        } else if (res.message) {
          setUpdateCheckHint(res.message)
        }
      }
    } catch {
      setUpdateCheckHint(t('Ocorreu um erro ao pedir a verificação de atualizações.'))
    } finally {
      setCheckingUpdates(false)
    }
  }

  if (!visible) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white flex flex-col  rounded-md shadow-md">
        <div className="flex items-center justify-between mt-[-2px] border-b-2 border-sky-500">
          <h1 className=" ml-3 pt-2 text-left text-lg font-bold text-gray-700">{t('Sobre')}</h1>
          <button
            onClick={onClose}
            className=" text-gray-700 px-3 py-2 hover:bg-rose-600  hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-row items-start justify-star mb-2"></div>

        <div className="flex flex-col items-center">
          <img src={logo} alt="" width={80} className="mb-4" />
          <p className="m-2">
            {t('O Suite Device é uma plataforma modular de configuração de produtos Dualbase.')}
          </p>
          <div className="flex gap-2">
            <p>{t('Versão atual:')}</p>
            <p className="font-bold">v{appVersion}</p>
          </div>

          <button
            type="button"
            disabled={checkingUpdates}
            className="mt-3 rounded-md border border-sky-500 bg-white px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => void handleCheckForUpdates()}
          >
            {checkingUpdates ? t('Verificando...') : t('Verificar atualizações')}
          </button>
          {updateCheckHint ? (
            <p className="mx-6 mt-2 max-w-md text-center text-sm text-amber-800">{updateCheckHint}</p>
          ) : null}

          <Footer />

          <button
            className="bg-rose-500 rounded-md py-1 px-2 mb-4 mt-4 text-white hover:bg-rose-700"
            onClick={onClose}
          >
            {t('Fechar')}
          </button>
        </div>
      </div>
    </div>
  )
}
