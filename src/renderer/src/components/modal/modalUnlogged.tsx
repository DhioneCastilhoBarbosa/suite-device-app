import Button from '../button/Button'
import { t } from 'i18next'
interface ModalProps {
  show: boolean
  onClose: () => void
}
export function ModalErroUnloagged({ show, onClose }: ModalProps): JSX.Element | null {
  if (!show) {
    return null
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4">{t('Atenção!')}</h2>
        <p>
          {t(
            'O dispositivo atingiu o tempo limite de login ou foi reiniciado, por isso não respondeu ao último comando.'
          )}
        </p>
        <p className="mb-6 mt-2 font-semibold">
          {t('Por favor, tente atualizar as informações novamente.')}
        </p>
        <div className="flex justify-center mx-8">
          <Button size={'small'} filled={true} onClick={onClose}>
            {t('Fechar')}
          </Button>
        </div>
      </div>
    </div>
  )
}
