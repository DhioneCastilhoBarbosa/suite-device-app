import Button from '@renderer/components/button/Button'
import Antenna from './../../../assets/antenna.png'
import AntennaUP from './../../../assets/antennaUP.png'
import { useEffect, useState } from 'react'

type Props = {
  handlePositiom: () => void
  receiverPOS: string | undefined
  receiverGPS: string | undefined
}
export function AntenaPointing({ handlePositiom, receiverGPS, receiverPOS }: Props): JSX.Element {
  const [Latitude, setLatitude] = useState<string>('0.0')
  const [Longitude, setLongitude] = useState<string>('0.0')
  const [Azimute, setAzimute] = useState<string>('0.0')
  const [Elevation, setElevation] = useState<string>('0.0')
  const [dataGps, setDataGps] = useState<string[]>([])
  const [dataPos, setDataPos] = useState<string[]>([])
  const [gpsFixed, setGpsFixed] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  function calculateAzimuthAndElevation(): void {
    const Lat = parseFloat(Latitude)
    const Long = parseFloat(Longitude)

    let AH = 0
    const SO = 75
    const Pi_180 = Math.PI / 180

    const SA = Long * -1
    const AA = Lat

    const Aa = AA
    const Sa = SA

    AH = AH * 3.3

    const A = 90 - Aa
    const T = SO - Sa
    const TR = T * Pi_180
    let BR = 90 * Pi_180
    const AR = A * Pi_180
    const X = Math.cos(AR) * Math.cos(BR) + Math.sin(AR) * Math.sin(BR) * Math.cos(TR)
    const CR = -Math.atan(X / Math.sqrt(-X * X + 1)) + Math.PI / 2

    const C = CR / Pi_180
    const X1 = (Math.sin(BR) * Math.sin(TR)) / Math.sin(CR)
    BR = Math.atan(X1 / Math.sqrt(-X1 * X1 + 1))
    let B = BR / Pi_180

    if (T < 0 && Aa > 0) {
      B = B + 180
    }
    if (T < 0 && Aa < 0) {
      B = B * -1
    }
    if (T > 0 && Aa < 0) {
      B = 360 - B
    }
    if (T > 0 && Aa > 0) {
      B = B + 180
    }
    if (T === 0 && Aa > 0) {
      B = 180
    }
    if (T === 0 && Aa < 0) {
      B = 360
    }
    if (Aa === 0 && T > 0) {
      B = 270
    }
    if (Aa === 0 && T < 0) {
      B = 90
    }

    const A1 = 90 - C
    const R1 = A1 * Pi_180
    const S1 = (6378 + AH * 0.0003048) / Math.sin(R1)
    const S2 = 35785 + 6578 - S1
    const a2 = 180 - A1
    const r2 = a2 * Pi_180
    const S4 = Math.sqrt(S1 * S1 - Math.pow(6378 + AH * 0.0003048, 2))
    const S3 = Math.sqrt(Math.pow(S4, 2) + Math.pow(S2, 2) - 2 * S4 * S2 * Math.cos(r2))
    const X2 = (Math.sin(r2) / S3) * S2
    const ER = Math.atan(X2 / Math.sqrt(-X2 * X2 + 1))
    const E = ER / Pi_180

    const Azimute = Math.floor(B).toString()
    const Elevation = Math.floor(E).toString()

    setAzimute(Azimute)
    setElevation(Elevation)
  }

  const handleInputChange = (id: string, value: string): void => {
    const regex = /^-?\d*\.?\d*$/
    if (!regex.test(value)) {
      return
    }

    switch (id) {
      case 'Latitude':
        setLatitude(value)
        break
      case 'Longitude':
        setLongitude(value)
        break
      default:
        break
    }
  }

  const handleUpdateCoordinates = (): void => {
    if (gpsFixed) {
      console.log('No GPS fix waiting for GPS fix')
      setIsVisible(true)
    } else {
      handlePositiom()
      setIsVisible(false)
    }
  }

  useEffect(() => {
    calculateAzimuthAndElevation()
  }, [Longitude, Latitude])

  useEffect(() => {
    if (dataPos[2]) {
      const loadedData = dataPos[2] ? dataPos[2].replace('Lat:', '') : '0.0'
      setLatitude(loadedData)
    }
    if (dataPos[3]) {
      const loadedData = dataPos[3] ? dataPos[3].replace('Long:', '') : '0.0'
      setLongitude(loadedData)
    }
    calculateAzimuthAndElevation()
  }, [dataGps, dataPos])

  useEffect(() => {
    if (receiverPOS) {
      const loadedDataRST = receiverPOS.split('\r\n').map((item) => item.trim())
      if (loadedDataRST.includes('No GPS fix')) {
        console.log('No GPS fix')
        setGpsFixed(true)
        setIsVisible(true)
      } else {
        setDataPos(loadedDataRST)
        setGpsFixed(false)
        setIsVisible(false)
      }
    }
    if (receiverGPS) {
      const loadedDataTIME = receiverGPS.split('\r\n').map((item) => item.trim())
      setDataGps(loadedDataTIME)
    }
  }, [receiverGPS, receiverPOS])

  return (
    <div className=" flex flex-col w-full justify-center items-center mt-4">
      <div className=" flex w-full ">
        <label className="bg-sky-500 text-white w-full text-center font-bold text-xl rounded-t-md">
          Apontamento da antena
        </label>
      </div>
      <div className="flex flex-col w-full gap-2 border-[1px] border-sky-500 pt-8 items-start rounded-b-md">
        <div className="flex flex-row justify-around items-center w-full">
          <div className="flex flex-row gap-1 justify-center items-center">
            <img src={Antenna} alt="" className="w-64" />
            <div className="flex flex-row gap-1 mb-14">
              <span className="font-semibold">Elevação:</span>
              <span className="bg-sky-500 text-white px-2 rounded-sm">{Elevation}°</span>
            </div>
          </div>

          <div className="flex flex-row gap-1 justify-center items-center">
            <img src={AntennaUP} alt="" className="w-[270px]" />
            <div className="flex flex-row gap-1 mb-14">
              <span className="font-semibold">Azimute:</span>
              <span className="bg-sky-500 text-white px-2 rounded-sm">{Azimute}°</span>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full">
          <div className=" flex flex-row justify-end bg-sky-500 w-full p-2 gap-4">
            <div className="flex flex-row w-full ">
              {isVisible && (
                <span className="text-black bg-yellow-200 font-semibold px-2 rounded-sm">
                  GPS não esta sincronizado, aguarde...
                </span>
              )}
            </div>
            <div className="flex flex-row gap-2 w-1/3">
              <label className="text-white w-20">Latitude:</label>
              <input
                id="Latitude"
                className="w-24 text-center"
                type="text"
                value={Latitude}
                onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              />
            </div>
            <div className="flex flex-row gap-2 w-1/3">
              <label className="text-white w-20">Longitude:</label>
              <input
                id="Longitude"
                className="w-24 text-center"
                type="text"
                value={Longitude}
                onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row w-full justify-end gap-4 pr-2">
          <Button
            filled={false}
            size={'medium'}
            className="text-[12px] disabled:cursor-not-allowed"
            onClick={handleUpdateCoordinates}
            disabled={isVisible}
          >
            Atualizar coordenada
          </Button>
          {/*<Button
            filled={false}
            size={'medium'}
            className="text-[12px]"
            onClick={calculateAzimuthAndElevation}
          >
            Calcular
          </Button>*/}
        </div>
      </div>
    </div>
  )
}
