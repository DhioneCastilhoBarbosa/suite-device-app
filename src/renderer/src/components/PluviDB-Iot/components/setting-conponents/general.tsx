import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'

type Props = {
  handleUpdateSettingsGeneral: () => void
  handleSendSettingsGeneral: (settings: string[]) => void
  receivedDeviceName: string | undefined
  receivedGeolocation: string | undefined
  receivedTimeZone: string | undefined
  receivedTime: string | undefined
}

export function General({
  handleSendSettingsGeneral,
  receivedDeviceName,
  receivedGeolocation,
  receivedTimeZone,
  receivedTime,
  handleUpdateSettingsGeneral
}: Props): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)
  const [name, setName] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [altitude, setAltitude] = useState('')
  const [timeZone, setTimeZone] = useState('')
  const [time, setTime] = useState('')
  const [Date, setDate] = useState('')

  const toggleSwitch = (): void => {
    setIsEnabled(!isEnabled)
    //console.log('Switch está:', !isEnabled ? 'Ligado' : 'Desligado')
    //console.log('Timezone:', timeZone)
  }

  function handleClickSend(): void {
    handleSendSettingsGeneral &&
      handleSendSettingsGeneral([
        name,
        `${latitude};${longitude};${altitude}`,
        timeZone,
        `${Date} ${time}`
      ])
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateSettingsGeneral()
      //console.log('Atualizando campos...')
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (receivedDeviceName) {
      console.log('Nome do dispositivo:', receivedDeviceName)
      setName(receivedDeviceName?.replace('nd=', '').replace('!', ''))
    }
    if (receivedGeolocation) {
      const cleanReceivedGeolocation = receivedGeolocation?.replace('gl=', '').replace('!', '')
      const valuesArray = cleanReceivedGeolocation.split(';')
      if (valuesArray.length >= 3) {
        setLatitude(valuesArray[0])
        setLongitude(valuesArray[1])
        setAltitude(valuesArray[2])
      }
    }
    if (receivedTimeZone) {
      setTimeZone(receivedTimeZone?.replace('tz=', '').replace('!', ''))
    }
    if (receivedTime) {
      const cleanString = receivedTime?.replace('dt=', '').replace('!', '') // Removendo "dt=" e "!"
      const [date, time] = cleanString.split(' ') // Separando por espaço

      setTime(time)
      setDate(date)
    }
  }, [receivedDeviceName, receivedGeolocation, receivedTimeZone, receivedTime])

  return (
    <div className="flex flex-col gap-4 p-2 mt-4 mb-4">
      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">Dispositivo</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Nome do dispositivo:</span>
            <input
              type="text"
              value={name}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">Geolocalização</span>
        <div className="flex flex-col justify-center items-center ">
          <div className="flex flex-row justify-between items-center gap-3 m-2 w-64">
            <span>Latitude:</span>
            <input
              type="text"
              value={latitude}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2 w-64">
            <span>Longitude:</span>
            <input
              type="text"
              value={longitude}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2 w-64">
            <span>Altura:</span>
            <input
              type="text"
              value={altitude}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setAltitude(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">Data e hora</span>
        <div className="flex flex-col">
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Usar hora UTC:</span>
            <button
              onClick={() => {
                if (isEnabled) {
                  setTimeZone('0') // Salva o valor atual antes de desativar UTC
                }
                toggleSwitch()
              }}
              className={`relative w-12 h-6 flex items-center rounded-full transition-colors ${
                isEnabled ? 'bg-sky-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {!isEnabled && (
            <div className="flex flex-row justify-start items-center gap-3 m-2">
              <span>Time zone:</span>
              <input
                type="text"
                value={timeZone}
                className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
                onChange={(e) => setTimeZone(e.target.value)}
              />
            </div>
          )}
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Data:</span>
            <input
              type="text"
              value={Date}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Hora:</span>
            <input
              type="text"
              value={time}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 border-t-[1px] border-gray-200 pt-4 w-full gap-4">
        <Button onClick={handleUpdateSettingsGeneral}>
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
