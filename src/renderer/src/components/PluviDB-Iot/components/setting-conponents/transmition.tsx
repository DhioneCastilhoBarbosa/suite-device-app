import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useState } from 'react'

export function Transmition(): JSX.Element {
  const [isEnabledAuth, setIsEnabledAuth] = useState(false)
  const [isEnabledCertificate, setIsEnableCertificate] = useState(false)
  const [selectedButton, setSelectedButton] = useState<string | null>('MQTT')
  const handleButtonClick = (buttonType: string): void => {
    setSelectedButton(buttonType)
  }

  const toggleSwitchAuth = () => {
    setIsEnabledAuth(!isEnabledAuth)
    console.log('Switch está:', !isEnabledAuth ? 'Ligado' : 'Desligado')
  }

  const toggleSwitchCertificate = () => {
    setIsEnableCertificate(!isEnabledCertificate)
    console.log('Switch está:', !isEnabledCertificate ? 'Ligado' : 'Desligado')
  }
  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center item-center w-2/3">
        <div className="flex flex-row  justify-between items-center gap-3 m-2">
          <span>Timer fixo:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Timer dinâmico:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>
      </div>

      <div className="flex justify-center items-center my-4 border-y-[1px] border-gray-200 py-4 gap-8">
        <span>Tipo de transmissão:</span>
        <Button
          size="medium"
          className={selectedButton === 'FTP' ? 'bg-sky-500 text-white' : ''}
          onClick={() => handleButtonClick('FTP')}
        >
          FTP
        </Button>
        <Button
          size="medium"
          className={selectedButton === 'MQTT' ? 'bg-sky-500 text-white' : ''}
          onClick={() => handleButtonClick('MQTT')}
        >
          MQTT
        </Button>
      </div>

      <div className="flex flex-col justify-center item-center w-2/3 m-2">
        <div className="flex flex-row  justify-between items-center gap-3 m-2">
          <span>Broker:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Publish:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Subscribe:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Porta:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Usuário:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>
        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Senha:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>
        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Segurança:</span>
          <input type="text" className="border-[1px] border-gray-200 p-1 rounded-lg" />
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Autenticação:</span>
          <button
            onClick={toggleSwitchAuth}
            className={`relative w-12 h-6 flex items-center rounded-full transition-colors ${
              isEnabledAuth ? 'bg-sky-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                isEnabledAuth ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex flex-row justify-between items-center gap-3 m-2">
          <span>Certificado:</span>
          <button
            onClick={toggleSwitchCertificate}
            className={`relative w-12 h-6 flex items-center rounded-full transition-colors ${
              isEnabledCertificate ? 'bg-sky-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                isEnabledCertificate ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      <div className="flex justify-end mt-10 border-t-[1px] border-gray-200 pt-4 w-full gap-4">
        <Button>
          <ArrowsClockwise size={24} />
          Atualizar
        </Button>
        <Button>
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
