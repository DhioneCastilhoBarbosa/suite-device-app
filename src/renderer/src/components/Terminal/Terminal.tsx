import { TerminalWindow } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import SerialManager from '../../utils/serialSDI12'
import TerminalSDI12Banner from '../../assets/TerminalSDI12-banner.png'
import { CardInformation, RichText } from '../cardInfomation/CardInformation'
import { ImageDevice } from '../imageDevice/ImageDevice'
import { Device } from '../../Context/DeviceContext'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import { t } from 'i18next'

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
export function Openport({ portName, bauld }: SerialProps): Promise<void> {
  return serialManager.openPort(portName, bauld)
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
    const headerFile = t('Dados gerados do conversor USB/SDI-12 - ')
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
      <HeaderDevice DeviceName={t('Terminal SDI-12')}>
        <TerminalWindow size={30} />
      </HeaderDevice>
      <div className="bg-white mx-2 mb-6 mt-4 flex w-full min-w-0 max-w-4xl flex-col rounded-lg pb-8 text-sm text-zinc-500 sm:mx-8">
        <header className="flex flex-wrap items-center justify-between gap-3 mr-4 ml-4 sm:mr-8 sm:ml-8 pt-4 border-b-[1px] border-sky-500">
          <div className="mb-2">
            <span className="pr-2">{t('Endereço:')}</span>
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

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="pr-1">{t('Auto-Retry')}</span>
            <input type="checkbox" checked={autoRetry} onChange={handleCheckboxAutoRetry} />
            <span className="pr-1 pl-2">{t('timerStamp')}</span>
            <input
              type="checkbox"
              checked={timeStapActive}
              onChange={handleCheckBoxChangeTimeStap}
            />
          </div>
        </header>
        <div className="flex flex-row items-center justify-end mr-4 sm:mr-8 mt-4 gap-2">
          <Button size={'small'} onClick={handleSaveToFile}>
            {t('Salvar')}
          </Button>
          <Button size={'small'} onClick={handleClearTextArea}>
            {' '}
            {t('Limpar')}
          </Button>
        </div>
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 px-4 pt-4 sm:px-8 md:grid-cols-[9rem_minmax(0,1fr)] md:items-stretch">
          <div className="flex w-full flex-row flex-wrap items-center justify-center gap-1 md:h-full md:flex-col md:flex-nowrap md:items-stretch">
            <span className="mb-2 w-full text-center font-light">{t('Comandos')}</span>
            <div className="flex flex-row flex-wrap items-center justify-center gap-1 md:flex-1 md:flex-col md:flex-nowrap md:justify-between">
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
          </div>
          <textarea
            ref={textareaRef}
            name=""
            id=""
            value={textValue}
            readOnly
            className="min-h-[16rem] w-full min-w-0 resize-none overflow-y-scroll whitespace-pre-wrap border-[2px] border-zinc-200 text-sm text-black outline-none md:h-full"
          ></textarea>
          <div className="flex flex-row items-stretch gap-2 md:col-start-2">
            <input
              className="min-h-8 min-w-0 flex-1 rounded-md border-[2px] border-zinc-200 px-3 text-sm outline-sky-400"
              type="text"
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={t('Digite o comando')}
            />
            <Button
              size={'small'}
              className="shrink-0"
              onClick={() => handleClickSendComand(inputValue)}
            >
              {t('Enviar')}
            </Button>
          </div>
        </div>
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={t('Terminal SDI-12')}>
        <TerminalWindow size={30} />
      </HeaderDevice>
      <ImageDevice
        image={TerminalSDI12Banner}
        link="https://dualbase.com.br/produtos/"
        fit="contain"
      />

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>ConvDB-SDI12</b> é um conversor USB para SDI-12 desenvolvido para facilitar a configuração, testes e integração de sensores e equipamentos compatíveis com o protocolo SDI-12. Compacto e de fácil utilização, permite a comunicação direta entre um computador e dispositivos SDI-12, simplificando atividades de instalação, manutenção e diagnóstico em campo ou laboratório." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            • <RichText i18nKey="<b>Conversão USB para SDI-12 de forma simples e confiável;</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Facilita configuração, testes e diagnóstico de sensores SDI-12;</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Solução compacta, portátil e de fácil conexão ao computador.</b>" />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            {t(
              'Configuração de sensores SDI-12, comissionamento de estações de monitoramento, testes em bancada, manutenção de equipamentos e atividades de suporte técnico em campo.'
            )}
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
