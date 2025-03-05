import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'

type Props = {
  handleUpdateSettingsTransmition: () => void
  handleSendSettingsTransmition: (settings: string[]) => void
  receivedTimerFixed: string | undefined
  receivedTimerdynamic: string | undefined
  receivedTimerMaintenance: string | undefined
  receivedProtocolInUse: string | undefined
  receivedDataProtocolMQTT: string | undefined
  receivedDataProtocolFTP: string | undefined
}

const timeOptions = [
  { label: '0 minutos', value: '0' },
  { label: '1 minuto', value: '1' },
  { label: '2 minutos', value: '2' },
  { label: '3 minutos', value: '3' },
  { label: '4 minutos', value: '4' },
  { label: '5 minutos', value: '5' },
  { label: '10 minutos', value: '10' },
  { label: '15 minutos', value: '15' },
  { label: '30 minutos', value: '30' },
  { label: '1 hora', value: '60' },
  { label: '2 horas', value: '120' },
  { label: '3 horas', value: '180' },
  { label: '4 horas', value: '240' },
  { label: '6 horas', value: '360' },
  { label: '8 horas', value: '480' },
  { label: '12 horas', value: '720' },
  { label: '24 horas', value: '1440' }
]

export function Transmition({
  handleSendSettingsTransmition,
  handleUpdateSettingsTransmition,
  receivedTimerFixed,
  receivedTimerdynamic,
  receivedTimerMaintenance,
  receivedProtocolInUse,
  receivedDataProtocolMQTT,
  receivedDataProtocolFTP
}: Props): JSX.Element {
  //const [isEnabledAuth, setIsEnabledAuth] = useState(false)
  const [isEnabledCertificate, setIsEnableCertificate] = useState(false)
  const [isEnabledModeTransfer, setIsEnableModeTransfer] = useState(false)
  const [selectedButton, setSelectedButton] = useState<string>('MQTT')
  const [TimerFixed, setTimerFixed] = useState(timeOptions[1].value)
  const [TimerDynamic, setTimerDynamic] = useState(timeOptions[2].value)
  const [TimerMaintenance, setTimerMaintenance] = useState(timeOptions[0].value)
  const [Broker, setBroker] = useState('')
  const [Publish, setPublish] = useState('')
  const [Subscribe, setSubscribe] = useState('')
  const [Port, setPort] = useState('')
  const [User, setUser] = useState('')
  const [Password, setPassword] = useState('')
  const [Security, setSecurity] = useState('')
  const [AdressServer, setAdressServer] = useState('')
  const [Directory, setDirectory] = useState('')
  const [UserServer, setUserServer] = useState('')
  const [PasswordServer, setPasswordServer] = useState('')
  const [PortServer, setPortServer] = useState('')
  const [SecurityServer, setSecurityServer] = useState('')
  const [ModeTransfer, setModeTransfer] = useState('')

  //const [Authentication, setAuthentication] = useState('')

  const handleButtonClick = (buttonType: string): void => {
    setSelectedButton(buttonType)
  }

  /*const toggleSwitchAuth = (): void => {
    setIsEnabledAuth(!isEnabledAuth)
    console.log('Switch está:', !isEnabledAuth ? 'Ligado' : 'Desligado')
  }*/

  const toggleSwitchCertificate = (): void => {
    setIsEnableCertificate(!isEnabledCertificate)
    //console.log('Switch está:', !isEnabledCertificate ? 'Ligado' : 'Desligado')
  }

  const toggleSwitchModeTransfer = (): void => {
    setIsEnableModeTransfer(!isEnabledModeTransfer)
  }

  function handleClickSend(): void {
    handleSendSettingsTransmition &&
      handleSendSettingsTransmition([
        TimerFixed,
        TimerDynamic,
        selectedButton.toLocaleLowerCase(),
        `${Broker};${Publish};${Subscribe};${Port};${User};${Password};${Security};${Number(isEnabledCertificate)}`,
        `${AdressServer};${Directory};${UserServer};${PasswordServer};${PortServer};${SecurityServer};${ModeTransfer}`,
        TimerMaintenance
      ])
  }

  const handleClick = (): void => {
    //console.log('Antes de alterar:', timeZone) // Log antes de alterar
    if (isEnabledModeTransfer) {
      setModeTransfer('atv')
    } else {
      setModeTransfer('psv')
    }
    toggleSwitchModeTransfer()
    //console.log('Depois de alterar:', timeZone) // Log imediatamente após a tentativa de alteração
  }

  useEffect(() => {
    if (isEnabledModeTransfer) {
      setModeTransfer('atv')
    } else {
      setModeTransfer('psv')
    }
    //console.log('Timezone alterado:', timeZone)
  }, [isEnabledModeTransfer]) // Isso será disparado sempre que isEnabled mudar

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateSettingsTransmition()
      //console.log('Atualizando campos...')
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (receivedTimerFixed) {
      //console.log('Timer fixo:', receivedTimerFixed)
      const cleanString = receivedTimerFixed?.replace('tf=', '').replace('!', '')
      setTimerFixed(cleanString)
    }
    if (receivedTimerdynamic) {
      //console.log('Timer dinâmico:', receivedTimerdynamic)
      const cleanString = receivedTimerdynamic?.replace('td=', '').replace('!', '')
      setTimerDynamic(cleanString)
    }

    if (receivedTimerMaintenance) {
      const cleanString = receivedTimerMaintenance?.replace('tm=', '').replace('!', '')
      setTimerMaintenance(cleanString)
    }

    if (receivedProtocolInUse) {
      //console.log('Protocolo:', receivedTimerdynamic)
      const cleanString = receivedProtocolInUse?.replace('prot=', '').replace('!', '')
      setSelectedButton(cleanString.toUpperCase())
    }

    if (receivedDataProtocolMQTT) {
      //console.log('Dados MQTT:', receivedDataProtocolMQTT)
      const cleanString = receivedDataProtocolMQTT?.replace('mqtt=', '').replace('!', '')
      const [
        broker,
        publish,
        subscribe,
        port,
        user,
        password,
        security,
        // authentication,
        certificate
      ] = cleanString.split(';')

      setBroker(broker)
      setPublish(publish)
      setSubscribe(subscribe)
      setPort(port)
      setUser(user)
      setPassword(password)
      setSecurity(security)
      // setAuthentication(authentication)
      setIsEnableCertificate(Boolean(Number(certificate)))
    }

    if (receivedDataProtocolFTP) {
      console.log('Dados FTP:', receivedDataProtocolFTP)
      const cleanString = receivedDataProtocolFTP?.replace('ftp=', '').replace('!', '')
      const [
        addressServer,
        directory,
        userServer,
        passwordServer,
        portServer,
        securityServer,
        modeTransfer
      ] = cleanString.split(';')
      setAdressServer(addressServer)
      setDirectory(directory)
      setUserServer(userServer)
      setPasswordServer(passwordServer)
      setPortServer(portServer)
      setSecurityServer(securityServer)
      setModeTransfer(modeTransfer)

      if (modeTransfer === 'psv') {
        setIsEnableModeTransfer(false)
      } else {
        setIsEnableModeTransfer(true)
      }
    }
  }, [
    receivedTimerFixed,
    receivedTimerdynamic,
    receivedTimerMaintenance,
    receivedProtocolInUse,
    receivedDataProtocolMQTT,
    receivedDataProtocolFTP
  ])

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center item-center w-2/3">
        <div className="flex flex-row  justify-between items-center gap-3 m-2 w-2/3 ">
          <span>Timer fixo:</span>
          <select
            id="time-select"
            value={TimerFixed}
            onChange={(e) => setTimerFixed(e.target.value)}
            className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2 w-2/3">
          <span>Timer com chuva:</span>

          <select
            id="time-select"
            value={TimerDynamic}
            onChange={(e) => setTimerDynamic(e.target.value)}
            className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2 w-2/3">
          <span>Timer manutenção:</span>

          <select
            id="time-select"
            value={TimerMaintenance}
            onChange={(e) => setTimerMaintenance(e.target.value)}
            className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
      {selectedButton === 'MQTT' ? (
        <div className="flex flex-col justify-center item-center w-2/3 m-2">
          <div className="flex flex-row  justify-between items-center gap-3 m-2">
            <span>Broker:</span>
            <input
              type="text"
              value={Broker}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setBroker(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Publish:</span>
            <input
              type="text"
              value={Publish}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPublish(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Subscribe:</span>
            <input
              type="text"
              value={Subscribe}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setSubscribe(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Porta:</span>
            <input
              type="number"
              value={Port}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPort(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Usuário:</span>
            <input
              type="text"
              value={User}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Senha:</span>
            <input
              type="text"
              value={Password}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Segurança:</span>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="1"
                  checked={Security === '1'}
                  onChange={(e) => {
                    setSecurity(e.target.value) // Atualiza o estado com o novo array
                  }}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                tls
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="0"
                  checked={Security === '0'}
                  onChange={(e) => {
                    setSecurity(e.target.value) // Atualiza o estado com o novo array
                  }}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                Nenhuma
              </label>
            </div>
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
      ) : (
        <div className="flex flex-col justify-center item-center w-2/3 m-2">
          <div className="flex flex-row  justify-between items-center gap-3 m-2">
            <span>Endereço:</span>
            <input
              type="text"
              value={AdressServer}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setAdressServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Diretorio:</span>
            <input
              type="text"
              value={Directory}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setDirectory(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Usuário:</span>
            <input
              type="text"
              value={UserServer}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setUserServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Senha:</span>
            <input
              type="text"
              value={PasswordServer}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPasswordServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Porta:</span>
            <input
              type="number"
              value={PortServer}
              className="border-[1px] border-gray-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPortServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Segurança:</span>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="ssl"
                  checked={SecurityServer === 'ssl'}
                  onChange={(e) => {
                    setSecurityServer(e.target.value) // Atualiza o estado com o novo array
                  }}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                ssl
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="tls"
                  checked={SecurityServer === 'tls'}
                  onChange={(e) => {
                    setSecurityServer(e.target.value) // Atualiza o estado com o novo array
                  }}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                tsl
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="null"
                  checked={SecurityServer === 'null' || SecurityServer === 'nenhu'}
                  onChange={(e) => {
                    setSecurityServer(e.target.value) // Atualiza o estado com o novo array
                  }}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                Nenhuma
              </label>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>Passivo/Ativo:</span>
            <button
              onClick={handleClick}
              className={`relative w-12 h-6 flex items-center rounded-full transition-colors ${
                isEnabledModeTransfer ? 'bg-sky-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  isEnabledModeTransfer ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-end mt-10 border-t-[1px] border-gray-200 pt-4 w-full gap-4">
        <Button onClick={handleUpdateSettingsTransmition}>
          <ArrowsClockwise size={24} />
          Atualizar
        </Button>
        <Button onClick={handleClickSend}>
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
