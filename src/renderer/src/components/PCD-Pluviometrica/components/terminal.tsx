import Button from '@renderer/components/button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import { t } from 'i18next'
import { sanitizePcdTxtExport } from '../sanitizePcdTxt'

type Props = {
  receiverTerminal: string | undefined
  handleSendComandTerminal: (valuer: string) => void
}
export function Terminal({ receiverTerminal, handleSendComandTerminal }: Props): JSX.Element {
  const [dataTerminal, setDataTerminal] = useState<string[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const textareaRef: React.MutableRefObject<HTMLTextAreaElement | null> = useRef(null)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value)
  }

  const handleSendComand = (): void => {
    const txMessage = `TX: ${inputValue}\r`
    setDataTerminal((prevData) => [...prevData, txMessage])
    handleSendComandTerminal(inputValue)
    setInputValue('')
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleSendComand()
    }
  }

  const handleClear = (): void => {
    setDataTerminal([])
  }

  const handleSaveToFile = (): void => {
    const headerFile = t('Dados gerado da PCD Pluviométrica - ')
    const date = new Date().toLocaleString()
    const Data = sanitizePcdTxtExport(
      headerFile + date + '\n \n' + dataTerminal.join('').replace(/,/g, '')
    )
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })

    const dateObj = new Date(
      date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')
    )
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getFullYear().toString().slice(-2)}-${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}`
    saveAs(blob, sanitizePcdTxtExport(`Terminal-PCD-Pluviometrica_${formattedDate}.txt`))
  }

  useEffect(() => {
    if (receiverTerminal) {
      const rxMessage = `RX: ${receiverTerminal}\r`
      setDataTerminal((prevData) => [...prevData, rxMessage])
    }
  }, [receiverTerminal])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [dataTerminal])

  useEffect(() => {
    setDataTerminal([])
  }, [])

  return (
    <div className="box-border mx-auto mb-3 w-full min-w-0 max-w-2xl px-1 py-3 sm:px-2">
      <div className="box-border overflow-hidden rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white shadow-sm">
        <div className="mb-0 flex flex-row flex-wrap items-center justify-between gap-2 border-b border-sky-600 bg-sky-500 px-3 py-1.5 sm:px-4">
          <label className="text-xs font-bold uppercase tracking-wide text-white">
            {t('Terminal')}
          </label>
          <div className="flex flex-row flex-wrap gap-2">
            <Button size="small" onClick={handleClear}>
              {t('Limpar')}
            </Button>
            <Button size="small" onClick={handleSaveToFile}>
              {t('Salvar')}
            </Button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
        <textarea
          ref={textareaRef}
          name=""
          id=""
          value={dataTerminal.join('\n')}
          readOnly
          className="box-border h-56 w-full min-w-0 max-w-full resize-none overflow-y-auto whitespace-pre-wrap rounded-md border border-sky-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-700 outline-none focus:border-sky-400"
        />

        <div className="mt-3 mb-4 flex w-full min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <input
            className="box-border h-10 min-w-0 flex-1 rounded-md border border-sky-200 bg-white px-3 text-sm text-sky-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
            type="text"
            placeholder={t('Digite o comando')}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
          />
          <Button size="large" className="h-10 shrink-0" filled onClick={handleSendComand}>
            {t('Enviar')}
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
