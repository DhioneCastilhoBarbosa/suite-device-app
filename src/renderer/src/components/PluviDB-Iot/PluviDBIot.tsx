import { Drop } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgPluviDBIot from '../../assets/PluviDB-Iot.svg'
import { ImageDevice } from '../imageDevice/ImageDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import SerialManagerRS232 from '@renderer/utils/serial'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { Device } from '../../Context/DeviceContext'
import Status from './components/status'

import { Terminal } from './components/terminal'
import LoadingData from '../loading/loadingData'
import { useEffect, useState } from 'react'
import { InstantData } from './components/intantData'
import PasswordModal from './components/Login'
import { ModalErroUnloagged } from '../modal/modalUnlogged'

import { Update } from './components/update'

interface PluviDBIotProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

const serialManagerPluviIoT = new SerialManagerRS232()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OpenPortPluviIoT({ portName, bauld }: SerialProps) {
  serialManagerPluviIoT.openPortRS232(portName, bauld)
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
  const [enabledAccess, setEnabledAccess] = useState(false)
  const [showModalErroUnloagged, setShowModalErroUnloagged] = useState(false)
  const { mode }: any = Device()

  function handleMenu(menu): void {
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

  function closeNoDeviceFoundModal(): void {
    setDeviceFound(null)
  }

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
            reject(new Error('Tempo limite excedido (20s) para resposta do comando'))
          }, 20000)
        )
      : null

    try {
      // Se não houver timeout, apenas aguarda a resposta normal
      const response = await (timeoutPromise
        ? Promise.race([serialManagerPluviIoT.receiveDataPluvi(), timeoutPromise])
        : serialManagerPluviIoT.receiveReportPluvi())

      //console.log(`Resposta do comando ${comand}:`, response)

      // Verifica se a resposta indica erro de login e desativa o acesso
      if (response.includes('Error: Unlogged')) {
        setTimeout(() => {
          revalidateAutentication(comand)
        }, 500)
      }

      return response
    } catch (error) {
      console.error(`Erro ao receber resposta do comando ${comand}:`, error)
      setIsLoading(false)
      setDeviceFound(false)
      throw error
    }
  }

  function revalidateAutentication(lastComand: string): void {
    if (props.isConect && !mode.state) {
      handleComandSend(`lg=${PasswordSaved}?`).then((response) => {
        //console.log('Recebeu erro: unlogged e revalidou:', response)
        if (response === 'lg=1!') {
          /*setTimeout(() => {
            handleComandSend(lastComand).then((response) => {
              console.log('Ultimo comando enviado:', lastComand)
              console.log('Resposta do ultimo comando:', response)
            })
          }, 500)*/
          setShowModalErroUnloagged(true)
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
      setMessageIsLoading('Baixando informações do dispositivo!')
      setIsLoading(true)
      handleComandSend('ps=status?').then((response) => {
        setDataReceivedComandStatus(response)
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
      setMessageIsLoading('Baixando informações do dispositivo!')
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
      setMessageIsLoading('Baixando informações do dispositivo!')
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
      setMessageIsLoading('Baixando informações do dispositivo!')
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
    setDataReceivedComandTimerMaintenance('')

    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading('Baixando informações do dispositivo!')
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
                          handleComandSend('tm=cfg?').then((response) => {
                            setDataReceivedComandTimerMaintenance(response)
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
      setMessageIsLoading('Enviando configurações para o dispositivo!')
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
      setMessageIsLoading('Enviando configurações para o dispositivo!')
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
      setMessageIsLoading('Enviando configurações para o dispositivo!')
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
        })
      })
    }
  }

  function handleSendConection(list: string[]): void {
    // Verifica se a lista tem ao menos 5 elementos

    // Formata a string no padrão desejado
    const formattedString = `conex=${list.slice(0, 5).join(';')}!`

    //console.log('String formatada:', formattedString) // Para debug

    if (props.isConect && !mode.state && enabledAccess) {
      setMessageIsLoading('Enviando configurações para o dispositivo!')
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
      setMessageIsLoading('Enviando configurações para o dispositivo!')
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
      setMessageIsLoading('Enviando configurações para o dispositivo!')
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

  const handlePasswordValidation = async (password: string): Promise<boolean> => {
    if (props.isConect && !mode.state) {
      try {
        const response = await handleComandSend(`lg=${password}?`)
        //console.log('Resposta da validação de senha:', response)

        const acessoLiberado = response === 'lg=1!'
        setEnabledAccess(acessoLiberado) // Atualiza o estado global`
        setPasswordSaved(password) // Salva a senha para futuras
        return acessoLiberado
      } catch {
        setEnabledAccess(false) // Garante que fica false em caso de erro
        return false
      }
    }
    return false // Retorna false caso a validação não ocorra
  }

  const handleCloseModalErroUnlogged = (): void => {
    setShowModalErroUnloagged(false)
  }

  useEffect(() => {
    if (props.isConect && !mode.state) {
      setIsModalPassWordOpen(true)
    } else {
      setIsModalPassWordOpen(false)
      setEnabledAccess(false)
    }
  }, [mode.state, props.isConect])

  useEffect(() => {
    if (enabledAccess) {
      handleUpdateStatus()
    }
  }, [enabledAccess])

  //console.log('Device mode:', props.isConect, isModalPassWordOpen)

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'PluviDB-IoT'}>
        <Drop size={30} />
      </HeaderDevice>

      <div className=" flex flex-col justify-center  bg-white mr-8 ml-8 mt-4 rounded-lg text-zinc-500 text-sm w-full max-w-4xl mb-1">
        <header className="flex items-start justify-between mr-8 ml-8 mt-4 border-b-[1px] border-sky-500 min-h-10">
          <div className="flex gap-4">
            <button
              className={`border-b-2 border-transparent ${
                colorStatus ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('status')}
            >
              Status
            </button>

            <button
              className={`border-b-2 border-transparent ${
                colorInstantData ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('instantaneous')}
            >
              Dados Instantâneos
            </button>

            <button
              className={`border-b-2 border-transparent ${
                colorConfig ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('config')}
            >
              Configuração
            </button>

            <button
              className={`border-b-2 border-transparent ${
                colorTerminal ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('terminal')}
            >
              Terminal
            </button>
            {/*<button
              className={`border-b-2 border-transparent ${
                colorUpdate ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('Atualizar')}
            >
              Atualização
            </button>*/}
          </div>
        </header>

        {
          <div className=" h-auto overflow-y-auto mr-8 ml-8">
            {MenuName === 'status' ? (
              <Status
                handleUpdateStatus={handleUpdateStatus}
                receivedDataStatus={dataReceivedComandStatus}
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
            ) : (
              MenuName === 'Atualizar' && <Update />
            )}
          </div>
        }
      </div>
      {deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}

      <LoadingData visible={isLoading} title={messageIsLoading} />

      {isModalPassWordOpen && (
        <PasswordModal
          onClose={() => setIsModalPassWordOpen(false)}
          onValidatePassword={handlePasswordValidation}
        />
      )}
      <ModalErroUnloagged show={showModalErroUnloagged} onClose={handleCloseModalErroUnlogged} />
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={'PluviDB-IoT'}>
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice image={ImgPluviDBIot} link="https://dualbase.com.br/produto/pluvidb-iot/" />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg">
        <CardInformation title="VISÃO GERAL">
          <p>
            O PluviDB-IoT é um telepluviometro, sendo um medidor de chuva com tecnologia embarcada.
          </p>
          <p>
            Possui simultaneamente com conexão via 4G – LTE-M CAT-M1 e NB-IoT versão 2 (NB2)
            compatível com 3GPP LTE release 14.
          </p>
          <p>
            Empregando as melhores técnicas de redução de consumo energético, o PluviDB-IoT funciona
            com bateria não recarregável de Lítio primária que pode alcançar autonomia maior que 5
            anos.
          </p>

          <p>Acompanha Certificado de Calibração rastreado a RBC conforme IEC 17025.</p>
          <p>Homologação ANATEL: 08591-24-11455</p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>Princípio de báscula instável, construído integralmente com materiais inoxidáveis</p>
          <p>Com dispositivo regulador de vazão, sistema de nivelamento com nível de bolha</p>
          <p>Corpo em alumínio, aço inox e pintura epóxi</p>
          <p>
            Bordas internas em formato de ângulo reto e borda externa com formato de ângulo oblíquo,
            que minimizam efeitos de turbulência do vento. Atende requisitos WMO.
          </p>
          <p>2 portas de medição de pulso</p>
          <p>ARM Cortex M33, Memória Flash de 64Mb para armazenamento de dados</p>
          <p>Configurável via / Bluetooth (BLE) e USB-C - (Windows/Linux/Android)</p>
          <p>Frequências LTE de 700 a 2200 Mhz</p>
          <p>
            Cat-M1: B1, B2, B3, B4, B5, B8, B12, B13, B14, B17, B18, B19, B20, B25, B26, B28, B66
          </p>
          <p>NB1/NB2: B1, B2, B3, B4, B5, B8, B12, B13, B17, B19, B20, B25, B26, B28, B66 </p>
          <p>Funções eDRX e PSM power saving.</p>
          <p>Protocolos: MQTT, HTTP, NTP, FTP entre outros</p>
          <p>Bateria interna de lítio primária Li-SOCl2 – 2D/3,6V</p>
        </CardInformation>

        <CardInformation title="ESPECIFICAÇÃO">
          <p>Capacidade: 0 a 500 mm/h</p>
          <p>Resolução: 0,2 mm</p>
          <p>Faixa de operação: -20 a 70 °C | 0 a 100% UR</p>
          <p>Incerteza máxima associada: 5% @ 0 a 200 mm/h</p>
          <p>Sistema de nivelamento : Nível de bolha</p>
          <p>Área de captação: 314 cm²</p>
          <p>Diâmetro do funil : 200 0,5 mm</p>
          <p>Sinal de saída : Duplo reed-switch, Pulso NA de 100 ms.</p>
          <p>Grau de Proteção: IP 66</p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
