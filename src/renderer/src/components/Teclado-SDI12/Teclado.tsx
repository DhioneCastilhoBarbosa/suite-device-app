import { Drop } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgBorbulha from '../../assets/LinnimDdCAP.svg'
import { ImageDevice } from '../imageDevice/ImageDevice'

import { useState } from 'react'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import Measure from './components/measure'
import VariableMain from './components/variableMain'
import VariableControl from './components/variableControl'

interface TecladoSDI12Props {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function TecladoSDI12(props: TecladoSDI12Props) {
  const [, setMenuName] = useState('config')

  const [colorConfig, setColorConfig] = useState(true)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleMenu(menu) {
    if (menu === 'config') {
      setColorConfig(true)
    }

    setMenuName(menu)
  }

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
            <Settings />
            <VariableMain />
            <VariableControl />
            <Measure />
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
