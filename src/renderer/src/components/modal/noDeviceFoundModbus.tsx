interface ModalProps {
  onClose: () => void
}

export default function NoDeviceFoundModbus({ onClose }: ModalProps): JSX.Element {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white p-8 rounded shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">
          O dispositivo foi desconectado ou demorou para responder!
        </h1>
        <p className="mb-4">Por favor, verifique suas conexões e tente novamente.</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  )
}
