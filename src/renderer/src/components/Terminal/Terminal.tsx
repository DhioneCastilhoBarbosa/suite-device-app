import { TerminalWindow } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import SerialManager from '../../utils/serialSDI12'
import TerminalImagem from '../../assets/TerminalImage.png'
import { CardInformation } from '../cardInfomation/CardInformation'
import { ImageDevice } from '../imageDevice/ImageDevice'
import { Device } from '@renderer/Context/DeviceContext'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'

import { z } from 'zod'

interface TerminalProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

const serialManager = new SerialManager()

const numericSchema = z.string().regex(/^\d*$/, 'Deve conter apenas números')

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Openport({ portName, bauld }: SerialProps) {
  serialManager.openPort(portName, bauld)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClosePort() {
  serialManager.closePort()
}

function TimeStamp() {
  const currentData = new Date()

  const day = String(currentData.getDate()).padStart(2, '0')
  const month = String(currentData.getMonth() + 1).padStart(2, '0')
  const year = currentData.getFullYear()

  const hours = String(currentData.getHours()).padStart(2, '0')
  const minutes = String(currentData.getMinutes()).padStart(2, '0')
  const seconds = String(currentData.getSeconds()).padStart(2, '0')
  const milliseconds = String(currentData.getMilliseconds()).padStart(2, '0')

  return `${day}/${month}/${year}-${hours}:${minutes}:${seconds}:${milliseconds}`
}

export function Terminal(props: TerminalProps): JSX.Element {
  const [inputValue, setInputValue] = useState('')
  const [textValue, setTextValue] = useState('')
  const [valorSelecionado, setValorSelecionado] = useState('')
  const [timeStapActive, setTimeStapActive] = useState(false)
  const [autoRetry, setAutoRetry] = useState(false)
  const [address, setAddress] = useState(0)
  const [firstAddress, setFirstAddress] = useState(0)

  const { mode, PortOpen }: any = Device()
  const [error, setError] = useState('')

  //console.log(`Status Port: ${PortOpen.state}`)

  const textareaRef: React.MutableRefObject<any> = useRef(null)
  let newComando = ''

  const handleCheckboxAutoRetry = () => {
    setAutoRetry(!autoRetry)
  }

  const handleCheckBoxChangeTimeStap = () => {
    setTimeStapActive(!timeStapActive)
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value)
  }

  const handleClickSendComand = (comando) => {
    setValorSelecionado(comando)
    if (timeStapActive) {
      let timer = TimeStamp()
      newComando = `${textValue}${timer} TX: ${comando}\n`
      setTextValue(newComando)
      if (!mode.state) {
        serialManager
          .sendCommand(comando)
          .then((resposta) => {
            timer = TimeStamp()
            setTextValue(`${newComando}${timer} RX: ${resposta}\n`)
            if (comando === '?!') {
              setFirstAddress(parseInt(resposta))
            }

            console.log('Resultado:', resposta)
          })
          .catch((erro) => {
            console.error('Erro:', erro.message)
            setTextValue(newComando)
          })
      } else {
        setTextValue(newComando)
      }
    } else {
      newComando = `${textValue}TX: ${comando}\n`
      setTextValue(newComando)
      if (!mode.state) {
        serialManager
          .sendCommand(comando)
          .then((resposta) => {
            setTextValue(`${newComando}RX: ${resposta}\n`)
            //console.log('Resultado:', resposta)
            if (comando === '?!') {
              setFirstAddress(parseInt(resposta))
            }
          })
          .catch((erro) => {
            //console.error('Erro:', erro.message)
            setTextValue(newComando)
          })
      } else {
        setTextValue(newComando)
      }
    }
  }

  const handleClearTextArea = () => {
    newComando = ''
    setTextValue('')
  }

  const handleSaveToFile = () => {
    const headerFile = 'Dados gerado do conversor USB/SDI-12 - '
    const date = TimeStamp()
    const Data = headerFile + date + '\n \n' + textValue
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'Terminal.txt')
  }

  const handleAddress = (event) => {
    const newValue = event.target.value
    const result = numericSchema.safeParse(newValue)

    if (result.success) {
      setAddress(parseInt(newValue))
      setError('')
      console.log('input succes sem virgula e ponto')
    } else {
      setError(result.error.errors[0].message)
      console.log(error)
    }
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      //console.log('Enter')
      handleClickSendComand(inputValue)
    }
  }

  const handleBeforeInput = (event) => {
    const invalidChars = ['.', ',']
    if (invalidChars.includes(event.data) || event.target.value.length >= 2) {
      event.preventDefault()
    }
  }

  useEffect(() => {
    handleClearTextArea()
  }, [PortOpen])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }

    if (autoRetry === true) {
      const intervalId = setInterval(() => {
        handleClickSendComand(valorSelecionado)
      }, 2000)

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      return () => clearInterval(intervalId)
    }

    return undefined
  }, [textValue, autoRetry])

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'Terminal SDI12'}>
        <TerminalWindow size={30} />
      </HeaderDevice>
      <div className="bg-white mr-8 ml-8 mt-28 rounded-lg text-zinc-500 text-sm w-full max-w-4xl">
        <header className="flex items-center justify-between mr-8 ml-8 pt-4 border-b-[1px] border-sky-500">
          <div className=" mb-2">
            <span className="pr-2">Endereço:</span>
            <input
              type="number"
              defaultValue={firstAddress}
              max={10}
              min={0}
              maxLength={2}
              onChange={handleAddress}
              onBeforeInput={handleBeforeInput}
              className="border-sky-400 border-[2px] text-center w-12 rounded-md outline-none"
            />
          </div>

          <div className="flex items-center justify-betwee">
            <span className="pr-2 pl-4">Auto-Retry</span>
            <input type="checkbox" checked={autoRetry} onChange={handleCheckboxAutoRetry} />
            <span className="pr-2 pl-4">timerStamp</span>
            <input
              type="checkbox"
              checked={timeStapActive}
              onChange={handleCheckBoxChangeTimeStap}
            />
          </div>
        </header>
        <div className="flex flex-row items-center justify-end mr-8 mt-4 gap-2">
          <Button size={'small'} onClick={handleSaveToFile}>
            Salvar
          </Button>
          <Button size={'small'} onClick={handleClearTextArea}>
            {' '}
            Limpar
          </Button>
        </div>
        <div className="w-full pr-8 pl-8 pt-4 flex">
          <div className="flex flex-col items-center mr-4 w-36">
            <span className="mb-2 mr-1 font-light">Comandos</span>
            <Button
              size={'small'}
              onClick={() => {
                handleClickSendComand('?!')
              }}
            >
              ?!
            </Button>
            <Button
              size={'small'}
              onClick={() => {
                handleClickSendComand(`${address}!`)
              }}
            >
              a!
            </Button>
            <Button
              size={'small'}
              onClick={() => {
                handleClickSendComand(`${address}I!`)
              }}
            >
              al!
            </Button>
            <Button
              size={'small'}
              onClick={() => {
                handleClickSendComand(`${firstAddress}A${address}!`)
              }}
            >
              aAb!
            </Button>
            <Button
              size={'small'}
              onClick={() => {
                handleClickSendComand(`${address}C!`)
              }}
            >
              aC!
            </Button>
            <Button
              size={'small'}
              onClick={() => {
                handleClickSendComand(`${address}D0!`)
              }}
            >
              aD0!
            </Button>
          </div>
          <textarea
            ref={textareaRef}
            name=""
            id=""
            value={textValue}
            readOnly
            className="w-full border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap outline-none text-black text-sm"
          ></textarea>
        </div>
        <div className="flex justify-end flex-row mt-4 mr-8 ml-8">
          <input
            className="w-[20rem] border-[2px] mb-2 mr-2 rounded-md outline-sky-400"
            type="text"
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Digite o comando"
          />
          <Button size={'small'} onClick={() => handleClickSendComand(inputValue)}>
            Enviar
          </Button>
        </div>
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={'Terminal SDI12'}>
        <TerminalWindow size={30} />
      </HeaderDevice>
      <ImageDevice image={TerminalImagem} />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg">
        <CardInformation title="VISÃO GERAL">
          <p>
            Conversor USB/SDI12 é um equipamento capaz de comunicar com dispositivos SDI-12 afim de
            verificar o funcionamento e acessar configurações.
          </p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>
            Capacidade de enviar quaisquer comandos digitados (modo transparente), além de possuir
            alguns atalhos para comandos pré-definidos.
          </p>
          <p>Aceita múltiplos sensores ligados simultaneamente.</p>
          <p>
            Identifica o endereço do sensor automaticamente (para este caso permite penas 1 sensor
            no barramento).
          </p>
          <p>Pode salvar LOG de comunicação.</p>
        </CardInformation>

        <CardInformation title="ESPECIFICAÇÃO">
          <p>Compatível com plataforma Windows (XP ou superior, incluindo Windows 11).</p>
          <p>Compatível com todas as versões do SDI-12 (incluindo v1.4).</p>
          <p> Compatível com USB2.0.</p>
          <p>Alimentação pela porta USB (5V).</p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
