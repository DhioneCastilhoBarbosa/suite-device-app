import { Rss } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgTsatDb from '../../assets/TsatDB.svg'
import { ImageDevice } from '../imageDevice/ImageDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import SerialManagerRS232 from '@renderer/utils/serial'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { Device } from '@renderer/Context/DeviceContext'
import Status from './components/status'
import Gps from './components/gps'
import { useEffect, useState } from 'react'
import { Terminal } from './components/terminal'
import { TransmissionTest } from './components/transmitionTest'
import LoadingData from '../loading/loadingData'
import { AntenaPointing } from './components/antennapointing'

interface TSatDBProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

const serialManagerTsatDB = new SerialManagerRS232()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OpenPortTSatDB({ portName, bauld }: SerialProps) {
  serialManagerTsatDB.openPortRS232(portName, bauld)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function ClosePortTSatDB() {
  try {
    // Fecha a porta
    serialManagerTsatDB.closePortRS232()
    //console.log('Porta fechada com sucesso')
  } catch (error) {
    //console.error('Erro ao tentar fechar a porta:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function TSatDB(props: TSatDBProps) {
  const [MenuName, setMenuName] = useState('status')
  const [colorConfig, setColorConfig] = useState(false)
  const [colorStatus, setColorStatus] = useState(true)
  const [colorGps, setColorGps] = useState(false)
  const [colorTerminal, setColorTerminal] = useState(false)
  const [colorTeste, setColorTeste] = useState(false)
  const [colorApontamento, setColorApontamento] = useState(false)

  // variaveis de dados recebidos da porta serial ao enviar um determinado comanda
  const [dataReceivedComandVER, setDataReceivedComandVER] = useState<string>('')
  const [dataReceivedComandRST, setDataReceivedComandRST] = useState<string>('')
  const [dataReceivedComandTIME, setDataReceivedComandTIME] = useState<string>('')
  const [dataReceivedComandTEMP, setDataReceivedComandTEMP] = useState<string>('')
  const [dataReceivedComandPOS, setDataReceivedComandPOS] = useState<string>('')
  const [dataReceivedComandGPS, setDataReceivedComandGPS] = useState<string>('')
  const [dataReceivedComandPowerTX, setDataReceivedComandPowerTx] = useState<string>('')
  const [dataReceivedComandRCFG, setDataReceivedComandRCFG] = useState<string>('')
  const [dataReceivedComandTerminal, setDataReceivedComandTerminal] = useState<string>('')
  const [messageIsLoading, setMessageIsLoading] = useState<string>(
    'Baixando informações do dispositivo!'
  )
  //FIM
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [deviceFound, setDeviceFound] = useState<boolean | null>(null) // null indica que a varredura ainda não foi iniciada
  const { mode, PortOpen }: any = Device()

  function handleMenu(menu): void {
    switch (menu) {
      case 'config':
        setColorConfig(true)
        setColorStatus(false)
        setColorGps(false)
        setColorTerminal(false)
        setColorTeste(false)
        setColorApontamento(false)
        break
      case 'status':
        setColorConfig(false)
        setColorStatus(true)
        setColorGps(false)
        setColorTerminal(false)
        setColorTeste(false)
        setColorApontamento(false)
        break
      case 'gps':
        setColorConfig(false)
        setColorStatus(false)
        setColorGps(true)
        setColorTerminal(false)
        setColorTeste(false)
        setColorApontamento(false)
        break
      case 'terminal':
        setColorConfig(false)
        setColorStatus(false)
        setColorGps(false)
        setColorTerminal(true)
        setColorTeste(false)
        setColorApontamento(false)
        break
      case 'teste':
        setColorConfig(false)
        setColorStatus(false)
        setColorGps(false)
        setColorTerminal(false)
        setColorTeste(true)
        setColorApontamento(false)
        break
      case 'apontamento':
        setColorConfig(false)
        setColorStatus(false)
        setColorGps(false)
        setColorTerminal(false)
        setColorTeste(false)
        setColorApontamento(true)
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
    serialManagerTsatDB.sendCommandTSatDB(comand)
    let response = ''
    response = await serialManagerTsatDB.receiveDataTSatDB()
    //console.log(`Resposta do comando ${comand}:`, response)
    return response
  }

  function handleSendComandTerminal(comand: string): void {
    if (props.isConect && !mode.state) {
      handleComandSend(comand).then((response) => {
        setDataReceivedComandTerminal(response)
      })
    }
  }

  function handlesSettingsFactory(): void {
    if (props.isConect && !mode.state) {
      handleComandSend('DEFAULT').then(() => {
        setTimeout(() => {
          handleComandSend('SAVE')
        }, 200)
      })
    }
  }

  function handleSettingsComand(): void {
    if (props.isConect && !mode.state) {
      setMessageIsLoading('Baixando informações do dispositivo!')
      setIsLoading(true)
      setDataReceivedComandPowerTx('')
      setDataReceivedComandRCFG('')
      handleComandSend('techmode alpha').then(() => {
        setTimeout(() => {
          handleComandSend('PWRLVL').then((response) => {
            setDataReceivedComandPowerTx(response)
            setTimeout(() => {
              handleComandSend('usermode').then(() => {
                setTimeout(() => {
                  handleComandSend('save').then(() => {
                    setTimeout(() => {
                      handleComandSend('rcfg').then((response) => {
                        setDataReceivedComandRCFG(response)
                        setIsLoading(false)
                      })
                    }, 1000)
                  })
                }, 1000)
              })
            }, 1000)
          })
        }, 1000)
      })
    }
  }

  function handleComandUdateGPS(): void {
    if (props.isConect && !mode.state) {
      handleComandSend('gps').then((response) => {
        setDataReceivedComandGPS(response)
        setTimeout(() => {
          handleComandSend('pos').then((response) => {
            setDataReceivedComandPOS(response)
            setTimeout(() => {
              handleComandSend('RST').then((response) => {
                setDataReceivedComandRST(response)
              })
            }, 1000)
          })
        }, 1000)
      })
    }
  }

  function executeListCommand(): void {
    const time = 1000
    if (props.isConect && !mode.state) {
      handleComandSend('time').then((response) => {
        setDataReceivedComandTIME(response)
        setTimeout(() => {
          handleComandSend('ver').then((response) => {
            setDataReceivedComandVER(response)
            setTimeout(() => {
              handleComandSend('RST').then((response) => {
                setDataReceivedComandRST(response)
                setTimeout(() => {
                  handleComandSend('rtemp').then((response) => {
                    setDataReceivedComandTEMP(response)
                    setTimeout(() => {
                      handleComandSend('pos').then((response) => {
                        setDataReceivedComandPOS(response)
                        setTimeout(() => {
                          handleComandSend('gps').then((response) => {
                            setDataReceivedComandGPS(response)
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

  function handleSendSetings(settings: string[]): void {
    const time = 200
    if (props.isConect && !mode.state) {
      setIsLoading(true)
      setMessageIsLoading('Enviando informações para o dispositivo!')
      handleComandSend('techmode alpha').then(() => {
        setTimeout(() => {
          handleComandSend('pwrlvl=' + settings[0] + ',' + settings[1] + ',' + settings[2]).then(
            () => {
              setTimeout(() => {
                handleComandSend('usermode').then(() => {
                  setTimeout(() => {
                    handleComandSend('save').then(() => {
                      setTimeout(() => {
                        handleComandSend('NESID=' + settings[3]).then(() => {
                          setTimeout(() => {
                            handleComandSend('TCH=' + settings[4]).then(() => {
                              setTimeout(() => {
                                handleComandSend('TBR=' + settings[5]).then(() => {
                                  setTimeout(() => {
                                    handleComandSend('TIN=' + settings[6]).then(() => {
                                      setTimeout(() => {
                                        handleComandSend('FTT=' + settings[7]).then(() => {
                                          setTimeout(() => {
                                            handleComandSend('TWL=' + settings[8]).then(() => {
                                              setTimeout(() => {
                                                handleComandSend('CMSG=' + settings[9]).then(() => {
                                                  setTimeout(() => {
                                                    handleComandSend('EBM=' + settings[10]).then(
                                                      () => {
                                                        setTimeout(() => {
                                                          handleComandSend(
                                                            'TPR=' + settings[11]
                                                          ).then(() => {
                                                            setTimeout(() => {
                                                              handleComandSend(
                                                                'TDF=' + settings[12]
                                                              ).then(() => {
                                                                setTimeout(() => {
                                                                  handleComandSend(
                                                                    'RCH=' + settings[13]
                                                                  ).then(() => {
                                                                    setTimeout(() => {
                                                                      handleComandSend(
                                                                        'RBR=' + settings[14]
                                                                      ).then(() => {
                                                                        setTimeout(() => {
                                                                          handleComandSend(
                                                                            'RIN=' + settings[15]
                                                                          ).then(() => {
                                                                            setTimeout(() => {
                                                                              handleComandSend(
                                                                                'RPC=' +
                                                                                  settings[16]
                                                                              ).then(() => {
                                                                                setTimeout(() => {
                                                                                  handleComandSend(
                                                                                    'RRC=' +
                                                                                      settings[17]
                                                                                  ).then(() => {
                                                                                    setTimeout(
                                                                                      () => {
                                                                                        handleComandSend(
                                                                                          'RDF=' +
                                                                                            settings[18]
                                                                                        ).then(
                                                                                          () => {
                                                                                            setTimeout(
                                                                                              () => {
                                                                                                handleComandSend(
                                                                                                  'RMC=' +
                                                                                                    settings[19]
                                                                                                ).then(
                                                                                                  () => {
                                                                                                    setTimeout(
                                                                                                      () => {
                                                                                                        handleComandSend(
                                                                                                          'IRC=' +
                                                                                                            settings[20]
                                                                                                        ).then(
                                                                                                          () => {
                                                                                                            setIsLoading(
                                                                                                              false
                                                                                                            )
                                                                                                          }
                                                                                                        )
                                                                                                      },
                                                                                                      time
                                                                                                    )
                                                                                                  }
                                                                                                )
                                                                                              },
                                                                                              time
                                                                                            )
                                                                                          }
                                                                                        )
                                                                                      },
                                                                                      time
                                                                                    )
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
                                                            }, time)
                                                          })
                                                        }, time)
                                                      }
                                                    )
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
                              }, time)
                            })
                          }, time)
                        })
                      }, time)
                    })
                  }, time)
                })
              }, time)
            }
          )
        }, time)
      })
    }
  }

  function handleFileInformations(fileContent: string): void {
    console.log('File content:', fileContent)
    try {
      const loadedDataSettings = fileContent.split('\r\n').map((item) => item.trim())
      if (loadedDataSettings.length < 2) {
        throw new Error('Conteúdo do arquivo insuficiente')
      }
      const DataTxPowerLevel = loadedDataSettings[1].replace(/;/g, ',')
      const TxPower = 'PWRLVL\r\n' + DataTxPowerLevel.replace('\r\n', '').trim() + '>' + '\r\n'

      console.log(TxPower)
      let groupData = ''
      for (let i = 2; i < 20; i++) {
        groupData += loadedDataSettings[i] + '\r\n'
      }
      groupData = 'rcfg\r\n' + groupData

      if (DataTxPowerLevel.length === 0) {
        throw new Error('DataTxPowerLevel está vazio')
      }

      setDataReceivedComandPowerTx(TxPower)
      setDataReceivedComandRCFG(groupData)
      console.log(groupData)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao ler o arquivo:', error.message)
      } else {
        console.error('Erro ao ler o arquivo:', error)
      }
    }
  }

  function handleTestTransmission(id: string, channel: string, message: string): void {
    const time = 200
    if (props.isConect && !mode.state) {
      setIsLoading(true)
      setMessageIsLoading('Enviado informações para o dispositivo!')

      handleComandSend('NESID=' + id).then(() => {
        setTimeout(() => {
          handleComandSend('TCH=' + channel).then(() => {
            setTimeout(() => {
              handleComandSend('TBR=' + '300').then(() => {
                setTimeout(() => {
                  handleComandSend('TIN=' + '00:01:00:00').then(() => {
                    setTimeout(() => {
                      handleComandSend('FTT=' + '00:10:00').then(() => {
                        setTimeout(() => {
                          handleComandSend('TWL=' + '10').then(() => {
                            setTimeout(() => {
                              handleComandSend('CMSG=' + 'N').then(() => {
                                setTimeout(() => {
                                  handleComandSend('TDF=' + 'A').then(() => {
                                    setTimeout(() => {
                                      handleComandSend('EBM=' + 'N').then(() => {
                                        setTimeout(() => {
                                          handleComandSend('ETX').then(() => {
                                            setTimeout(() => {
                                              handleComandSend('TDT=' + message)
                                              setIsLoading(false)
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

  useEffect(() => {
    if (props.isConect && !mode.state) {
      setIsLoading(true)
      setMessageIsLoading('Procurando dispositivo!')

      const timer = setTimeout(() => {
        const commandPromise = handleComandSend('\n\r')
          .then((response) => {
            //console.log('response', response)
            if (response.includes('>')) {
              executeListCommand()
              return 'containsGreaterThan' // Retorna um valor específico
            } else {
              setTimeout(() => setIsLoading(false), 1000)
              return 'noGreaterThan' // Retorna outro valor específico
            }
          })
          .catch((error) => {
            console.error('Erro ao enviar comando:', error)
            setIsLoading(false)
            return 'error' // Retorna um valor específico em caso de erro
          })

        const timeoutPromise = new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve()
          }, 5000)
        })

        Promise.race([commandPromise, timeoutPromise]).then((result) => {
          if (result === undefined || result === 'noGreaterThan' || result === 'error') {
            setTimeout(() => {
              setIsLoading(false)
              setTimeout(() => {
                setDeviceFound(false)
              }, 200)
            }, 1000)
          } else {
            setIsLoading(true)
          }
        })
      }, 1000)

      return (): void => clearTimeout(timer)
    }
  }, [props.isConect])

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'TSatDB'}>
        <Rss size={30} />
      </HeaderDevice>

      <div className=" flex flex-col justify-center  bg-white mr-8 ml-8 mt-4 rounded-lg text-zinc-500 text-sm w-full max-w-4xl  ">
        <header className="flex items-start justify-between mr-8 ml-8 mt-4 border-b-[1px] border-sky-500 ">
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
                colorGps ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('gps')}
            >
              GPS
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

            <button
              className={`border-b-2 border-transparent ${
                colorTeste ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('teste')}
            >
              Teste de Transmissão
            </button>

            <button
              className={`border-b-2 border-transparent ${
                colorApontamento ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('apontamento')}
            >
              Apontamento de Antena
            </button>
          </div>
        </header>

        {
          <div className="h-[510px] overflow-y-auto mr-8 ml-8  ">
            {MenuName === 'status' ? (
              <Status
                receiverVER={dataReceivedComandVER}
                receiverRST={dataReceivedComandRST}
                receiverTIME={dataReceivedComandTIME}
                receiverTEMP={dataReceivedComandTEMP}
              />
            ) : MenuName === 'gps' ? (
              <Gps
                receiverGPS={dataReceivedComandGPS}
                receiverPOS={dataReceivedComandPOS}
                receiverRST={dataReceivedComandRST}
                handleUpdateGPS={handleComandUdateGPS}
              />
            ) : MenuName === 'config' ? (
              <Settings
                receiverTxPowerLevel={dataReceivedComandPowerTX}
                receiverSettings={dataReceivedComandRCFG}
                handleUpdateSettings={handleSettingsComand}
                handleSendSettings={handleSendSetings}
                handlesRecoverSettingsFactory={handlesSettingsFactory}
                handleFileInformations={handleFileInformations}
              />
            ) : MenuName === 'terminal' ? (
              <Terminal
                receiverTerminal={dataReceivedComandTerminal}
                handleSendComandTerminal={handleSendComandTerminal}
              />
            ) : MenuName === 'teste' ? (
              <TransmissionTest handleTestTransmissions={handleTestTransmission} />
            ) : (
              MenuName === 'apontamento' && (
                <AntenaPointing
                  handlePositiom={handleComandUdateGPS}
                  receiverGPS={dataReceivedComandGPS}
                  receiverPOS={dataReceivedComandPOS}
                />
              )
            )}
          </div>
        }
      </div>
      {deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}
      <LoadingData visible={isLoading} title={messageIsLoading} />
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={'TSatDB'}>
        <Rss size={30} />
      </HeaderDevice>

      <ImageDevice image={ImgTsatDb} link="https://dualbase.com.br/produto/tsatdb/" />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg">
        <CardInformation title="VISÃO GERAL">
          <p>Transmissão de alta taxa de dados - Versão 2.0 (CS2)</p>
          <p>
            Sistema de Posicionamento Global (GPS) e ajuste automático do relógio.Até 28 dias de
            funcionamento sem sinal de GPS
          </p>
          <p>Compatível com vários registradores de dados (dataloggers)</p>

          <p>Homologação NESDIS: 1014-000114</p>
          <p>Homologação ANATEL: 03654-18-11455</p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>Gabinete metálico.</p>
          <p>LEDs no painel frontal indicadores do estado operacional</p>
          <p>Comunicação USB/RS232</p>
        </CardInformation>

        <CardInformation title="ESPECIFICAÇÃO">
          <p>Taxa de transmissão: METEOSAT: 100 bps GOES: 300 e 1200 bps</p>
          <p>
            Faixa de frequência de transmissão: METEOSAT: 402,0355 a 402,4345 MHz GOES: 401,701 a
            402,0985 MHz
          </p>
          <p>Potência nominal de transmissão: METEOSAT: 14 W (máximo) GOES: 6,5 W (máximo)</p>
          <p>Antena de transmissão: 14 W (máximo) RHC (Right Hanc Circular) - Conector N</p>
          <p>Antena de GPS: Ativa de 3,3 V - Conector SMA</p>
          <p>Alimentação: 10,8 a 16,0 Vdc</p>
          <p>
            Consumo: Stand-by: aprox. 3 mA /Transmissão: aprox. 2,6 A / GPS ligado: aprox. 50 mA
          </p>
          <p>Faixa de operação: -40º a + 60ºC</p>
          <p>Protocolo de comunicação: ASCII, Binário</p>
          <p>Comunicação:USB: Micro B RS-232: DB9 Fêmea</p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
