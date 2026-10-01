import { ArrowsClockwise } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useRef, useState } from 'react'
import { t } from 'i18next'

function lastTransmissionStatus(raw: string | undefined): string {
  if (!raw?.trim()) return 'N/A'
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !/^ltxs$/i.test(line))
  return lines.join('\n') || 'N/A'
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
type Props = {
  receiverVER: string | undefined
  receiverRST: string | undefined
  receiverTIME: string | undefined
  receiverTEMP: string | undefined
  receiverLTXS: string | undefined
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
  receiverLTXS,
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

  const fieldClass = 'flex h-full min-w-0 w-full flex-col'
  const inputClass = 'mt-auto h-7 w-full rounded-md border border-sky-500 p-2 text-center'
  const labelClass = 'mb-1 text-sm leading-snug'
  const pairLabelClass = 'mb-1 min-h-[2.5rem] text-sm leading-snug'

  return (
    <div className="flex w-full min-w-0 flex-col items-center justify-center gap-3 px-1 pb-1">
      <div className="mt-4 flex w-full min-w-0 flex-col rounded-md border border-sky-500 px-3 py-4 sm:px-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          <div className={fieldClass}>
            <label className={labelClass}>{t('Número de série')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataVer[1] ? dataVer[1].replace('Serial Number:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>{t('Versão do hardware')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataVer[2] ? dataVer[2].replace('Hardware Version:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>{t('Versão do firmware')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataVer[3] ? dataVer[3].replace('Firmware Version:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>{t('Data e hora')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataTime[1] ? dataTime[1].replace('Time=', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>{t('Fail Safe')}</label>
            <input
              className={`${inputClass} ${FailSafe != ' OK' ? 'bg-yellow-300 font-bold' : 'bg-white font-normal'}`}
              type="text"
              value={FailSafe}
              readOnly
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>{t('Habilitar transmissão')}</label>
            <input
              className={`${inputClass} ${Tx != 'ENABLE' ? 'bg-yellow-300 font-bold' : 'bg-white font-normal'}`}
              type="text"
              value={Tx}
              readOnly
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>{t('Tensão de alimentação')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataRst[11] ? dataRst[11].replace('Supply voltage: ', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={fieldClass}>
            <label className={labelClass}>{t('Temperatura')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataTemp[1] ? dataTemp[1].replace('Temp = ', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={`${fieldClass} lg:col-start-1 lg:row-start-3`}>
            <label className={pairLabelClass}>{t('Próxima transmissão temporizada')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataRst[6] ? dataRst[6].replace('Next Timed Tx:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={`${fieldClass} lg:col-start-2 lg:row-start-3`}>
            <label className={pairLabelClass}>{t('Contagem do buffer módulo temporizado')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataRst[5] ? dataRst[5].replace('Timed Message Length: ', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={`${fieldClass} lg:col-start-1 lg:row-start-4`}>
            <label className={pairLabelClass}>{t('Próxima transmissão aleatória')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataRst[9] ? dataRst[9].replace('Next Random Tx:', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className={`${fieldClass} lg:col-start-2 lg:row-start-4`}>
            <label className={pairLabelClass}>{t('Contagem do buffer módulo aleatório')}</label>
            <input
              className={inputClass}
              type="text"
              value={dataRst[7] ? dataRst[7].replace('Random Message Length: ', '') : 'N/A'}
              readOnly
            />
          </div>

          <div className="flex min-h-[10rem] min-w-0 w-full flex-col sm:col-span-2 lg:col-span-2 lg:col-start-3 lg:row-span-2 lg:row-start-3">
            <label className={pairLabelClass}>{t('Status da última transmissão')}</label>
            <textarea
              ref={textareaRef}
              className="mt-auto h-36 min-h-0 w-full min-w-0 flex-1 resize-none rounded-md border border-sky-500 p-2 text-justify lg:h-auto"
              value={lastTransmissionStatus(receiverLTXS)}
              readOnly
            ></textarea>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row items-end justify-end px-2">
        <Button onClick={refreshInformation}>
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
      </div>
    </div>
  )
}
