import { TerminalWindow } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'

import SerialManager from '../../utils/serialSDI12'

interface TerminalProps {
  isConect: boolean
  portCom: string
  PortStatus: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

const serialManager = new SerialManager()

export function Openport({ portName, bauld }: SerialProps) {
  serialManager.openPort(portName, bauld)
}

export function ClosePort() {
  serialManager.closePort()
}

export default function Terminal(props: TerminalProps) {
  const [inputValue, setInputValue] = useState('')
  const [textValue, setTextValue] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [valorSelecionado, setValorSelecionado] = useState('')

  const textareaRef = useRef(null)
  let newComando = ''

  console.log(props.PortStatus.state)
  let portname = props.portCom.name
  console.log(props.portCom.name)

  if (props.PortStatus.state === true) {
    //serialManager.openPort(portname, 1200)
    console.log('conectei')
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value)
  }

  const handleClickSendComand = (comando) => {
    newComando = `${textValue}TX: ${comando}\n`

    serialManager
      .sendCommand(comando)
      .then((resposta) => {
        setTextValue(`${newComando}RX: ${resposta}\n`)
        console.log('Resultado:', resposta)
      })
      .catch((erro) => {
        console.error('Erro:', erro.message)
        setTextValue(newComando)
      })

    console.log(comando)
  }

  const handleClearTextArea = () => {
    newComando = ''
    setTextValue('')
  }

  const handleSaveToFile = () => {
    const blob = new Blob([textValue], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'Terminal.txt')
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [textValue])

  return props.isConect ? (
    <div className="w-full mt-16 mb-9 ml-4 mr-[1px]  bg-[#EDF4FB] rounded-lg flex flex-col items-center">
      <header className="w-full flex items-center justify-start bg-[#1769A0] rounded-t-lg h-11 top-0">
        <div className=" flex w-9 items-center justify-center bg-white ml-2 mt-4 mb-4 rounded-b-lg rounded-e-lg text-[#1769A0] ">
          <TerminalWindow size={30} />
        </div>
        <h2 className="text-white  font-semibold pl-2">Terminal SDI12</h2>
      </header>

      <div className="bg-white mr-8 ml-8 mt-28 rounded-lg text-zinc-500 text-sm w-full max-w-4xl">
        <header className="flex items-center justify-between mr-8 ml-8 pt-4 border-b-[1px] border-sky-500">
          <div className=" mb-2">
            <span className="pr-2">Endereço:</span>
            <input
              type="number"
              value={0}
              max={10}
              min={0}
              maxLength={2}
              className="border-sky-400 border-[2px] text-center w-12 rounded-md outline-none"
            />
          </div>

          <div className="flex items-center justify-betwee">
            <span className="pr-2 pl-4">Auto-Retry</span>
            <input type="checkbox" />
            <span className="pr-2 pl-4">timerStamp</span>
            <input type="checkbox" />
          </div>
        </header>
        <div className="flex flex-row items-center justify-end mr-8 mt-4 gap-2">
          <Button texto="Salvar" onClick={handleSaveToFile} />
          <Button texto="Limpar" onClick={handleClearTextArea} />
        </div>
        <div className="w-full pr-8 pl-8 pt-4 flex">
          <div className="flex flex-col items-center mr-4 w-36">
            <span className="mb-2 mr-1 font-light">Comandos</span>
            <Button
              texto="?!"
              onClick={() => {
                handleClickSendComand('?!')
              }}
            />
            <Button
              texto="a!"
              onClick={() => {
                handleClickSendComand('0!')
              }}
            />
            <Button
              texto="al!"
              onClick={() => {
                handleClickSendComand('0l!')
              }}
            />
            <Button
              texto="aAb!"
              onClick={() => {
                handleClickSendComand('0A0!')
              }}
            />
            <Button
              texto="aC!"
              onClick={() => {
                handleClickSendComand('0C!')
              }}
            />
            <Button
              texto="aD0!"
              onClick={() => {
                handleClickSendComand('0D0!')
              }}
            />
          </div>
          <textarea
            ref={textareaRef}
            name=""
            id=""
            value={textValue}
            className="w-full border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap outline-none"
          ></textarea>
        </div>
        <div className="flex justify-end flex-row mt-4 mr-8 ml-8">
          <input
            className="w-[20rem] border-[2px] mb-2 mr-2 rounded-md outline-sky-400"
            type="text"
            onChange={handleInputChange}
            placeholder="Digite o comando"
          />
          <Button texto="Enviar" onClick={() => handleClickSendComand(inputValue)} />
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full mt-16 mb-9 ml-4 mr-[1px]  bg-[#EDF4FB] rounded-lg">
      <header className="w-full flex items-center justify-start bg-[#1769A0] rounded-t-lg h-11">
        <div className=" flex w-9 items-center justify-center bg-white ml-2 mt-4 mb-4 rounded-b-lg rounded-e-lg text-[#1769A0] ">
          <TerminalWindow size={30} />
        </div>
        <h2 className="text-white  font-semibold pl-2">Terminal SDI12</h2>
      </header>
    </div>
  )
}
