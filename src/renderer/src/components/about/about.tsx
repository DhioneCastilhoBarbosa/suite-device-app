import { X } from '@phosphor-icons/react/dist/ssr'
import logo from '../../assets/icon.png'
import Footer from '../Footer'
interface LoadingDataProps {
  visible: boolean
  onClose: () => void
}

export default function About({ visible, onClose }: LoadingDataProps) {
  if (!visible) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white flex flex-col  rounded-md shadow-md">
        <div className="flex items-center justify-between mt-[-2px] border-b-2 border-sky-500">
          <h1 className=" ml-3 pt-2 text-left text-lg font-bold text-gray-700">Sobre</h1>
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
            O Suite Device é uma plataforma modular de configuração de produtos Dualbase.
          </p>
          <div className="flex gap-2">
            <p>Versão atual:</p>
            <p className="font-bold">v.1.9.7</p>
          </div>

          <Footer />

          <button
            className="bg-rose-500 rounded-md py-1 px-2 mb-4 mt-4 text-white hover:bg-rose-700"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
