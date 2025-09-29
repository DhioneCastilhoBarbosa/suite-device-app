import Button from '@renderer/components/button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import { t } from 'i18next'

type Props = {
  receiverTerminal: string | undefined
  handleSendComandTerminal: (valuer: string) => void
  // clear: boolean | undefined
  // onClearReset: (newValue: boolean) => void
  // changeVariableMain: (value: string) => void
}
export function Terminal({ receiverTerminal, handleSendComandTerminal }: Props): JSX.Element {
  const [dataTerminal, setDataTerminal] = useState<string[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const textareaRef: React.MutableRefObject<HTMLTextAreaElement | null> = useRef(null)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value)
  }

  const handleSendComand = (): void => {
    handleSendComandTerminal(inputValue)
    setInputValue('')
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      //console.log('Enter')
      handleSendComand()
    }
  }

  const handleClear = (): void => {
    setDataTerminal([])
  }

  const handleSaveToFile = (): void => {
    const headerFile = 'Dados gerado do Trasmissor TSatDB - '
    const date = new Date().toLocaleString()
    const Data = headerFile + date + '\n \n' + dataTerminal.join('').replace(/,/g, '')
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'Terminal-TSatDB.txt')
  }

  useEffect(() => {
    const receiver = receiverTerminal ? receiverTerminal.replace(/[>]/g, '') : ''

    setDataTerminal((prevData) => (receiverTerminal ? [...prevData, receiver] : prevData))
  }, [receiverTerminal])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [dataTerminal])
  return (
    <div className="flex flex-col w-full mt-10 mb-4">
      <div className="flex flex-row gap-2 mt-6 mx-8 justify-end">
        <Button size={'small'} onClick={handleClear}>
          {t('Limpar')}
        </Button>
        <Button size={'small'} onClick={handleSaveToFile}>
          {t('Salvar')}
        </Button>
      </div>
      <div className=" flex w-full h-72">
        <textarea
          ref={textareaRef}
          name=""
          id=""
          value={dataTerminal.join('').replace(/,/g, '')}
          readOnly
          className="w-full mx-8 mt-2 border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap outline-none text-black text-sm"
        ></textarea>
      </div>

      <div className="flex justify-end flex-row mt-4 mr-8 ml-8 gap-2">
        <input
          className="w-full border-[2px] rounded-md outline-sky-400 p-2"
          type="text"
          placeholder={t('Digite o comando')}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <Button size={'large'} className="h-10" filled onClick={handleSendComand}>
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
