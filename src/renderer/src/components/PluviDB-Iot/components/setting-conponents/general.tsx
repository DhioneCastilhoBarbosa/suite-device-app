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
  receivedHeritage: string | undefined
  receivedRepeatSync: string | undefined
}

export function General({
  handleSendSettingsGeneral,
  receivedDeviceName,
  receivedGeolocation,
  receivedTimeZone,
  receivedTime,
  receivedHeritage,
  receivedRepeatSync,
  handleUpdateSettingsGeneral
}: Props): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)
  const [name, setName] = useState('')
  const [heritage, setHeritage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [altitude, setAltitude] = useState('')
  const [timeZone, setTimeZone] = useState('')
  const [time, setTime] = useState('')
  const [Date, setDate] = useState('')
  const [repeatSync, setRepeatSync] = useState('1')

  const toggleSwitch = (): void => {
    setIsEnabled(!isEnabled)
  }

  function handleClickSend(): void {
    handleSendSettingsGeneral &&
      handleSendSettingsGeneral([
        name,
        `${latitude};${longitude};${altitude}`,
        timeZone,
        `${Date} ${time}`,
        heritage,
        repeatSync
      ])
  }

  const handleChange = (event): void => {
    let newValue = event.target.value

    // Converte para número, garantindo que seja dentro do intervalo
    if (newValue !== '') {
      newValue = Math.max(-12, Math.min(12, Number(newValue)))
    }

    setTimeZone(newValue)
  }

  const handleClick = (): void => {
    //console.log('Antes de alterar:', timeZone) // Log antes de alterar
    if (isEnabled) {
      setTimeZone('0')
    }
    toggleSwitch()
    //console.log('Depois de alterar:', timeZone) // Log imediatamente após a tentativa de alteração
  }

  useEffect(() => {
    if (isEnabled) {
      setTimeZone('0')
    }
    //console.log('Timezone alterado:', timeZone)
  }, [isEnabled]) // Isso será disparado sempre que isEnabled mudar

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateSettingsGeneral()
      //console.log('Atualizando campos...')
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (receivedDeviceName) {
      // console.log('Nome do dispositivo:', receivedDeviceName)
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

    if (receivedHeritage) {
      setHeritage(receivedHeritage?.replace('patrimonio=', '').replace('!', ''))
    }

    if (receivedRepeatSync) {
      setRepeatSync(receivedRepeatSync?.replace('resinc=', '').replace('!', ''))
    }
  }, [
    receivedDeviceName,
    receivedGeolocation,
    receivedTimeZone,
    receivedTime,
    receivedHeritage,
    receivedRepeatSync
  ])

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
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Patrimônio:</span>
            <input
              type="text"
              value={heritage}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setHeritage(e.target.value)}
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
              onClick={handleClick}
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
                type="number"
                value={timeZone}
                min="-12"
                max="12"
                className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
                onChange={handleChange}
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
              disabled
            />
          </div>
          <div className="flex flex-row justify-start items-center gap-3 m-2">
            <span>Hora:</span>
            <input
              type="text"
              value={time}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300"
              onChange={(e) => setTime(e.target.value)}
              disabled
            />
          </div>
          <div className="flex flex-row justify-start items-center gap-3 m-2 mb-3">
            <span>Repetir sincronização a cada 24h:</span>

            {/* Radio buttons para os tipos */}
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="1"
                  checked={repeatSync === '1'}
                  onChange={(e) => setRepeatSync(e.target.value)}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                Sim
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="0"
                  checked={repeatSync === '0'}
                  onChange={(e) => setRepeatSync(e.target.value)}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                Não
              </label>
            </div>
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
