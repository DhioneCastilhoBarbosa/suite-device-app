interface LoadingModalProps {
  onStop: () => void
}

export default function LoadingModal({ onStop }: LoadingModalProps): JSX.Element | null {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white flex flex-col items-center justify-center p-6 rounded-md shadow-md">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1E9EF4]"></div>
        </div>
        <p className="mt-4 text-center text-lg font-medium text-gray-700">
          Procurando dispositivo.
        </p>

        <button className=" w-32 px-2 py-2 mt-6 bg-red-500 text-white rounded" onClick={onStop}>
          Parar
        </button>
      </div>
    </div>
  )
}
