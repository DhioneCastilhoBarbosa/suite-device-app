import Button from '../button/Button'

interface ModalProps {
  show: boolean
  onClose: () => void
}
export function ModalSucess({ show, onClose }: ModalProps): JSX.Element | null {
  if (!show) {
    return null
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Atenção!</h2>
        <p>Dispositivo atualizado com Sucesso!</p>
        <p className="mb-6">E necessario reiniciar a conexão.</p>
        <div className="flex justify-center mx-8">
          <Button size={'small'} filled={true} onClick={onClose}>
            Reiniciar
          </Button>
        </div>
      </div>
    </div>
  )
}
