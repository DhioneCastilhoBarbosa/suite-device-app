import { DownloadSimple, FolderOpen, UploadSimple } from '@phosphor-icons/react'
import { Device } from '@renderer/Context/DeviceContext'
import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import selectFile from '@renderer/utils/fileUtils'
import { IdModBus, WriteModbus, readModbusData } from '@renderer/utils/modbusRTU'
import { useEffect, useState } from 'react'

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false)
  const [titleLoading, setTitleLoading] = useState('Baixando informações do dispositivo!')

  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="grid grid-cols-3 gap-2 h-full mt-4">
        <div className="flex flex-col w-52">
          <label>Endereço SDI-12</label>
          <input
            type="number"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={1}
            inputMode="numeric"
          />
        </div>

        <div className="flex flex-col w-52">
          <label>Tempo de Display</label>
          <input
            type="number"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={1}
            inputMode="numeric"
          />
        </div>

        <div className="flex flex-col w-52">
          <label>Tempo de Dados (min)</label>
          <input
            type="number"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={1}
            inputMode="numeric"
          />
        </div>
      </div>

      <LoadingData visible={isLoading} title={titleLoading} />
    </div>
  )
}
