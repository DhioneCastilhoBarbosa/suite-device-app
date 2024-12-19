import { Drop, Rss } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgTeclado from '../../assets/TecladoSDI12.svg'
import { ImageDevice } from '../imageDevice/ImageDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import VariableMain from './components/variableMain'
import VariableControl from './components/variableControl'
import ButtonSet from './components/buttonSet'
import SerialManagerRS232 from '@renderer/utils/serial'
import { useEffect, useState } from 'react'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { Device } from '@renderer/Context/DeviceContext'
import { saveAs } from 'file-saver'
import Status from './components/status'
import Gps from './components/gps'

interface TSatDBProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

const serialManagerRS232 = new SerialManagerRS232()

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OpenPortRS232({ portName, bauld }: SerialProps) {
  serialManagerRS232.openPortRS232(portName, bauld)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function ClosePortRS232() {
  try {
    console.log('Enviando comando QUIT...')

    // Envia o comando 'QUIT'
    await serialManagerRS232.sendCommandRS232('!QUIT%')

    // Aguarda 5 segundos
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))

    // Fecha a porta
    serialManagerRS232.closePortRS232()
    console.log('Porta fechada com sucesso')
  } catch (error) {
    console.error('Erro ao tentar fechar a porta:', error)
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

  function closeNoDeviceFoundModal(): void {}
  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'TSatDB'}>
        <Rss size={30} />
      </HeaderDevice>

      <div className=" flex flex-col justify-center bg-white mr-8 ml-8 mt-4 rounded-lg text-zinc-500 text-sm w-full max-w-4xl  ">
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
          <div className="h-[70vh] overflow-y-auto mr-8 ml-8 ">
            {MenuName === 'status' ? (
              <Status />
            ) : MenuName === 'gps' ? (
              <Gps />
            ) : MenuName === 'config' ? (
              <Settings />
            ) : MenuName === 'terminal' ? (
              <div>Terminal</div>
            ) : MenuName === 'teste' ? (
              <div>teste</div>
            ) : (
              MenuName === 'apontamento' && <div>apontamento</div>
            )}
          </div>
        }
      </div>
      {deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={'TSatDB'}>
        <Rss size={30} />
      </HeaderDevice>

      <ImageDevice image={ImgTeclado} link="https://dualbase.com.br/produto/tsatdb/" />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg">
        <CardInformation title="VISÃO GERAL">
          <p>
            O TSatDB oferece ótimo desempenho na transmissão de dados via satélites GOES (V2.0 CS2)
            e METEOSAT. Ideal para uso em PCDs. Possui baixo consumo de energia em stand-by e é de
            fácil integração com dataloggers.
          </p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>Caixa de proteção IP65.</p>
          <p>Display 12 Digitos 2 linhas.</p>
          <p>Entrada de dados via teclado de membrana.</p>
        </CardInformation>

        <CardInformation title="ESPECIFICAÇÃO">
          <p>
            Possuir membrana de 16 teclas produzido com base nas recomendações NBR 13173 de agosto
            de 2012.
          </p>
          <p>Faixa de temperatura de operação: -40º a +80ºC</p>
          <p>Grau de proteção: IP65</p>
          <p>Alimentação: 10 a 16 Vcc</p>
          <p>Sinal de saída digital: SDI-12</p>
          <p>Comunicação de configuração: RS232/USB</p>
          <p>Display LCD alfanumérico com 02 linhas de 12 dígitos cada linha e 16 segmentos.</p>
          <p>
            Configurável a partir de aplicativo externo compatível com sistema operacional Windows
            10.
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
