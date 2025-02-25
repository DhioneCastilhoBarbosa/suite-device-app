import { BatteryFull, CellSignalFull, DownloadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'

type Props = {
  receiverVER?: string | undefined
  receiverRST?: string | undefined
  receiverTIME?: string | undefined
  receiverTEMP?: string | undefined
  refreshInformation?: () => void
}

export default function Status(): JSX.Element {
  const data = [
    { id: 1, name: 'Nome:', value: 'pcd_teste_Novo' },
    { id: 2, name: 'Data e hora:', value: '22/02/2025 00:58:53' },
    { id: 3, name: 'IP:', value: '192.168.1.1' },
    { id: 4, name: 'ICCID:', value: '---' },
    { id: 5, name: 'IMEI:', value: '3677670980997897' },
    { id: 6, name: 'Número de série:', value: 'PNB00001' },
    { id: 7, name: 'Versão do Firmware:', value: '1.0.1' },
    { id: 8, name: 'Versão do hardware:', value: '2.0.0' },
    { id: 9, name: 'Contador de boot:', value: '---' },
    { id: 10, name: 'Start time:', value: '22/02/2025 00:56:28' }
  ]

  return (
    <div className="flex flex-col mt-4">
      <div className="flex flex-row justify-evenly bg-sky-500 h-auto rounded-md ">
        <div className="flex flex-col justify-center  bg-white m-2 rounded-md border-4 border-white">
          <div className="flex flex-row justify-center items-end gap-8 p-2 border-2 border-sky-500 rounded-t-md min-w-56">
            <div>
              <span className="flex flex-row justify-center items-baseline font-bold text-base ml-2 mb-6">
                Claro BR - LTE-M
              </span>
            </div>
            <div className="mt-2 text-sky-500">
              <CellSignalFull size={62} />
              <span>-94 dBm </span>
            </div>
          </div>
          <div className="flex flex-row justify-center items-center w-full bg-sky-500 p-1  rounded-b-md">
            <span className=" font-light text-white">Registered, home network</span>
          </div>
        </div>
        <div className="flex flex-col justify-center  bg-white m-2 rounded-md border-4 border-white">
          <div className="flex flex-col justify-center items-center gap-2 p-2 border-2 border-sky-500 rounded-md h-full min-w-56">
            <div className=" text-sky-500">
              <BatteryFull size={62} />
            </div>
            <span className="flex flex-row justify-center items-baseline font-bold text-base ml-2 ">
              +3.58 Volts
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center  bg-white m-2 rounded-md border-4 border-white">
          <div className="flex flex-col justify-center items-center gap-2 p-2 border-2 border-sky-500 rounded-md h-full min-w-56 gap-2">
            <span className="flex flex-row justify-center items-baseline font-bold text-base ml-2 text-sky-500">
              Tranmissão
            </span>
            <div className="flex flex-row justify-center items-center gap-2">
              <span>Protocolo utilizado:</span>
              <span className="font-bold">MQTT</span>
            </div>

            <div className="flex flex-col justify-center items-center gap-2">
              <span>Ultima transmissão:</span>
              <span className="font-bold">22/02/2025 00:56:28</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-evenly bg-white h-auto rounded-md mt-4 border-2 border-sky-500">
        <div className="bg-sky-500 text-white p-2 ">
          <span className="font-bold">Relatório:</span>
        </div>
        <div className="flex flex-row justify-between items-center my-4 mx-10">
          <div className="flex flex-col justify-center items-start gap-2">
            <div className="flex flex-row gap-2">
              <span className="font-bold">Número de registros:</span>
              <span>9</span>
            </div>
            <div className="flex flex-row gap-2">
              <span>Memoria utilizada:</span>
              <span>0.00002</span>
            </div>
          </div>
          <Button
            size={'medium'}
            //onClick={handleDown}
            className="bg-white text-sky-500 px-1 py-6"
          >
            <DownloadSimple size={24} />
            Baixar informação
          </Button>
        </div>
      </div>
      <div className="my-4">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Informações do dispositivo</th>
                <th className="py-3 px-6 text-left"></th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left font-bold text-gray-500">{item.name}</td>
                  <td className="py-3 px-6 text-left font-semibold text-gray-400">{item.value}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 text-gray-700 text-sm leading-normal rounded-b-lg ">
                <td className="py-3 px-6 text-left rounded-bl-lg" colSpan="3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
