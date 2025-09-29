import Button from '../button/Button'
import { t } from 'i18next'

interface ModalProps {
  show: boolean
  onClose: () => void
  onUpdate: () => void
}
export function ModalUpdate({ show, onClose, onUpdate }: ModalProps) {
  if (!show) {
    return null
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4">{t('Atenção!')}</h2>
        <p>{t('Ao atualizar todas as configurações serão perdidas.')}</p>
        <p className="mb-6">{t('Deseja prosseguir com a atualização?')}</p>
        <div className="flex justify-between mx-8">
          <Button size={'small'} filled={true} onClick={onUpdate}>
            {t('Sim')}
          </Button>
          <Button size={'small'} filled={true} onClick={onClose}>
            {t('Não')}
          </Button>
        </div>
      </div>
    </div>
  )
}
