import Button from '../button/Button'
import { t } from 'i18next'

interface ModalProps {
  show: boolean
  onClose: () => void
}
export function ModalFailUpdate({ show, onClose }: ModalProps): JSX.Element | null {
  if (!show) {
    return null
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4">{t('Atenção!')}</h2>
        <p>{t('Falha na atualização do dispositivo!')}</p>
        <p className="mb-6">{t('Reinicie a conexão e tente novamente.')}</p>
        <div className="flex justify-center mx-8">
          <Button size={'small'} filled={true} onClick={onClose}>
            {t('Reiniciar')}
          </Button>
        </div>
      </div>
    </div>
  )
}
