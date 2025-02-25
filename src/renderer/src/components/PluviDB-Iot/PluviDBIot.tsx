import { Drop } from '@phosphor-icons/react'
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
export default function PluviDBIot(props: PluviDBIotProps) {
  const [MenuName, setMenuName] = useState('status')
  const [colorConfig, setColorConfig] = useState(false)
  const [colorStatus, setColorStatus] = useState(true)
  const [colorTerminal, setColorTerminal] = useState(false)
  const [colorInstantData, setColorInstantData] = useState(false)

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
    serialManagerTsatDB.sendCommandTSatDB(comand)

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => {
        reject(new Error('Tempo limite excedido (20s) para resposta do comando'))
      }, 20000)
    )

    try {
      const response = await Promise.race([serialManagerTsatDB.receiveDataTSatDB(), timeoutPromise])

      //console.log(`Resposta do comando ${comand}:`, response)
      return response
    } catch (error) {
      //console.error(`Erro ao receber resposta do comando ${comand}:`, error)
      setIsLoading(false)
      setDeviceFound(false)
      throw error
    }
  }

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'PluviDB-Iot'}>
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
              <Status />
            ) : MenuName === 'config' ? (
              <Settings />
            ) : MenuName === 'terminal' ? (
              <Terminal />
            ) : (
              MenuName === 'instantaneous' && <InstantData />
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
      <HeaderDevice DeviceName={'PluviDB-Iot'}>
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice image={ImgTsatDb} link="https://dualbase.com.br/produto/pluvidb-iot/" />

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
