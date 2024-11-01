import { Drop } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgBorbulha from '../../assets/LinnimDdCAP.svg'
import { ImageDevice } from '../imageDevice/ImageDevice'

import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import VariableMain from './components/variableMain'
import VariableControl from './components/variableControl'
import ButtonSet from './components/buttonSet'
import SerialManagerRS232 from '@renderer/utils/serial'
import { useEffect, useState } from 'react'

interface TecladoSDI12Props {
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
export function ClosePortRS232() {
  serialManagerRS232.sendCommandRS232('!QUIT%').then(() => serialManagerRS232.closePortRS232)
  //serialManagerRS232.closePortRS232()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function TecladoSDI12(props: TecladoSDI12Props) {
  const [, setMenuName] = useState('config')
  const [colorConfig, setColorConfig] = useState(true)
  const [ResponseDonwInformation, setResponseDownInformation] = useState<string>('')
  const [ClearInformations, setClearInformations] = useState(false)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleComandConect() {
    serialManagerRS232
      .sendCommandRS232('!A%')
      .then((response) => console.log('Resposta:', response.toString()))
  }

  function handleDownInformation(comand: string) {
    setResponseDownInformation(''),
      serialManagerRS232
        .sendCommandRS232(comand)
        .then((response) => setResponseDownInformation(response))
    console.log(ResponseDonwInformation)
  }

  function handleSendInformation() {
    serialManagerRS232.sendCommandRS232(ResponseDonwInformation)
  }

  function handleClearInformation(comand: boolean) {
    if (comand) {
      setClearInformations(true)
    } else {
      setClearInformations(false)
    }
  }

  function handleFileInformation(comand: string) {
    setResponseDownInformation(comand)
  }

  function handleSaveInformation() {
    console.log('File: ', ResponseDonwInformation)
    const blob = new Blob([ResponseDonwInformation], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'TecladoSDI12.txt')
  }

  function handleChangeInformations(comand: string) {
    console.log('valueInputs:', comand)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleMenu(menu) {
    if (menu === 'config') {
      setColorConfig(true)
    }

    setMenuName(menu)
  }

  useEffect(() => {
    if (props.isConect) {
      const timer = setTimeout(() => {
        // Chame a função desejada aqui
        handleComandConect()
      }, 2000) // 2000 milissegundos = 2 segundos

      // Limpeza do timer quando o componente for desmontado
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      return () => clearTimeout(timer)
    }
  }, [props.isConect])

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'Teclado-SDI12'}>
        <Drop size={30} />
      </HeaderDevice>

      <div className=" flex flex-col justify-center bg-white mr-8 ml-8 mt-4 rounded-lg text-zinc-500 text-sm w-full max-w-4xl  ">
        <header className="flex items-start justify-between mr-8 ml-8 mt-4 border-b-[1px] border-sky-500 ">
          <div className="flex gap-4">
            <button
              className={`border-b-2 border-transparent ${
                colorConfig ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('config')}
            >
              Configurações
            </button>
          </div>
        </header>

        {
          <div className="h-[70vh] overflow-y-auto mt-2">
            <Settings
              informations={ResponseDonwInformation}
              clear={ClearInformations}
              onClearReset={handleClearInformation}
              changeInformations={handleChangeInformations}
            />
            <VariableMain
              informations={ResponseDonwInformation}
              clear={ClearInformations}
              onClearReset={handleClearInformation}
            />
            <VariableControl
              informations={ResponseDonwInformation}
              clear={ClearInformations}
              onClearReset={handleClearInformation}
            />
            <ButtonSet
              handleDownInformation={handleDownInformation}
              handleClearInformation={handleClearInformation}
              handleFileInformations={handleFileInformation}
              handleSaveInformation={handleSaveInformation}
              handleSendInformation={handleSendInformation}
            />
          </div>
        }
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={'Teclado-SDI12'}>
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice image={ImgBorbulha} link="https://dualbase.com.br/produto" />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg">
        <CardInformation title="VISÃO GERAL">
          <p>
            O LimniDB-CAP faz a medição de pressão através do elemento capacitivo cerâmico o que o
            deixa muito robusto sem perder as qualidades metrológicas.
          </p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>Corpo em aço inox 316L.</p>
          <p>Elemento do sensor capacitivo cerâmico com compensação de temperatura.</p>
          <p>Cabo em poliuretano com filtro contra radiação UV com Kevlar (opcional).</p>
          <p>Tipo de medição disponível: absoluto ou diferencial.</p>
        </CardInformation>

        <CardInformation title="ESPECIFICAÇÃO">
          <p>Faixa de medição: 0 a 20 mca (metro de coluna d'água).</p>
          <p>Resolução: 0,001 mca (1 mm)</p>
          <p>Faixa de temperatura compensada: -20º a +80ºC</p>
          <p>Faixa de temperatura de operação: -40º a +80ºC</p>
          <p>Incerteza máxima associada: ± 0,1% F.E. @ -10º a +60ºC</p>
          <p>Grau de proteção: IP68</p>
          <p>Alimentação: 8 a 28 Vcc</p>
          <p>Consumo: 5 mA máx</p>
          <p>Sinal de saída digital: RS-485</p>
          <p>Sinal de saída (opcional): SDI-12</p>
          <p>Unidades de indicação: cca (centímetro de coluna d'água), mca, pé (ft), mBar e PSI</p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
