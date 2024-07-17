import { X } from '@phosphor-icons/react/dist/ssr'

interface LoadingDataProps {
  visible: boolean
  onClose: () => void
}

export default function About({ visible, onClose }: LoadingDataProps) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white flex flex-col p-6 rounded-md shadow-md">
        <div className="flex items-end justify-end">
          <button onClick={onClose} className=" text-rose-500  hover:text-rose-700">
            <X size={25} />
          </button>
        </div>
        <div className="flex  flex-row items-start justify-star mb-2">
          <h1 className="mt-4 text-left text-lg font-bold text-gray-700">Sobre</h1>
        </div>

        <div>
          <p>
            O suite device e uma solução compative com todos os nosso sensores que necessita de
            configuração.
          </p>
          <div>
            <p>Versão:</p>
            <p>v.1.1.6</p>
          </div>
          <p>Desevolvido por: dualbase</p>
        </div>
      </div>
    </div>
  )
}
