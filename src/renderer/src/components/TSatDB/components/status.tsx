import { ArrowsClockwise } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useRef, useState } from 'react'
import { t } from 'i18next'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
type Props = {
  receiverVER: string | undefined
  receiverRST: string | undefined
  receiverTIME: string | undefined
  receiverTEMP: string | undefined
  refreshInformation: () => void
  // clear: boolean | undefined
  // onClearReset: (newValue: boolean) => void
  // changeVariableMain: (value: string) => void
}

export default function Status({
  receiverVER,
  receiverRST,
  receiverTIME,
  receiverTEMP,
  refreshInformation
}: Props): JSX.Element {
  const [dataVer, setDataVer] = useState<string[]>([])
  const [dataRst, setDataRst] = useState<string[]>([])
  const [dataTime, setDataTime] = useState<string[]>([])
  const [dataTemp, setDataTemp] = useState<string[]>([])
  const [FailSafe, setFailSafe] = useState<string>('N/A')
  const [Tx, setTx] = useState<string>('N/A')
  const textareaRef: React.MutableRefObject<HTMLTextAreaElement | null> = useRef(null)
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

  useEffect(() => {
    setFailSafe(dataRst[10] ? dataRst[10].replace('Failsafe:', '') : 'N/A')
    setTx(dataRst[1] ? dataRst[1].replace('Transmitter:', '') : 'N/A')
  }, [dataRst])

  //console.log(dataVer[1].replace('Serial Number:', ''))
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col border border-sky-500 rounded-md py-4 mt-16 px-5">
        <div className="flex flex-row gap-6 flex-wrap items-end justify-center ">
          <div className="flex flex-col w-40 ">
            <label className="text-md mb-1">{t('Número de série')}</label>
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7"
              type="text"
              value={dataVer[1] ? dataVer[1].replace('Serial Number:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className="flex flex-col w-40 ">
            <label className="text-md mb-1">{t('Versão do hardware')}</label>
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7"
              type="text"
              value={dataVer[2] ? dataVer[2].replace('Hardware Version:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className="flex flex-col w-40 ">
            <label className="text-md mb-1">{t('Versão do firmware')}</label>
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7"
              type="text"
              value={dataVer[3] ? dataVer[3].replace('Firmware Version:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className="flex flex-col w-40 ">
            <label className="text-md mb-1">{t('Data e hora')}</label>
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7"
              type="text"
              value={dataTime[1] ? dataTime[1].replace('Time=', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className="flex flex-col w-40 ">
            <label className="text-sm mb-1">{t('Fail Safe')}</label>
            <input
              className={`border border-sky-500 rounded-md p-2 text-center h-7 ${FailSafe != ' OK' ? 'bg-yellow-300 font-bold' : 'bg-white font-normal'}`}
              type="text"
              value={FailSafe}
              readOnly
            />
          </div>

          <div className="flex flex-col w-40 ">
            <label className="text-md mb-1">{t('Habilitar transmissão')}</label>
            <input
              className={`border border-sky-500 rounded-md p-2 text-center h-7 ${Tx != 'ENABLE' ? 'bg-yellow-300 font-bold' : 'bg-white font-normal'}`}
              type="text"
              value={Tx}
              readOnly
            />
          </div>

          <div className="flex flex-col w-40 ">
            <label className="text-sm mb-1">{t('Tensão de alimentação')}</label>
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7"
              type="text"
              value={dataRst[11] ? dataRst[11].replace('Supply voltage: ', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className="flex flex-col w-40 ">
            <label className="text-sm mb-1">{t('Temperatura')}</label>
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7"
              type="text"
              value={dataTemp[1] ? dataTemp[1].replace('Temp = ', '') : 'N/A'}
              readOnly
            />
          </div>
        </div>
        <div className="flex flex-row mt-7 px-8 items-center justify-around gap-6">
          <div className="flex flex-row  items-center justify-center gap-6 w-full">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col w-40 ">
                <label className="text-md mb-1">{t('Próxima transmissão temporizada')}</label>
                <input
                  className="border border-sky-500 rounded-md p-2 text-center h-7"
                  type="text"
                  value={dataRst[6] ? dataRst[6].replace('Next Timed Tx:', '') : 'N/A'}
                  readOnly
                />
              </div>

              <div className="flex flex-col w-40 ">
                <label className="text-sm mb-1">{t('Próxima transmissão aleatória')}</label>
                <input
                  className="border border-sky-500 rounded-md p-2 text-center h-7"
                  type="text"
                  value={dataRst[9] ? dataRst[9].replace('Next Random Tx:', '') : 'N/A'}
                  readOnly
                />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col w-40 ">
                <label className="text-sm mb-1">{t('Contagem do buffer módulo temporizado')}</label>
                <input
                  className="border border-sky-500 rounded-md p-2 text-center h-7"
                  type="text"
                  value={dataRst[5] ? dataRst[5].replace('Timed Message Length: ', '') : 'N/A'}
                  readOnly
                />
              </div>

              <div className="flex flex-col w-40 ">
                <label className="text-sm mb-1">{t('Contagem do buffer módulo aleatório')}</label>
                <input
                  className="border border-sky-500 rounded-md p-2 text-center h-7"
                  type="text"
                  value={dataRst[7] ? dataRst[7].replace('Random Message Length: ', '') : 'N/A'}
                  readOnly
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-start items-start w-full">
            <label className="text-sm mb-1">{t('Status da última transmissão')}</label>
            <textarea
              ref={textareaRef}
              className="border border-sky-500 rounded-md p-2 text-justify h-36 w-[347px] resize-none"
              value={dataRst[4] ? dataRst[4].replace('Time To Next Tx: ', '') : 'N/A'}
              readOnly
            ></textarea>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-end items-end w-full">
        <Button onClick={refreshInformation}>
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
      </div>
    </div>
  )
}
