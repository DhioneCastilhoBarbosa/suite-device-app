import Button from '@renderer/components/button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import { t } from 'i18next'

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
    const txMessage = `TX: ${inputValue}\r` // Adiciona o prefixo TX para a mensagem enviada
    setDataTerminal((prevData) => [...prevData, txMessage]) // Adiciona a mensagem de envio
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
    const headerFile = t('Dados gerado do PluviDB-IoT - ')
    const date = new Date().toLocaleString()
    const Data = headerFile + date + '\n \n' + dataTerminal.join('').replace(/,/g, '')
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })

    const dateObj = new Date(
      date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')
    )
    // Formatando a data no formato desejado
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getFullYear().toString().slice(-2)}-${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}`
    //console.log(formattedDate)
    saveAs(blob, `Terminal-PluviDB-IoT_${formattedDate}.txt`)
  }

  useEffect(() => {
    if (receiverTerminal) {
      const rxMessage = `RX: ${receiverTerminal}\r` // Adiciona o prefixo RX para a mensagem recebida
      setDataTerminal((prevData) => [...prevData, rxMessage]) // Adiciona a mensagem de recebimento
    }
  }, [receiverTerminal])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [dataTerminal])
  useEffect(() => {
    // Limpa o estado de dataTerminal toda vez que o componente é carregado.
    setDataTerminal([]) // Limpa o terminal no primeiro carregamento
  }, []) // O array
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
          value={dataTerminal.join('\n')}
          readOnly
          className="w-full mx-8 mt-2 border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap outline-none text-black text-sm p-2"
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
