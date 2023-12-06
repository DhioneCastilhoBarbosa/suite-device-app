import { TerminalWindow } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useRef, useState } from 'react'
import { match } from 'assert'

interface TerminalProps {
  isConect: boolean
  portCom: string
}

export default function Terminal(props: TerminalProps) {
  const [inputValue, setInputValue] = useState('')
  const [textValue, setTextValue] = useState('')
  const textareaRef = useRef(null)

  const handleInputChange = (event) => {
    setInputValue(event.target.value)
  }

  const handleClickSendComand = (comando) => {
    let newComando = `${textValue}TX: ${comando}\n`
    setTextValue(newComando)
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [textValue])

  return props.isConect ? (
    <div className="w-full mt-16 mb-9 ml-4 mr-[1px]  bg-[#EDF4FB] rounded-lg ">
      <header className="w-full flex items-center justify-start bg-[#1769A0] rounded-t-lg h-11">
        <div className=" flex w-9 items-center justify-center bg-white ml-2 mt-4 mb-4 rounded-b-lg rounded-e-lg text-[#1769A0] ">
          <TerminalWindow size={30} />
        </div>
        <h2 className="text-white  font-semibold pl-2">Terminal SDI12- conectado</h2>
      </header>

      <div className="bg-white mr-8 ml-8 mt-10 rounded-lg text-zinc-500 text-sm max-w-3xl m-auto">
        <header className="flex items-center justify-between mr-8 ml-8 pt-4 border-b-[1px] border-sky-500">
          <div className=" mb-2">
            <span className="pr-2">Endereço:</span>
            <input type="number" max={10} min={0} maxLength={2} />
          </div>

          <div className="flex items-center justify-betwee">
            <span className="pr-2 pl-4">Auto-Retry</span>
            <input type="checkbox" />
            <span className="pr-2 pl-4">timerStamp</span>
            <input type="checkbox" />
          </div>
        </header>
        <div className="w-full pr-8 pl-8 pt-6 flex">
          <div className="flex flex-col items-center mr-4 w-36">
            <span className="mb-2 mr-6 font-light">Comandos</span>
            <Button
              texto="?!"
              onClick={() => {
                handleClickSendComand('?!')
              }}
            />
            <Button
              texto="a!"
              onClick={() => {
                handleClickSendComand('a!')
              }}
            />
            <Button
              texto="al!"
              onClick={() => {
                handleClickSendComand('al!')
              }}
            />
            <Button
              texto="aAb!"
              onClick={() => {
                handleClickSendComand('aAb!')
              }}
            />
            <Button
              texto="aC!"
              onClick={() => {
                handleClickSendComand('aC!')
              }}
            />
            <Button
              texto="aD0!"
              onClick={() => {
                handleClickSendComand('aD0!')
              }}
            />
          </div>
          <textarea
            ref={textareaRef}
            name=""
            id=""
            cols="30"
            rows="10"
            value={textValue}
            className="w-full border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap"
          ></textarea>
        </div>
        <div className="flex justify-end flex-row mt-4 mr-8 ml-8">
          <input
            className="w-[20rem] border-[2px] mb-2 mr-2 "
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
        <h2 className="text-white  font-semibold pl-2">Terminal SDI12- Desconectado</h2>
      </header>
    </div>
  )
}
