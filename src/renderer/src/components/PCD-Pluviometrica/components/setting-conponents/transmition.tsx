import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useMemo, useState } from 'react'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

type Props = {
  handleUpdateSettingsTransmition: () => void
  handleSendSettingsTransmition: (settings: string[]) => void
  receivedTimerFixed: string | undefined
  receivedTimerdynamic: string | undefined
  receivedTimerMaintenance: string | undefined
  receivedProtocolInUse: string | undefined
  receivedDataProtocolMQTT: string | undefined
  receivedDataProtocolFTP: string | undefined
  receivedDataProtocolHTTP: string | undefined
}

export function Transmition({
  handleSendSettingsTransmition,
  handleUpdateSettingsTransmition,
  receivedTimerFixed,
  receivedTimerdynamic,
  receivedTimerMaintenance,
  receivedProtocolInUse,
  receivedDataProtocolMQTT,
  receivedDataProtocolFTP,
  receivedDataProtocolHTTP
}: Props): JSX.Element {
  const { i18n } = useTranslation()
  //const [isEnabledAuth, setIsEnabledAuth] = useState(false)
  const [isEnabledCertificate, setIsEnableCertificate] = useState(false)
  const [isEnabledModeTransfer, setIsEnableModeTransfer] = useState(false)
  const [selectedButton, setSelectedButton] = useState<string>('MQTT')

  const timeOptions = useMemo(
    () => [
      { label: t('0 minutos'), value: '0' },
      { label: t('1 minuto'), value: '1' },
      { label: t('2 minutos'), value: '2' },
      { label: t('3 minutos'), value: '3' },
      { label: t('4 minutos'), value: '4' },
      { label: t('5 minutos'), value: '5' },
      { label: t('10 minutos'), value: '10' },
      { label: t('15 minutos'), value: '15' },
      { label: t('30 minutos'), value: '30' },
      { label: t('1 hora'), value: '60' },
      { label: t('2 horas'), value: '120' },
      { label: t('3 horas'), value: '180' },
      { label: t('4 horas'), value: '240' },
      { label: t('6 horas'), value: '360' },
      { label: t('8 horas'), value: '480' },
      { label: t('12 horas'), value: '720' },
      { label: t('24 horas'), value: '1440' }
    ],
    [i18n.language]
  )
  const [TimerFixed, setTimerFixed] = useState('')
  const [TimerDynamic, setTimerDynamic] = useState('')
  const [TimerMaintenance, setTimerMaintenance] = useState('')
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
  const [HttpMethod, setHttpMethod] = useState('POST')
  const [HttpUrl, setHttpUrl] = useState('')
  const [HttpUser, setHttpUser] = useState('')
  const [HttpPass, setHttpPass] = useState('')
  const [HttpPort, setHttpPort] = useState('80')
  const [HttpSecurity, setHttpSecurity] = useState('null')

  //const [Authentication, setAuthentication] = useState('')

  const handleButtonClick = (buttonType: string): void => {
    setSelectedButton(buttonType)
  }

  function buildHttpPayload(): string {
    const meth = HttpMethod.toLowerCase().slice(0, 4)
    const url = HttpUrl.slice(0, 80)
    const port = HttpPort || (HttpSecurity === 'null' ? '80' : '443')
    const sec = HttpSecurity || 'null'
    const user = HttpUser.slice(0, 50)
    const pass = HttpPass.slice(0, 50)
    if (!user && !pass) {
      return `${meth};${url};${port};${sec}`
    }
    return `${meth};${url};${port};${sec};${user};${pass}`
  }

  function handleHttpSecurityChange(value: string): void {
    setHttpSecurity(value)
    setHttpPort(value === 'null' ? '80' : '443')
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
        TimerMaintenance,
        buildHttpPayload()
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
    if (receivedDataProtocolHTTP) {
      const cleanString = receivedDataProtocolHTTP.replace(/^http=/, '').replace(/!$/, '').trim()
      if (cleanString && !/^error/i.test(cleanString)) {
        const [meth = '', url = '', port = '', sec = '', user = '', pass = ''] =
          cleanString.split(';')
        const method = meth.trim().toLowerCase() === 'get' ? 'GET' : 'POST'
        const securityRaw = sec.trim()
        const security =
          !securityRaw || securityRaw === 'nenhu' || securityRaw === 'nenhuma'
            ? 'null'
            : securityRaw
        setHttpMethod(method)
        setHttpUrl(url.trim())
        setHttpPort(port.trim())
        setHttpSecurity(security)
        setHttpUser(user)
        setHttpPass(pass)
      }
    }
  }, [
    receivedTimerFixed,
    receivedTimerdynamic,
    receivedTimerMaintenance,
    receivedProtocolInUse,
    receivedDataProtocolMQTT,
    receivedDataProtocolFTP,
    receivedDataProtocolHTTP
  ])

  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-center item-center w-2/3">
        <div className="flex flex-row  justify-between items-center gap-3 m-2 w-2/3 ">
          <span>{t('Timer fixo:')}</span>
          <select
            id="time-select"
            value={TimerFixed}
            onChange={(e) => setTimerFixed(e.target.value)}
            className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2 w-2/3">
          <span>{t('Timer com chuva:')}</span>

          <select
            id="time-select"
            value={TimerDynamic}
            onChange={(e) => setTimerDynamic(e.target.value)}
            className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-row justify-between items-center gap-3 m-2 w-2/3">
          <span>{t('Timer manutenção:')}</span>

          <select
            id="time-select"
            value={TimerMaintenance}
            onChange={(e) => setTimerMaintenance(e.target.value)}
            className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-4 flex items-center justify-center gap-4 border-y border-sky-100 py-4">
        <span>{t('Tipo de transmissão:')}</span>
        <div className="flex flex-wrap gap-2">
          <Button
            size="medium"
            filled={selectedButton === 'FTP'}
            className="min-w-[5.5rem]"
            onClick={() => handleButtonClick('FTP')}
          >
            FTP
          </Button>
          <Button
            size="medium"
            filled={selectedButton === 'MQTT'}
            className="min-w-[5.5rem]"
            onClick={() => handleButtonClick('MQTT')}
          >
            MQTT
          </Button>
          <Button
            size="medium"
            filled={selectedButton === 'HTTP'}
            className="min-w-[5.5rem]"
            onClick={() => handleButtonClick('HTTP')}
          >
            HTTP
          </Button>
        </div>
      </div>
      {selectedButton === 'MQTT' ? (
        <div className="flex flex-col justify-center item-center w-2/3 m-2">
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Broker:')}</span>
            <input
              type="text"
              value={Broker}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setBroker(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Publish:')}</span>
            <input
              type="text"
              value={Publish}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPublish(e.target.value)}
              disabled
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Subscribe:')}</span>
            <input
              type="text"
              value={Subscribe}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setSubscribe(e.target.value)}
              disabled
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Porta:')}</span>
            <input
              type="number"
              value={Port}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPort(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Usuário:')}</span>
            <input
              type="text"
              value={User}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Senha:')}</span>
            <input
              type="text"
              value={Password}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Segurança:')}</span>
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
                TLS
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
                {t('Nenhuma')}
              </label>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Certificado:')}</span>
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
      ) : selectedButton === 'HTTP' ? (
        <div className="flex flex-col justify-center item-center w-2/3 m-2">
          <div className="grid w-full items-center justify-between gap-x-3 [grid-template-columns:auto_max-content]">
            <span className="m-2">{t('Método')}:</span>
            <div className="relative m-2 w-max">
              <input
                type="text"
                tabIndex={-1}
                aria-hidden
                readOnly
                className="invisible block border border-sky-200 p-1 rounded-lg pointer-events-none"
              />
              <select
                value={HttpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
                className="absolute inset-0 box-border h-full w-full min-w-0 max-w-full border border-sky-200 p-1 rounded-lg focus:outline-sky-300"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <span className="m-2">{t('Endereço:')}</span>
            <input
              type="text"
              maxLength={80}
              value={HttpUrl}
              className="m-2 border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setHttpUrl(e.target.value.slice(0, 80))}
            />

            <span className="m-2">{t('Usuário:')}</span>
            <input
              type="text"
              maxLength={50}
              value={HttpUser}
              className="m-2 border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setHttpUser(e.target.value.slice(0, 50))}
            />

            <span className="m-2">{t('Senha:')}</span>
            <input
              type="text"
              maxLength={50}
              value={HttpPass}
              className="m-2 border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setHttpPass(e.target.value.slice(0, 50))}
            />

            <span className="m-2">{t('Porta:')}</span>
            <div className="relative m-2 w-max">
              <input
                type="text"
                tabIndex={-1}
                aria-hidden
                readOnly
                className="invisible block border border-sky-200 p-1 rounded-lg pointer-events-none"
              />
              <input
                type="number"
                min={1}
                max={65535}
                value={HttpPort}
                className="absolute inset-0 box-border h-full w-full min-w-0 max-w-full border border-sky-200 p-1 rounded-lg focus:outline-sky-300"
                onChange={(e) => setHttpPort(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Segurança:')}</span>
            <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="ssl"
                checked={HttpSecurity === 'ssl'}
                onChange={(e) => handleHttpSecurityChange(e.target.value)}
                className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
              />
              SSL
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="tls"
                checked={HttpSecurity === 'tls'}
                onChange={(e) => handleHttpSecurityChange(e.target.value)}
                className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
              />
              TLS
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="null"
                checked={HttpSecurity === 'null' || HttpSecurity === 'nenhu' || HttpSecurity === 'nenhuma'}
                onChange={(e) => handleHttpSecurityChange(e.target.value)}
                className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
              />
              {t('Nenhuma')}
            </label>
            {HttpSecurity === 'tls_insecure' && (
              <label className="flex items-center">
                <input
                  type="radio"
                  value="tls_insecure"
                  checked
                  onChange={(e) => handleHttpSecurityChange(e.target.value)}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                TLS insecure
              </label>
            )}
          </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center item-center w-2/3 m-2">
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Endereço:')}</span>
            <input
              type="text"
              value={AdressServer}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setAdressServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Diretorio:')}</span>
            <input
              type="text"
              value={Directory}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setDirectory(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Usuário:')}</span>
            <input
              type="text"
              value={UserServer}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setUserServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Senha:')}</span>
            <input
              type="text"
              value={PasswordServer}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPasswordServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Porta:')}</span>
            <input
              type="number"
              value={PortServer}
              className="border border-sky-200 p-1 rounded-lg  focus:outline-sky-300"
              onChange={(e) => setPortServer(e.target.value)}
            />
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Segurança:')}</span>
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
                SSL
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
                TLS
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
                {t('Nenhuma')}
              </label>
            </div>
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Passivo/Ativo:')}</span>
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
      <div className="mt-10 flex w-full justify-end gap-4 border-t border-sky-100 pb-4 pt-4">
        <Button onClick={handleUpdateSettingsTransmition}>
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
        <Button onClick={handleClickSend}>
          <UploadSimple size={24} />
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
