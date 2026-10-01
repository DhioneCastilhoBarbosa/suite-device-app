import { ArrowsClockwise, Drop, Gauge, GearSix, Info, TerminalWindow } from '@phosphor-icons/react'
import { CardInformation, RichText } from '../cardInfomation/CardInformation'
import ImgPluviDBIotBanner from '../../assets/PluviDB-Iot-banner.png'
import { ImageDevice } from '../imageDevice/ImageDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import SerialManagerRS232 from '@renderer/utils/serial'
import { Device } from '../../Context/DeviceContext'
import Status from './components/status'

import { Terminal } from './components/terminal'
import LoadingData from '../loading/loadingData'
import { useEffect, useState } from 'react'
import { InstantData } from './components/intantData'
import PasswordModal from './components/Login'
import { ModalErroUnloagged } from '../modal/modalUnlogged'

import { Update } from './components/update'
import { toast } from 'react-toastify'
import { t } from 'i18next'
import { createPluviFirmwareService } from '@renderer/utils/pluviFirmware'
import { SerialManager } from '@renderer/utils/serialManager'

interface PluviDBIotProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

// amplie se precisar na sua base
type PasswordValidationResult =
  | { success: true }
  | {
      success: false
      errorCode: 'wrong-password' | 'invalid-command' | 'connection-error' | 'unexpected'
      message?: string
    }

type AccessMode = 'none' | 'full' | 'recoveryOnly'

const serialManagerPluviIoT = new SerialManagerRS232()
export const pluviFirmware = createPluviFirmwareService(serialManagerPluviIoT)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OpenPortPluviIoT({ portName, bauld }: SerialProps): Promise<void> {
  return serialManagerPluviIoT.openPortRS232(portName, bauld)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function ClosePortPluviIoT() {
  try {
    // Fecha a porta
    serialManagerPluviIoT.closePortRS232()
    //console.log('Porta fechada com sucesso')
  } catch (error) {
    //console.error('Erro ao tentar fechar a porta:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function PluviDBIot(props: PluviDBIotProps) {
  const [MenuName, setMenuName] = useState('status')
  const [colorConfig, setColorConfig] = useState(false)
  const [colorStatus, setColorStatus] = useState(true)
  const [colorTerminal, setColorTerminal] = useState(false)
  const [colorUpdate, setColorUpdade] = useState(false)
  const [colorInstantData, setColorInstantData] = useState(false)
  const [dataReceivedComandTerminal, setDataReceivedComandTerminal] = useState<string>('')
  const [dataReceivedComandInst, setDataReceivedComandInst] = useState<string>('')
  const [dataReceivedComandStatus, setDataReceivedComandStatus] = useState<string>('')
  const [dataReceivedComandGL, setDataReceivedComandGL] = useState<string>('')
  const [dataReceivedComandReport, setDataReceivedComandReport] = useState<string>('')
  const [dataReceivedComandConection, setDataReceivedComandConection] = useState<string>('')
  const [dataReceivedComandGeneralName, setDataReceivedComandGeneralName] = useState<string>('')
  const [dataReceivedComandGeneralGeolocation, setDataReceivedComandGeneralGeolocation] =
    useState<string>('')
  const [dataReceivedComandGeneralTimeZone, setDataReceivedComandGeneralTimeZone] =
    useState<string>('')

  const [dataReceivedComandGeneralTime, setDataReceivedComandGeneralTime] = useState<string>('')

  const [dataReceivedComandPortP1, setDataReceivedComandPortP1] = useState<string>('')
  const [dataReceivedComandPortP2, setDataReceivedComandPortP2] = useState<string>('')
  const [dataReceivedComandPortSdi, setDataReceivedComandPortSdi] = useState<string>('')
  const [dataReceivedComandTimerFixed, setDataReceivedComandTimerFixed] = useState<string>('')
  const [dataReceivedComandTimerDynamic, setDataReceivedComandTimerDynamic] = useState<string>('')
  const [dataReceivedComandTimerMaintenance, setDataReceivedComandTimerMaintenance] =
    useState<string>('')
  const [dataReceivedComandHeritage, setDataReceivedComandHeritage] = useState<string>('')
  const [dataReceivedComandRepeatSync, setDataReceivedComandRepeatSync] = useState<string>('')
  const [dataReceivedComandProtocol, setDataReceivedComandProtocol] = useState<string>('')
  const [dataReceivedComandProtocolMQTT, setDataReceivedComandProtocolMQTT] = useState<string>('')
  const [dataReceivedComandProtocolFTP, setDataReceivedComandProtocolFTP] = useState<string>('')
  const [dataReceivedComandProtocolHTTP, setDataReceivedComandProtocolHTTP] = useState<string>('')
  const [dataReceivedComandMemoryInfo, setDataReceivedComandMemoryInfo] = useState<string>('')
  const [dataReceivedComandNTP, setDataReceivedComandNTP] = useState<string>('')
  const [dataReceivedComandMemoryInfoData, setDataReceivedComandMemoryInfoData] =
    useState<string>('')
  const [PasswordSaved, setPasswordSaved] = useState<string>('')

  const [messageIsLoading, setMessageIsLoading] = useState<string>(
    'Baixando informações do dispositivo!'
  )

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [deviceFound, setDeviceFound] = useState<boolean | null>(null) // null indica que a varredura ainda não foi iniciada
  const [isModalPassWordOpen, setIsModalPassWordOpen] = useState(true)
  const [accessMode, setAccessMode] = useState<AccessMode>('none')
  const [enabledAccess, setEnabledAccess] = useState(false)
  const [showModalErroUnloagged, setShowModalErroUnloagged] = useState(false)
  const [enviarOsSelected, setEnviarOsSelected] = useState(false)
  const { mode, connectorDisconnect }: any = Device()

  const isRecoveryOnly = accessMode === 'recoveryOnly'

  function trySwitchMenu(menu: string): void {
    if (menu === 'Atualizar' && !isRecoveryOnly) {
      return
    }
    if (isRecoveryOnly && menu !== 'Atualizar') {
      toast.info(
        t(
          'Modo recuperação: apenas a aba Atualização está disponível. Faça login com senha para acesso completo.'
        )
      )
      return
    }
    handleMenu(menu)
  }

  function handleMenu(menu: string): void {
    switch (menu) {
      case 'config':
        setColorConfig(true)
        setColorStatus(false)
        setColorTerminal(false)
        setColorInstantData(false)
        setColorUpdade(false)
        break
      case 'status':
        setColorConfig(false)
        setColorStatus(true)
        setColorTerminal(false)
        setColorInstantData(false)
        setColorUpdade(false)
        break
      case 'terminal':
        setColorConfig(false)
        setColorStatus(false)
        setColorTerminal(true)
        setColorInstantData(false)
        setColorUpdade(false)
        break

      case 'instantaneous':
        setColorConfig(false)
        setColorStatus(false)
        setColorTerminal(false)
        setColorInstantData(true)
        setColorUpdade(false)
        break

      case 'Atualizar':
        setColorConfig(false)
        setColorStatus(false)
        setColorTerminal(false)
        setColorInstantData(false)
        setColorUpdade(true)
        break

      default:
        break
    }

    setMenuName(menu)
  }

  const handleEnterRecoveryOnly = (): void => {
    setAccessMode('recoveryOnly')
    setEnabledAccess(false)
    setIsModalPassWordOpen(false)
    handleMenu('Atualizar')
  }

  const resetToLoginState = (): void => {
    setAccessMode('none')
    setEnabledAccess(false)
    setIsModalPassWordOpen(false)
    setMenuName('status')
    setColorConfig(false)
    setColorStatus(true)
    setColorTerminal(false)
    setColorInstantData(false)
    setColorUpdade(false)
    pluviFirmware.dispose()
    SerialManager.setIdle()
  }

  /*function closeNoDeviceFoundModal(): void {
    setDeviceFound(null)
  }*/

  async function handleComandSend(comand: string): Promise<string> {
    serialManagerPluviIoT.sendCommandPluviIot(comand)
    const regex = /^mem=\d+\?$/
    // Verifica se deve aplicar timeout
    const shouldUseTimeout = !regex.test(comand)
    console.log('Comando enviado:', shouldUseTimeout)

    // Promessa de timeout (só é criada se necessário)
    const timeoutPromise = shouldUseTimeout
      ? new Promise<string>((_, reject) =>
          setTimeout(() => {
            reject(new Error('TIMEOUT'))
          }, 20000)
        )
      : null

    try {
      // Se não houver timeout, apenas aguarda a resposta normal
      const response = await (timeoutPromise
        ? Promise.race([serialManagerPluviIoT.receiveDataPluvi(), timeoutPromise])
        : serialManagerPluviIoT.receiveReportPluvi())

      console.log(`Resposta do comando ${comand}:`, response)

      // Verifica se a resposta indica erro de login e desativa o acesso
      if (response.includes('Error: Unlogged')) {
        setTimeout(() => {
          revalidateAutentication(comand)
        }, 500)
      }

      return response
    } catch (error: any) {
      if (error.message === 'TIMEOUT') {
        toast.warn(t('Tempo excedido sem resposta do dispositivo. Tente novamente.')) // [CHANGE]
      } else {
        toast.error(t(`Erro ao receber resposta: ${error.message ?? t('desconhecido')}`))
      }
      setIsLoading(false)
      setDeviceFound(false)
      throw error
    }
  }

  // === handleComandSend enxuto (quase igual ao antigo) ===
  /*async function handleComandSend(comand: string, fireAndForget = false): Promise<string> {
    // envia sempre
    try {
      serialManagerPluviIoT.sendCommandPluviIot(comand)
    } catch (e: any) {
      toast.error(`Erro ao enviar comando: ${e?.message ?? 'desconhecido'}`)
      throw e
    }

    // não esperar resposta quando solicitado
    if (fireAndForget) return ''

    const isMemQuery = /^mem=\d+\?$/.test(comand)
    const isLogin = /^lg=/.test(comand)

    // escolha do "receiver" igual ao antigo
    const receivePromise = isMemQuery
      ? serialManagerPluviIoT.receiveReportPluvi()
      : serialManagerPluviIoT.receiveDataPluvi()

    // timeout só para LOGIN; demais = 0 (sem timeout)
    const timeoutMs = isLogin ? 2000 : 20000
    const timeoutPromise =
      timeoutMs > 0
        ? new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
          )
        : null



    try {
      const response = timeoutPromise
        ? await Promise.race([receivePromise, timeoutPromise])
        : await receivePromise

      if (response.includes('Error: Unlogged')) {
        setTimeout(() => {
          revalidateAutentication(comand)
        }, 500)
      }

      console.log(`Resposta do comando ${comand}:`, response)
      return response
    } catch (error: any) {
      if (error?.message === 'TIMEOUT') {
        // só cai aqui em login
        toast.warn('Tempo excedido sem resposta do dispositivo. Tente novamente.')
      } else {
        toast.error(`Erro ao receber resposta: ${error?.message ?? 'desconhecido'}`)
      }
      setIsLoading(false)
      setDeviceFound(false)
      throw error
    }
  }*/

  // Mapeamento dos comandos completos com seus respectivos handlers
  // Mapeamento dos comandos completos com seus respectivos handlers (agora com array)
  const responseHandlers: { [command: string]: ((response: string) => void)[] } = {
    'conex=cfg?': [setDataReceivedComandConection],
    'ps=inst?': [setDataReceivedComandInst],
    'ps=status?': [setDataReceivedComandStatus],
    'gl=cfg?': [setDataReceivedComandGL, setDataReceivedComandGeneralGeolocation],
    'nd=cfg?': [setDataReceivedComandGeneralName],
    'tz=cfg?': [setDataReceivedComandGeneralTimeZone],
    'dt=cfg?': [setDataReceivedComandGeneralTime],
    'p1=cfg?': [setDataReceivedComandPortP1],
    'p2=cfg?': [setDataReceivedComandPortP2],
    'sdi=cfg?': [setDataReceivedComandPortSdi],
    'tf=cfg?': [setDataReceivedComandTimerFixed],
    'td=cfg?': [setDataReceivedComandTimerDynamic],
    'tm=cfg?': [setDataReceivedComandTimerMaintenance],
    'patrimonio=cfg?': [setDataReceivedComandHeritage],
    'resinc=cfg?': [setDataReceivedComandRepeatSync],
    'prot=cfg?': [setDataReceivedComandProtocol],
    'mqtt=cfg?': [setDataReceivedComandProtocolMQTT],
    'ftp=cfg?': [setDataReceivedComandProtocolFTP],
    'http=cfg?': [setDataReceivedComandProtocolHTTP],
    'ntp=cfg?': [setDataReceivedComandNTP]
  }

  function revalidateAutentication(lastCommand: string): void {
    if (props.isConect && !mode.state) {
      handleComandSend(`lg=${PasswordSaved}?`).then((response) => {
        if (response === 'lg=1!') {
          setTimeout(() => {
            handleComandSend(lastCommand).then((response) => {
              console.log('Último comando enviado:', lastCommand)
              console.log('Resposta do último comando:', response)

              const handlers = responseHandlers[lastCommand] // agora pega pelo comando completo

              if (handlers) {
                handlers.forEach((handler) => handler(response))
              } else {
                console.warn(`Nenhum handler definido para o comando: ${lastCommand}`)
              }
            })
          }, 500)
          setEnabledAccess(true)
        }
      })
    }
  }

  function handleSendComandTerminal(comand: string): void {
    setDataReceivedComandTerminal('')
    if (props.isConect && !mode.state && enabledAccess) {
      handleComandSend(comand).then((response) => {
        setDataReceivedComandTerminal(response)
      })
    }
  }

  function handleSendComandMemoryInfo(comand: string): void {
    setDataReceivedComandMemoryInfo('')
    //console.log('Resposta do comando:', comand)
    if (props.isConect && !mode.state && enabledAccess) {
      handleComandSend(`mem=${comand}?`).then((response) => {
        setDataReceivedComandMemoryInfo(response)
        //console.log('Resposta do comando Baixa Relatorio:', response)
      })
    }
  }

  function handleSendComandDownMemory(comand: string): void {
    //console.log('Resposta do comando:', comand)
    setDataReceivedComandMemoryInfoData('')
    if (props.isConect && !mode.state && enabledAccess) {
      handleComandSend(`mem=${comand}?`).then((response) => {
        setDataReceivedComandMemoryInfoData(response)

        //console.log('Resposta do comando mem=info:', response)
      })
    }
  }

  function handleUpdateInst(): void {
    if (props.isConect && !mode.state && enabledAccess) {
      handleComandSend('ps=inst?').then((response) => {
        setDataReceivedComandInst(response)
      })
    }
  }

  function handleUpdateStatus(): void {
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Baixando informações do dispositivo!'))
      setIsLoading(true)

      // Envia o primeiro comando
      handleComandSend('ps=status?')
        .then((responseStatus) => {
          setDataReceivedComandStatus(responseStatus)

          // Envia o segundo comando após o primeiro
          return handleComandSend('gl=cfg?')
        })
        .then((responseCfg) => {
          setDataReceivedComandGL(responseCfg)
          console.log('Resposta de gl=cfg?:', responseCfg)
        })
        .catch((error) => {
          console.error('Erro ao executar comandos:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }

  function handleUpdateReport(): void {
    if (props.isConect && !mode.state && enabledAccess) {
      setDataReceivedComandReport('')
      handleComandSend('rel=cfg?').then((response) => {
        setDataReceivedComandReport(response)
      })
    }
  }

  function handleUpdateConection(): void {
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Baixando informações do dispositivo!'))
      setIsLoading(true)
      setDataReceivedComandConection('')
      handleComandSend('conex=cfg?').then((response) => {
        setDataReceivedComandConection(response)
        setIsLoading(false)
      })
    }
  }
  function handleUpdateGeneral(): void {
    const time = 200
    setDataReceivedComandGeneralName('')
    setDataReceivedComandGeneralGeolocation('')
    setDataReceivedComandGeneralTimeZone('')
    setDataReceivedComandGeneralTime('')
    setDataReceivedComandHeritage('')
    setDataReceivedComandRepeatSync('')
    setDataReceivedComandNTP('')
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Baixando informações do dispositivo!'))
      setIsLoading(true)
      handleComandSend('nd=cfg?').then((response) => {
        setDataReceivedComandGeneralName(response)
        setTimeout(() => {
          handleComandSend('gl=cfg?').then((response) => {
            setDataReceivedComandGeneralGeolocation(response)
            setTimeout(() => {
              handleComandSend('tz=cfg?').then((response) => {
                setDataReceivedComandGeneralTimeZone(response)
                setTimeout(() => {
                  handleComandSend('dt=cfg?').then((response) => {
                    setDataReceivedComandGeneralTime(response)
                    setTimeout(() => {
                      handleComandSend('patrimonio=cfg?').then((response) => {
                        setDataReceivedComandHeritage(response)
                        setTimeout(() => {
                          handleComandSend('resinc=cfg?').then((response) => {
                            setDataReceivedComandRepeatSync(response)
                            setTimeout(() => {
                              handleComandSend('ntp=cfg?').then((response) => {
                                setDataReceivedComandNTP(response)
                                setIsLoading(false)
                              })
                            }, time)
                          })
                        }, time)
                      })
                    }, time)
                  })
                }, time)
              })
            }, time)
          })
        }, time) // Adjust the timeout duration as needed
      })
    }
  }

  function handleUpdatePorts(): void {
    const time = 200
    setDataReceivedComandPortP1('')
    setDataReceivedComandPortP2('')
    setDataReceivedComandPortSdi('')
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Baixando informações do dispositivo!'))
      setIsLoading(true)
      handleComandSend('p1=cfg?').then((response) => {
        setDataReceivedComandPortP1(response)
        setTimeout(() => {
          handleComandSend('p2=cfg?').then((response) => {
            setDataReceivedComandPortP2(response)
            setTimeout(() => {
              handleComandSend('sdi=cfg?').then((response) => {
                setDataReceivedComandPortSdi(response)
                setIsLoading(false)
              })
            }, time)
          })
        }, time) // Adjust the timeout duration as needed
      })
    }
  }

  function handleUpdateTransmition(): void {
    const time = 200
    setDataReceivedComandTimerFixed('')
    setDataReceivedComandTimerDynamic('')
    setDataReceivedComandProtocol('')
    setDataReceivedComandProtocolMQTT('')
    setDataReceivedComandProtocolFTP('')
    setDataReceivedComandProtocolHTTP('')
    setDataReceivedComandTimerMaintenance('')

    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Baixando informações do dispositivo!'))
      setIsLoading(true)
      handleComandSend('tf=cfg?').then((response) => {
        setDataReceivedComandTimerFixed(response)
        setTimeout(() => {
          handleComandSend('td=cfg?').then((response) => {
            setDataReceivedComandTimerDynamic(response)
            setTimeout(() => {
              handleComandSend('prot=cfg?').then((response) => {
                setDataReceivedComandProtocol(response)
                setTimeout(() => {
                  handleComandSend('mqtt=cfg?').then((response) => {
                    setDataReceivedComandProtocolMQTT(response)
                    setTimeout(() => {
                      handleComandSend('ftp=cfg?').then((response) => {
                        setDataReceivedComandProtocolFTP(response)
                        setTimeout(() => {
                          handleComandSend('http=cfg?')
                            .then((httpResponse) => {
                              setDataReceivedComandProtocolHTTP(httpResponse)
                            })
                            .catch(() => {
                              setDataReceivedComandProtocolHTTP('')
                            })
                            .finally(() => {
                              setTimeout(() => {
                                handleComandSend('tm=cfg?').then((tmResponse) => {
                                  setDataReceivedComandTimerMaintenance(tmResponse)
                                  setIsLoading(false)
                                })
                              }, time)
                            })
                        }, time)
                      })
                    }, time)
                  })
                }, time)
              })
            }, time)
          })
        }, time) // Adjust the timeout duration as needed
      })
    }
  }

  function handleSendReport(list: string[]): void {
    //console.log('Lista de valores:', list)
    const mapKeys = ['p1', 'p2', 'gl', 'bt', 'sig', 'sdi', 'moti']
    const formattedString =
      'rel=' + mapKeys.map((key, index) => `${key}>${list[index]}`).join(';') + '!'
    //console.log(formattedString)

    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Enviando configurações para o dispositivo!'))
      setIsLoading(true)
      handleComandSend(formattedString).then(() => {
        //console.log('Resposta do alterar relatorio:', response)
        //setDataReceivedComandReport(response)
        setIsLoading(false)
      })
    }
  }

  function handleSendPorts(list: string[]): void {
    //console.log('Lista de valores:', list)
    const time = 500
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Enviando configurações para o dispositivo!'))
      setIsLoading(true)
      handleComandSend(`p1=${list[0]}!`).then(() => {
        //console.log('Resposta do alterar Nome:', response)
        setTimeout(() => {
          handleComandSend(`p2=${list[1]}!`).then(() => {
            //console.log('Resposta do alterar Nome:', response)
            setTimeout(() => {
              handleComandSend(`sdi=${list[2]}!`).then(() => {
                // console.log('Resposta do alterar Nome:', response)
                setTimeout(() => {
                  setIsLoading(false)
                  handleUpdatePorts()
                }, time)
              })
            }, time)
          })
        })
      })
    }
  }

  function handleSendTransmition(list: string[]): void {
    //console.log('Lista de valores:', list)
    const time = 200
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Enviando configurações para o dispositivo!'))
      setIsLoading(true)
      handleComandSend(`tf=${list[0]}!`).then(() => {
        //console.log('Resposta do alterar Nome:', response)
        setTimeout(() => {
          handleComandSend(`td=${list[1]}!`).then(() => {
            //console.log('Resposta do alterar Nome:', response)
            setTimeout(() => {
              handleComandSend(`prot=${list[2]}!`).then(() => {
                //console.log('Resposta do alterar Nome:', response)
                setTimeout(() => {
                  handleComandSend(`mqtt=${list[3]}!`).then(() => {
                    //console.log('Resposta do alterar Nome:', response)
                    setTimeout(() => {
                      handleComandSend(`ftp=${list[4]}!`).then(() => {
                        //console.log('Resposta do alterar Nome:', response)
                        setTimeout(() => {
                          const httpPayload = list[6] ?? ''
                          const sendHttp = httpPayload
                            ? handleComandSend(`http=${httpPayload}!`)
                            : Promise.resolve('')
                          sendHttp
                            .catch(() => '')
                            .then(() => {
                              setTimeout(() => {
                                handleComandSend(`tm=${list[5]}!`).then(() => {
                                  //console.log('Resposta do alterar timer manutencao:', response)
                                  setIsLoading(false)
                                })
                              }, time)
                            })
                        }, time)
                      })
                    }, time)
                  })
                }, time)
              })
            }, time)
          })
        })
      })
    }
  }

  function handleSendConection(list: string[]): void {
    // Verifica se a lista tem ao menos 5 elementos

    // Formata a string no padrão desejado
    const formattedString = `conex=${list.slice(0, 5).join(';')}!`

    //console.log('String de dados de conexao a se enviada:', formattedString) // Para debug

    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Enviando configurações para o dispositivo!'))
      setIsLoading(true)
      handleComandSend(formattedString).then((response) => {
        console.log('Resposta de conexão:', response)
        setIsLoading(false)
        // setDataReceivedComandReport(response);
      })
    }
  }

  function handleChangeNewPassword(password: string): void {
    //console.log('Nova Senha:', `lg=${password}!`)
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Enviando configurações para o dispositivo!'))
      setIsLoading(true)
      handleComandSend(`lg=${password}!`).then(() => {
        //console.log('Resposta do alterar senha:', response)
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      })
    }
  }

  function handleSendGeneral(list: string[]): void {
    //console.log('Nova Senha:', `lg=${password}!`)
    const time = 500
    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading(t('Enviando configurações para o dispositivo!'))
      setIsLoading(true)
      handleComandSend(`nd=${list[0]}!`).then(() => {
        setTimeout(() => {
          handleComandSend(`gl=${list[1]}!`).then(() => {
            setTimeout(() => {
              handleComandSend(`tz=${list[2]}!`).then(() => {
                setTimeout(() => {
                  handleComandSend(`patrimonio=${list[4]}!`).then(() => {
                    setTimeout(() => {
                      handleComandSend(`resinc=${list[5]}!`).then((response) => {
                        console.log('Resposta do resinc:', response)
                        setTimeout(() => {
                          handleComandSend(`ntp=${list[6]}!`).then(() => {
                            console.log('Resposta do resinc:', response)
                            setIsLoading(false)
                          })
                        }, time)
                      })
                    }, time)
                  })
                }, time)
              })
            }, time)
          })
        }, time)
      })
    }
  }

  /*const handlePasswordValidation = async (password: string): Promise<PasswordValidationResult> => {
    // bloco só roda quando conectado e NÃO em modo offline
    if (props.isConect && !mode.state) {
      try {
        const raw = await handleComandSend(`lg=${password}?`)
        const resp = String(raw).trim()

        // ✅ sucesso explícito
        if (resp === 'lg=1!') {
          setEnabledAccess(true)
          setPasswordSaved(password)
          setIsModalPassWordOpen(false) // [CHANGE] fecha modal no sucesso
          return { success: true }
        }

        // ❌ senha errada (mapeie todas as variantes conhecidas)
        if (resp === 'lg=0!' || /wrong\s*password/i.test(resp) || /senha\s*incorreta/i.test(resp)) {
          setEnabledAccess(false)
          return { success: false, errorCode: 'wrong-password', message: resp }
        }

        // ❌ comando inválido/desconhecido → NÃO é senha errada
        if (/invalid\s*command/i.test(resp) || /unknown\s*command/i.test(resp)) {
          setEnabledAccess(false)
          return { success: false, errorCode: 'invalid-command', message: resp }
        }

        // ❌ outros textos de erro viram inesperado
        setEnabledAccess(false)
        return { success: false, errorCode: 'unexpected', message: resp }
      } catch (e: any) {
        // timeouts, cabo solto, etc.
        setEnabledAccess(false)
        return { success: false, errorCode: 'connection-error', message: e?.message }
      }
    }

    // não conectado ou offline
    setEnabledAccess(false)
    return { success: false, errorCode: 'connection-error', message: 'not-connected-or-offline' }
  }*/

  // helper: pega o último token de login da resposta
  // === helper p/ extrair o último token de login ===
  const pickLastLoginToken = (s: string) => {
    const m = String(s)
      .replace(/\r/g, '')
      .match(/lg=\d!/g)
    return m && m.length ? m[m.length - 1] : String(s).trim()
  }

  // === handlePasswordValidation usando o fire-and-forget e último token ===
  const handlePasswordValidation = async (password: string): Promise<PasswordValidationResult> => {
    if (props.isConect && !mode.state) {
      try {
        // reset de login sem esperar
        await handleComandSend('lg=0?')

        // opcional: micro intervalo para reduzir colagem de respostas
        await new Promise((r) => setTimeout(r, 80))

        const raw = await handleComandSend(`lg=${password}?`) // timeout só aqui (3s)
        const token = pickLastLoginToken(raw)

        if (token === 'lg=1!') {
          setAccessMode('full')
          setEnabledAccess(true)
          setPasswordSaved(password)
          setIsModalPassWordOpen(false)
          handleMenu('status')
          return { success: true }
        }

        if (token === 'lg=0!' || /wrong\s*password/i.test(raw) || /senha\s*incorreta/i.test(raw)) {
          setAccessMode('none')
          setEnabledAccess(false)
          return { success: false, errorCode: 'wrong-password', message: String(raw).trim() }
        }

        if (/invalid\s*command/i.test(raw) || /unknown\s*command/i.test(raw)) {
          setEnabledAccess(false)
          return { success: false, errorCode: 'invalid-command', message: String(raw).trim() }
        }

        setEnabledAccess(false)
        return { success: false, errorCode: 'unexpected', message: String(raw).trim() }
      } catch (e: any) {
        setEnabledAccess(false)
        return { success: false, errorCode: 'connection-error', message: e?.message }
      }
    }

    setEnabledAccess(false)
    return { success: false, errorCode: 'connection-error', message: 'not-connected-or-offline' }
  }

  const handleCloseModalErroUnlogged = (): void => {
    setShowModalErroUnloagged(false)
  }

  useEffect(() => {
    if (!props.isConect || mode.state) {
      resetToLoginState()
      return
    }

    if (accessMode !== 'none') {
      setIsModalPassWordOpen(false)
      return
    }

    setIsModalPassWordOpen(true)
  }, [mode.state, props.isConect, accessMode])

  useEffect(() => {
    return () => {
      pluviFirmware.dispose()
      SerialManager.setIdle()
    }
  }, [])

  useEffect(() => {
    if (enabledAccess) {
      handleUpdateStatus()
    }
  }, [enabledAccess])

  //console.log('Device mode:', props.isConect, isModalPassWordOpen)

  const tabClass = (active: boolean, disabled = false): string =>
    `inline-flex shrink-0 items-center gap-1.5 overflow-visible rounded-t-md px-3 py-2 text-sm font-medium leading-normal transition-colors duration-150 ${
      active
        ? 'border-b-2 border-sky-500 text-sky-600'
        : 'border-b-2 border-transparent text-zinc-500 hover:text-sky-500'
    } ${disabled ? 'cursor-not-allowed opacity-40 hover:text-zinc-500' : ''}`

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'PluviDB-IoT'}>
        <Drop size={30} />
      </HeaderDevice>

      <div className="mb-4 ml-8 mr-8 mt-4 flex w-full max-w-4xl flex-col justify-start overflow-visible rounded-lg border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white pb-4 text-sm text-zinc-500 shadow-sm">
        {isRecoveryOnly && (
          <div className="mx-8 mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {t('Modo recuperação — apenas atualização de firmware. Desconecte e reconecte para login completo.')}
          </div>
        )}
        <header className="mx-4 mt-3 shrink-0 overflow-visible border-b border-sky-500 sm:mx-8">
          <div className="flex min-h-11 flex-wrap items-end justify-start gap-1 overflow-visible sm:gap-2">
            <button
              className={tabClass(colorStatus, isRecoveryOnly)}
              onClick={() => trySwitchMenu('status')}
              disabled={isRecoveryOnly}
            >
              <Info size={16} />
              {t('Status')}
            </button>

            <button
              className={tabClass(colorInstantData, isRecoveryOnly)}
              onClick={() => trySwitchMenu('instantaneous')}
              disabled={isRecoveryOnly}
            >
              <Gauge size={16} />
              {t('Dados Instantâneos')}
            </button>

            <button
              className={tabClass(colorConfig, isRecoveryOnly)}
              onClick={() => trySwitchMenu('config')}
              disabled={isRecoveryOnly}
            >
              <GearSix size={16} />
              {t('Configuração')}
            </button>

            <button
              className={tabClass(colorTerminal, isRecoveryOnly)}
              onClick={() => trySwitchMenu('terminal')}
              disabled={isRecoveryOnly}
            >
              <TerminalWindow size={16} />
              {t('Terminal')}
            </button>
            {isRecoveryOnly && (
              <button
                className={tabClass(colorUpdate)}
                onClick={() => trySwitchMenu('Atualizar')}
              >
                <ArrowsClockwise size={16} />
                {t('Atualizar Firmware')}
              </button>
            )}
          </div>
        </header>

        {
          <div className="ml-4 mr-4 h-auto min-w-0 max-w-full overflow-x-hidden overflow-y-auto sm:ml-8 sm:mr-8">
            {MenuName === 'status' ? (
              <Status
                handleUpdateStatus={handleUpdateStatus}
                receivedDataStatus={dataReceivedComandStatus}
                receivedDataGeolocation={dataReceivedComandGL}
                handleSendDownReport={handleSendComandDownMemory}
                handleSendInfoReport={handleSendComandMemoryInfo}
                receivedDataDownReport={dataReceivedComandMemoryInfoData}
                receivedInfoMemory={dataReceivedComandMemoryInfo}
                handleClearDataMemory={() => setDataReceivedComandMemoryInfoData('')}
              />
            ) : MenuName === 'config' ? (
              <Settings
                handleUpdateSettingsReport={handleUpdateReport}
                receiverSettingsReport={dataReceivedComandReport}
                handleSendSettingsReport={handleSendReport}
                handleSendChargePassword={handleChangeNewPassword}
                handleUpdateSettingsConection={handleUpdateConection}
                receiverSettingsConection={dataReceivedComandConection}
                handleSendSettingsConection={handleSendConection}
                handleSendSettingsGeneral={handleSendGeneral}
                handleUpdateSettingsGeneral={handleUpdateGeneral}
                receiverGeneralName={dataReceivedComandGeneralName}
                receiverGeneralGeolocation={dataReceivedComandGeneralGeolocation}
                receiverGeneralTimeZone={dataReceivedComandGeneralTimeZone}
                receiverGeneralTime={dataReceivedComandGeneralTime}
                handleSendSettingsPorts={handleSendPorts}
                handleUpdateSettingsPorts={handleUpdatePorts}
                receiverSettingsPortP1={dataReceivedComandPortP1}
                receiverSettingsPortP2={dataReceivedComandPortP2}
                receiverSettingsPortSdi={dataReceivedComandPortSdi}
                handleSendSettingsTransmition={handleSendTransmition}
                handleUpdateSettingsTransmition={handleUpdateTransmition}
                receivedTimerFixed={dataReceivedComandTimerFixed}
                receivedTimerdynamic={dataReceivedComandTimerDynamic}
                receivedProtocol={dataReceivedComandProtocol}
                receivedProtocolDataMQTT={dataReceivedComandProtocolMQTT}
                receivedProtocolDataFTP={dataReceivedComandProtocolFTP}
                receivedProtocolDataHTTP={dataReceivedComandProtocolHTTP}
                receivedTimerMaintenance={dataReceivedComandTimerMaintenance}
                receiverHeritage={dataReceivedComandHeritage}
                receivedRepeatSync={dataReceivedComandRepeatSync}
                receivedNPT={dataReceivedComandNTP}
              />
            ) : MenuName === 'terminal' ? (
              <Terminal
                receiverTerminal={dataReceivedComandTerminal}
                handleSendComandTerminal={handleSendComandTerminal}
              />
            ) : MenuName === 'instantaneous' ? (
              <InstantData
                handleUpdateInst={handleUpdateInst}
                receivedDataInst={dataReceivedComandInst}
              />
            ) : isRecoveryOnly && MenuName === 'Atualizar' ? (
              <Update isConect={props.isConect} />
            ) : null}
          </div>
        }
      </div>
      {/*deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )*/}

      <LoadingData visible={isLoading} title={messageIsLoading} />

      {isModalPassWordOpen && (
        <PasswordModal
          onClose={() => setIsModalPassWordOpen(false)}
          onCancel={() => {
            resetToLoginState()
            connectorDisconnect?.()
          }}
          onEnterRecoveryOnly={handleEnterRecoveryOnly}
          enviarOsMode={enviarOsSelected}
          onValidatePassword={handlePasswordValidation}
        />
      )}
      <ModalErroUnloagged show={showModalErroUnloagged} onClose={handleCloseModalErroUnlogged} />
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice
        DeviceName={'PluviDB-IoT'}
        rightSlot={
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors ${
              enviarOsSelected ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-white/60 text-[#1769A0] focus:ring-white/40 focus:ring-offset-0"
              checked={enviarOsSelected}
              onChange={() => setEnviarOsSelected((prev) => !prev)}
            />
            <span className="text-xs font-semibold text-white/90">{t('Atualizar Firmware')}</span>
          </label>
        }
      >
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice
        image={ImgPluviDBIotBanner}
        link="https://dualbase.com.br/produto/pluvidb-iot/"
        fit="contain"
      />

      <div className="flex w-full flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>PluviDB-IoT</b> é uma solução pluviométrica compacta e inteligente, que integra o pluviômetro PluviDB a um transmissor IoT de baixíssimo consumo. Projetado para redes modernas, transmite dados via <b>4G/5G, incluindo NB-IoT e LTE-M</b>, com foco em autonomia, simplicidade de instalação e redução de infraestrutura. Possui bateria integrada de longa duração, dispensando o uso de painel solar." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            • <RichText i18nKey="<b>Transmissão IoT com baixo consumo energético</b>;" />
          </p>
          <p>
            •{' '}
            <RichText i18nKey="<b>Bateria integrada de longa duração, sem necessidade de painel solar</b>;" />
          </p>
          <p>
            •{' '}
            <RichText i18nKey="<b>Instalação rápida e excelente escalabilidade para grandes redes</b>." />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            <RichText i18nKey="Redes urbanas de chuva, defesa civil, <i>smart cities</i>, monitoramento distribuído e expansão de cobertura observacional." />
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
