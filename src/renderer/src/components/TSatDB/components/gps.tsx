import { ArrowsClockwise } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'

type Props = {
  receiverRST: string | undefined
  receiverPOS: string | undefined
  receiverGPS: string | undefined
  handleUpdateGPS: () => void

  // clear: boolean | undefined
  // onClearReset: (newValue: boolean) => void
  // changeVariableMain: (value: string) => void
}

export default function Gps({
  receiverGPS,
  receiverPOS,
  receiverRST,
  handleUpdateGPS
}: Props): JSX.Element {
  const [dataGps, setDataGps] = useState<string[]>([])
  const [dataPos, setDataPos] = useState<string[]>([])
  const [dataRst, setDataRst] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState<boolean>(false)
  useEffect(() => {
    if (receiverRST) {
      const loadedDataVER = receiverRST.split('\r\n').map((item) => item.trim())
      setDataRst(loadedDataVER)
    }

    if (receiverPOS) {
      const loadedDataRST = receiverPOS.split('\r\n').map((item) => item.trim())
      if (loadedDataRST.includes('No GPS fix')) {
        setIsVisible(true)
      } else {
        setDataPos(loadedDataRST)
        setIsVisible(false)
      }
    }

    if (receiverGPS) {
      const loadedDataTIME = receiverGPS.split('\r\n').map((item) => item.trim())
      setDataGps(loadedDataTIME)
    }
  }, [receiverGPS, receiverPOS, receiverRST])

  useEffect(() => {
    const interval = setInterval(() => {
      handleUpdateGPS()
    }, 10000)

    return () => clearInterval(interval)
  }, [handleUpdateGPS])
  return (
    <div className="mt-4">
      <div className="flex flex-row justify-center items-center mb-4 w-full bg-yellow-200 rounded-sm">
        {isVisible && (
          <span className="text-black font-semibold">GPS não esta sincronizado, aguarde...</span>
        )}
      </div>
      <div className="flex flex-row gap-6 flex-wrap items-end justify-center ">
        <div className="flex flex-col w-40 ">
          <label className="text-md mb-1">Status GPS</label>
          <input
            className="border border-sky-500 rounded-md p-2 text-center h-7"
            type="text"
            value={dataRst[2] ? dataRst[2].replace('GPS:', '') : 'N/A'}
            readOnly
          />
        </div>

        <div className="flex flex-col w-40 ">
          <label className="text-md mb-1">Latitude</label>
          <input
            className="border border-sky-500 rounded-md p-2 text-center h-7"
            type="text"
            value={dataPos[2] ? dataPos[2].replace('Lat:', '') : 'N/A'}
            readOnly
          />
        </div>

        <div className="flex flex-col w-40 ">
          <label className="text-md mb-1">Longitude</label>
          <input
            className="border border-sky-500 rounded-md p-2 text-center h-7"
            type="text"
            value={dataPos[3] ? dataPos[3].replace('Long:', '') : 'N/A'}
            readOnly
          />
        </div>

        <div className="flex flex-col w-40 ">
          <label className="text-md mb-1">Altitude</label>
          <input
            className="border border-sky-500 rounded-md p-2 text-center h-7"
            type="text"
            value={dataPos[4] ? dataPos[4].replace('Alt:', '') : 'N/A'}
            readOnly
          />
        </div>

        <div className="flex flex-col w-40 ">
          <label className="text-md mb-1">Definir o intervalo de correção</label>
          <input
            className="border border-sky-500 rounded-md p-2 text-center h-7"
            type="text"
            value={'00:00:00'}
            readOnly
          />
        </div>

        <div className="flex flex-col w-40">
          <label className="text-md mb-1">GPS Data / Time - Fix</label>
          <input
            className="border border-sky-500 rounded-md p-2 text-center h-7"
            type="text"
            value={dataPos[1] ? dataPos[1].replace('Time of fix:', '') : 'N/A'}
            readOnly
          />
        </div>

        <div className="flex flex-col w-40 "></div>
        <div className="flex flex-col w-40 "></div>
        <div className="flex flex-col w-full ml-14 mr-14">
          <label className="font-bold bg-sky-500 text-white p-1 rounded-t-sm">Log:</label>
          <textarea
            name=""
            id=""
            value={receiverGPS}
            readOnly
            className="w-full border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap outline-none text-black text-sm h-60"
          ></textarea>
        </div>
        <div className="flex flex-row justify-end w-full ml-14 mr-14">
          <Button onClick={handleUpdateGPS}>
            <ArrowsClockwise size={24} />
            Atualizar
          </Button>
        </div>
      </div>
    </div>
  )
}
