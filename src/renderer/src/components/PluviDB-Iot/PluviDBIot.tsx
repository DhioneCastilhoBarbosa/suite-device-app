import { Drop } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgPluviDBIot from '../../assets/PluviDB-Iot.svg'
import { ImageDevice } from '../imageDevice/ImageDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import SerialManagerRS232 from '@renderer/utils/serial'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { Device } from '@renderer/Context/DeviceContext'
import Status from './components/status'

import { Terminal } from './components/terminal'
import LoadingData from '../loading/loadingData'
import { useState } from 'react'
import { InstantData } from './components/intantData'

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
  const [colorInstantData, setColorInstantData] = useState(false)
  const [dataReceivedComandTerminal, setDataReceivedComandTerminal] = useState<string>('')
  const [dataReceivedComandInst, setDataReceivedComandInst] = useState<string>('')
  const [dataReceivedComandStatus, setDataReceivedComandStatus] = useState<string>('')
  const [messageIsLoading, setMessageIsLoading] = useState<string>(
    'Baixando informações do dispositivo!'
  )

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [deviceFound, setDeviceFound] = useState<boolean | null>(null) // null indica que a varredura ainda não foi iniciada
  const { mode }: any = Device()

  function handleMenu(menu): void {
    switch (menu) {
      case 'config':
        setColorConfig(true)
        setColorStatus(false)
        setColorTerminal(false)
        setColorInstantData(false)
        break
      case 'status':
        setColorConfig(false)
        setColorStatus(true)
        setColorTerminal(false)
        setColorInstantData(false)
        break
      case 'terminal':
        setColorConfig(false)
        setColorStatus(false)
        setColorTerminal(true)
        setColorInstantData(false)
        break

      case 'instantaneous':
        setColorConfig(false)
        setColorStatus(false)
        setColorTerminal(false)
        setColorInstantData(true)
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

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => {
        reject(new Error('Tempo limite excedido (20s) para resposta do comando'))
      }, 20000)
    )

    try {
      const response = await Promise.race([
        serialManagerPluviIoT.receiveDataPluvi(),
        timeoutPromise
      ])

      console.log(`Resposta do comando ${comand}:`, response)
      return response
    } catch (error) {
      console.error(`Erro ao receber resposta do comando ${comand}:`, error)
      setIsLoading(false)
      setDeviceFound(false)
      throw error
    }
  }

  function handleSendComandTerminal(comand: string): void {
    if (props.isConect && !mode.state) {
      handleComandSend(comand).then((response) => {
        setDataReceivedComandTerminal(response)
      })
    }
  }

  function handleUpdateInst(): void {
    if (props.isConect && !mode.state) {
      handleComandSend('ps=inst?').then((response) => {
        setDataReceivedComandInst(response)
      })
    }
  }

  function handleUpdateStatus(): void {
    if (props.isConect && !mode.state) {
      handleComandSend('ps=status?').then((response) => {
        setDataReceivedComandStatus(response)
      })
    }
  }

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
          </div>
        </header>

        {
          <div className=" h-auto overflow-y-auto mr-8 ml-8">
            {MenuName === 'status' ? (
              <Status
                handleUpdateStatus={handleUpdateStatus}
                receivedDataStatus={dataReceivedComandStatus}
              />
            ) : MenuName === 'config' ? (
              <Settings />
            ) : MenuName === 'terminal' ? (
              <Terminal
                receiverTerminal={dataReceivedComandTerminal}
                handleSendComandTerminal={handleSendComandTerminal}
              />
            ) : (
              MenuName === 'instantaneous' && (
                <InstantData
                  handleUpdateInst={handleUpdateInst}
                  receivedDataInst={dataReceivedComandInst}
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
      <HeaderDevice DeviceName={'PluviDB-IoT'}>
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice image={ImgPluviDBIot} link="https://dualbase.com.br/produto/pluvidb-iot/" />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg">
        <CardInformation title="VISÃO GERAL">
          <p>O PluviDB-IoT conta com um core de processamento ARM Cortex</p>
          <p>
            Possui simultaneamente conexão via 4G – LTE-M Cat-M1e NB-IoT versão 2 (NB2) compatível
            com 3GPP LTE release 14. Possui também recepção de GPS e tudo isso com extremo baixo
            consumo de energia.
          </p>
          <p>
            Empregando as melhores técnicas de redução de consumo energético, o PluviDB-IoT funciona
            com bateria não recarregável de Lítio primária que é superior a 5 anos.
          </p>

          <p>Acompanha Certicado de Calibração rastreado a RBC conforme IEC 17025.</p>
          <p>Homologação ANATEL: 08591-24-11455</p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>Princípio de báscula instável</p>
          <p>Construído integralmente com materiais inoxidáveis</p>
          <p>Com dispositivo regulador de vazão</p>
          <p>Corpo em alumínio, aço inox e pintura epóxi</p>
          <p>Sistema de nivelamento com nível de bolha</p>
          <p>
            Bordas internas em formato de ângulo reto e borda externa com formato de ângulo oblíquo,
            que minimizam efeitos de turbulência do vento.
          </p>
          <p>ARM Cortex M33</p>
          <p>Memória Flash de 64Mb para armazenamento de dados</p>
          <p>2 portas de medição de pulso</p>
          <p>1 porta SDI-12 v1.3</p>
          <p>Conector USB-C </p>
          <p>Congurável com conexão sem o / Bluetooth</p>
          <p>Frequências LTE de 700 a 2200 Mhz </p>
          <p>
            Cat-M1: B1, B2, B3, B4, B5, B8, B12, B13, B14, B17, B18, B19, B20, B25, B26, B28, B66
          </p>
          <p>NB1/NB2: B1, B2, B3, B4, B5, B8, B12, B13, B17, B19, B20, B25, B26, B28, B66 </p>
          <p>Funções eDRX e PSM power saving.</p>
          <p>Protocolos: MQTT, HTTP, NTP, FTP entre outros</p>
          <p>Bateria interna de lítio primária Li-SOCl2 – D - 3,6V – 19Ah</p>
          <p>Com opção de expansão de bateria</p>
          <p>Atende requisitos WMO</p>
          <p>Aplicativo Android</p>
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
