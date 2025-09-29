import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'
import { t } from 'i18next'

type Props = {
  handleUpdateSettingsGeneral: () => void
  handleSendSettingsGeneral: (settings: string[]) => void
  receivedDeviceName: string | undefined
  receivedGeolocation: string | undefined
  receivedTimeZone: string | undefined
  receivedTime: string | undefined
  receivedHeritage: string | undefined
  receivedRepeatSync: string | undefined
  receivedNtp: string | undefined
}

export function General({
  handleSendSettingsGeneral,
  receivedDeviceName,
  receivedGeolocation,
  receivedTimeZone,
  receivedTime,
  receivedHeritage,
  receivedRepeatSync,
  receivedNtp,
  handleUpdateSettingsGeneral
}: Props): JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false)
  const [name, setName] = useState('')
  const [heritage, setHeritage] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [altitude, setAltitude] = useState('')
  const [timeZone, setTimeZone] = useState('0')
  const [time, setTime] = useState('')
  const [Date, setDate] = useState('')
  const [repeatSync, setRepeatSync] = useState('')
  const [ntp, setNtp] = useState<string>('')

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
        repeatSync,
        ntp
      ])
  }

  const handleChange = (event): void => {
    let newValue = event.target.value

    // Converte para número, garantindo que seja dentro do intervalo
    if (newValue !== '') {
      newValue = Math.max(-12, Math.min(14, Number(newValue)))
    }

    setTimeZone(newValue)
    //console.log('Timezone alterado:', newValue)
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

    if (receivedNtp) {
      setNtp(receivedNtp?.replace('ntp=', '').replace('!', ''))
    }
  }, [
    receivedDeviceName,
    receivedGeolocation,
    receivedTimeZone,
    receivedTime,
    receivedHeritage,
    receivedRepeatSync,
    receivedNtp
  ])

  return (
    <div className="flex flex-col gap-4 p-2 mt-4 mb-4">
      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">{t('Dispositivo')}</span>
        <div className="flex flex-col w-3/4">
          <div className="flex flex-row justify-between items-center gap-3 m-2 ">
            <span>{t('Nome do dispositivo')}:</span>
            <input
              type="text"
              value={name}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Patrimônio')}:</span>
            <input
              type="text"
              value={heritage}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setHeritage(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">{t('Geolocalização')}</span>
        <div className="flex flex-col w-3/4">
          <div className="flex flex-row justify-between items-center gap-3 m-2 ">
            <span>{t('Latitude')}:</span>
            <input
              type="text"
              value={latitude}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2 ">
            <span>{t('Longitude')}:</span>
            <input
              type="text"
              value={longitude}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2 ">
            <span>{t('Altitude')}:</span>
            <input
              type="text"
              value={altitude}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setAltitude(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-md border-[1px] border-gray-200">
        <span className="w-full bg-gray-300 block pl-2">{t('Data e hora')}</span>
        <div className="flex flex-col w-3/4">
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Time zone')}:</span>
            <select
              value={timeZone}
              onChange={handleChange}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
            >
              <option value="-12">{t('UTC -12:00 - Baker Island, EUA')}</option>
              <option value="-11">{t('UTC -11:00 - Pago Pago, Samoa Americana')}</option>
              <option value="-10">{t('UTC -10:00 - Honolulu, Havaí, EUA')}</option>
              <option value="-9">{t('UTC -9:00 - Anchorage, Alasca, EUA')}</option>
              <option value="-8">{t('UTC -8:00 - Los Angeles, EUA')}</option>
              <option value="-7">{t('UTC -7:00 - Denver, EUA')}</option>
              <option value="-6">{t('UTC -6:00 - Cidade do México, México')}</option>
              <option value="-5">{t('UTC -5:00 - Nova York, EUA')}</option>
              <option value="-4">{t('UTC -4:00 - Caracas, Venezuela')}</option>
              <option value="-3">{t('UTC -3:00 - Brasília, Brasil')}</option>
              <option value="-2">{t('UTC -2:00 - Ilhas Geórgia do Sul')}</option>
              <option value="-1">{t('UTC -1:00 - Ponta Delgada, Portugal')}</option>
              <option value="0">{t('UTC ±0:00 - Londres, Reino Unido')}</option>
              <option value="1">{t('UTC +1:00 - Berlim, Alemanha')}</option>
              <option value="2">{t('UTC +2:00 - Atenas, Grécia')}</option>
              <option value="3">{t('UTC +3:00 - Moscou, Rússia')}</option>
              <option value="4">{t('UTC +4:00 - Dubai, Emirados Árabes')}</option>
              <option value="5">{t('UTC +5:00 - Islamabad, Paquistão')}</option>
              <option value="6">{t('UTC +6:00 - Daca, Bangladesh')}</option>
              <option value="7">{t('UTC +7:00 - Bangkok, Tailândia')}</option>
              <option value="8">{t('UTC +8:00 - Pequim, China')}</option>
              <option value="9">{t('UTC +9:00 - Tóquio, Japão')}</option>
              <option value="10">{t('UTC +10:00 - Sydney, Austrália')}</option>
              <option value="11">{t('UTC +11:00 - Honiara, Ilhas Salomão')}</option>
              <option value="12">{t('UTC +12:00 - Wellington, Nova Zelândia')}</option>
              <option value="13">{t("UTC +13:00 - Nuku'alofa, Tonga")}</option>
              <option value="14">{t('UTC +14:00 - Kiritimati, Kiribati')}</option>
            </select>
          </div>

          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Data:')}</span>
            <input
              type="text"
              value={Date}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setDate(e.target.value)}
              disabled
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('Hora:')}</span>
            <input
              type="text"
              value={time}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 text-center"
              onChange={(e) => setTime(e.target.value)}
              disabled
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2">
            <span>{t('NTP:')}</span>
            <input
              type="text"
              value={ntp}
              className="border-[1px] border-gray-200 p-1 rounded-lg focus:outline-sky-300 w-56 text-center"
              onChange={(e) => setNtp(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-between items-center gap-3 m-2 mb-3">
            <span>{t('Repetir sincronização a cada 24h:')}</span>

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
                {t('Sim')}
              </label>

              <label className="flex items-center">
                <input
                  type="radio"
                  value="0"
                  checked={repeatSync === '0'}
                  onChange={(e) => setRepeatSync(e.target.value)}
                  className="mr-2 peer h-4 w-4 border-gray-300 text-sky-500 focus:ring-sky-500"
                />
                {t('Não')}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-3 border-t-[1px] border-gray-200 pt-4 w-full gap-4">
        <Button onClick={handleUpdateSettingsGeneral}>
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
