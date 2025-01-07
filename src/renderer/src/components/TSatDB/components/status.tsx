import { useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
type Props = {
  receiverVER: string | undefined
  receiverRST: string | undefined
  receiverTIME: string | undefined
  receiverTEMP: string | undefined
  // clear: boolean | undefined
  // onClearReset: (newValue: boolean) => void
  // changeVariableMain: (value: string) => void
}

export default function Status({
  receiverVER,
  receiverRST,
  receiverTIME,
  receiverTEMP
}: Props): JSX.Element {
  const [dataVer, setDataVer] = useState<string[]>([])
  const [dataRst, setDataRst] = useState<string[]>([])
  const [dataTime, setDataTime] = useState<string[]>([])
  const [dataTemp, setDataTemp] = useState<string[]>([])

  //console.log(receiverVER)

  useEffect(() => {
    if (receiverVER) {
      const loadedDataVER = receiverVER.split('\r\n').map((item) => item.trim())
      setDataVer(loadedDataVER)
    }

    if (receiverRST) {
      const loadedDataRST = receiverRST.split('\r\n').map((item) => item.trim())
      setDataRst(loadedDataRST)
    }

    if (receiverTIME) {
      const loadedDataTIME = receiverTIME.split('\r\n').map((item) => item.trim())
      setDataTime(loadedDataTIME)
    }
    if (receiverTEMP) {
      const loadedDataTIME = receiverTEMP.split('\r\n').map((item) => item.trim())
      setDataTemp(loadedDataTIME)
    }
  }, [receiverVER, receiverRST, receiverTIME, receiverTEMP])

  //console.log(dataVer[1].replace('Serial Number:', ''))
  return (
    <div className="flex flex-row gap-6 flex-wrap items-end justify-center mt-16 border border-sky-500 rounded-md py-4">
      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Número de Serie</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataVer[1] ? dataVer[1].replace('Serial Number:', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Versão do Hardware</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataVer[2] ? dataVer[2].replace('Hardware Version:', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Versão do Firmware</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataVer[3] ? dataVer[3].replace('Firmware Version:', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Timer</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataTime[1] ? dataTime[1].replace('Time=', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Habilitar Transmissão</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[1] ? dataRst[1].replace('Transmitter:', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Próxima Transmissão Temporizada</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[6] ? dataRst[6].replace('Next Timed Tx:', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm mb-1">Próxima Transmissão Aleatória</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[9] ? dataRst[9].replace('Next Random Tx:', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm mb-1">Fail Safe</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[10] ? dataRst[10].replace('Failsafe:', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm mb-1">Tensão de Alimentação</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[11] ? dataRst[11].replace('Supply voltage: ', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm mb-1">Temperatura</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataTemp[1] ? dataTemp[1].replace('Temp = ', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm mb-1">Contagem do Buffer Módulo Temporizado</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[5] ? dataRst[5].replace('Timed Message Length: ', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm mb-1">Contagem do Buffer Módulo Aleatório</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[7] ? dataRst[7].replace('Random Message Length: ', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm mb-1">Status da Próxima Transmissão</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={dataRst[4] ? dataRst[4].replace('Time To Next Tx: ', '') : 'N/A'}
          readOnly
        />
      </div>

      <div className="flex flex-col w-40 "></div>
      <div className="flex flex-col w-40 "></div>
      <div className="flex flex-col w-40 "></div>
    </div>
  )
}
