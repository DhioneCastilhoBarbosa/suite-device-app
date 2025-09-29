import { ArrowsClockwise, Eye, EyeClosed, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'
import { t } from 'i18next'

type Props = {
  receiverTxPowerLevel: string | undefined
  handleSendSettings: (settings: string[]) => void
  handleUpdateSettings: () => void
}

export function RFAdvanced({
  receiverTxPowerLevel,
  handleSendSettings,
  handleUpdateSettings
}: Props): JSX.Element {
  const [TX100BPS, setTX100BPS] = useState<string>('37.00')
  const [TX300BPS, setTX300BPS] = useState<string>('37.00')
  const [TX1200BPS, setTX1200BPS] = useState<string>('37.00')
  const [Password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState(false)
  const [isvalidatePassword, setIsValidatePassword] = useState(false)
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false)

  const handleInputChange = (id: string, value: string): void => {
    //console.log(value)
    switch (id) {
      case 'TX100BPS':
        setTX100BPS(value)

        break
      case 'TX300BPS':
        setTX300BPS(value)

        break
      case 'TX1200BPS':
        setTX1200BPS(value)
        break

      case 'Password':
        setPassword(value)
        validatePassword(value)
        break
      default:
        break
    }
  }

  const handleBlur = (id: string, value: string): void => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      handleInputChange(id, numValue.toFixed(2).replace(',', '.'))
    }
  }

  function validatePassword(value): void {
    if (value === '' || value !== 'techmode alpha') {
      setIsValidatePassword(true)
    } else {
      setIsValidatePassword(false)
    }
  }

  const validate = (): void => {
    if (Password !== 'techmode alpha') {
      setIsPasswordInvalid(true)
    } else {
      setIsPasswordInvalid(false)
      // Continue with the send setting logic
    }
  }

  function loadVariables(TxPower: string): void {
    if (TxPower) {
      const loadedDataTxPowerLevel = TxPower.split('\r\n').map((item) => item.trim())
      const DataTxPowerLevel = loadedDataTxPowerLevel[1].split(',').map((item) => item.trim())
      //setDataTxPowerLevel(DataTxPowerLevel)

      setTX100BPS(DataTxPowerLevel[0] ? DataTxPowerLevel[0].replace('PWRLVL=', '') : '37.00')
      setTX300BPS(DataTxPowerLevel[1] ? DataTxPowerLevel[1] : '37.00')
      setTX1200BPS(DataTxPowerLevel[2] ? DataTxPowerLevel[2].replace('>', '') : '37.00')
    }
  }

  function handleSendSetting(): void {
    validate()
    if (isvalidatePassword) {
      return
    } else {
      const settingsArray = [TX100BPS, TX300BPS, TX1200BPS, Password]
      handleSendSettings(settingsArray)
    }
  }
  useEffect(() => {
    handleUpdateSettings()
  }, [])

  useEffect(() => {
    loadVariables(receiverTxPowerLevel ?? '')
  }, [receiverTxPowerLevel])

  return (
    <div className=" w-full flex flex-col mt-28 mb-8">
      <label className="bg-sky-500 text-white w-full text-center font-bold text-xl rounded-t-md">
        {t('Nivel de Potencia RF')}
      </label>
      <div className="border-[1px] border-sky-500 rounded-b-md ">
        <div className="flex gap-4 p-4 mt-10">
          <div className=" flex flex-row justify-center items-center border border-sky-500 w-auto p-4 rounded-md gap-2  bg-sky-500 ">
            <input
              id="TX100BPS"
              className="border border-sky-500 rounded-md p-2 text-center h-7 w-36"
              type="number"
              step="0.01"
              value={TX100BPS}
              min={32}
              max={38}
              onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              onBlur={(e) => handleBlur(e.target.id, e.target.value)}
            />
            <label className="font-semibold w-36 text-white"> 100bps</label>
            <div className="flex flex-col w-full ">
              <label className="font-normal text-white"> {t('Min')}: 32</label>
              <label className="font-normal text-white">{t('Max')}: 38</label>
            </div>
          </div>

          <div className=" flex flex-row justify-center items-center border border-sky-500 w-auto p-4 rounded-md gap-2  bg-sky-500">
            <input
              id="TX300BPS"
              className="border border-sky-500 rounded-md p-2 text-center h-7 w-36"
              type="number"
              step="0.01"
              min={32}
              max={38}
              value={TX300BPS}
              onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              onBlur={(e) => handleBlur(e.target.id, e.target.value)}
            />
            <label className="font-semibold w-36 text-white"> 300 bps</label>
            <div className="flex flex-col w-full ">
              <label className="font-normal text-white"> {t('Min')}: 32</label>
              <label className="font-normal text-white">{t('Max')}: 38</label>
            </div>
          </div>

          <div className=" flex flex-row justify-center items-center border border-sky-500 w-auto p-4 rounded-md gap-2  bg-sky-500">
            <input
              id="TX1200BPS"
              className="border border-sky-500 rounded-md p-2 text-center h-7 w-36"
              type="number"
              step="0.01"
              min={32}
              max={38}
              value={TX1200BPS}
              onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              onBlur={(e) => handleBlur(e.target.id, e.target.value)}
            />
            <label className="font-semibold w-36 text-white"> 1200 bps</label>
            <div className="flex flex-col w-full ">
              <label className="font-normal text-white"> {t('Min')}: 32</label>
              <label className="font-normal text-white">{t('Max')}: 38</label>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-4 mr-4 ml-4 mb-10 ">
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-semibold text-sm">{t('Senha')}:</label>
            <div className=" flex flex-row border border-sky-500 rounded-md ">
              <input
                id="Password"
                className="p-2 text-center h-7 w-48 outline-none"
                type={showPassword ? 'text' : 'password'}
                value={Password}
                onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                placeholder={t('Digite a senha')}
              />
              <span
                className="flex items-center cursor-pointer mr-2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={24} /> : <EyeClosed size={24} />}
              </span>
            </div>
            {isPasswordInvalid ? (
              <span className=" text-red-500 ">{t('Senha inválida')}</span>
            ) : (
              <span className="h-5 inline-block"></span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end mt-4 gap-2">
        <Button filled={false} size={'medium'} onClick={handleUpdateSettings}>
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
        <Button filled={false} size={'medium'} className="text-[12px]" onClick={handleSendSetting}>
          <UploadSimple size={24} />
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
