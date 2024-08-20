import { Drop } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgBorbulha from '../../assets/borbulha.svg'
import { ImageDevice } from '../imageDevice/ImageDevice'
import Information from './components/information'
import { useState } from 'react'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import Measure from './components/measure'
import UpdateModubus from '../updateModbus/updateModbus'

interface LinnimDbCapProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

export default function LinnimDbBorbulha(props: LinnimDbCapProps) {
  const [menuName, setMenuName] = useState('info')
  const [colorInfo, setColorInfo] = useState(true)
  const [colorConfig, setColorConfig] = useState(false)
  const [colorUpdate, setColorUpdate] = useState(false)

  function handleMenu(menu) {
    if (menu === 'info') {
      setColorInfo(true)
      setColorConfig(false)
      setColorUpdate(false)
    } else if (menu === 'config') {
      setColorInfo(false)
      setColorConfig(true)
      setColorUpdate(false)
    } else {
      setColorInfo(false)
      setColorConfig(false)
      setColorUpdate(true)
    }

    setMenuName(menu)
  }

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'LinnimDB-Borbulha'}>
        <Drop size={30} />
      </HeaderDevice>

      <div className=" flex flex-col justify-center bg-white mr-8 ml-8 mt-28 rounded-lg text-zinc-500 text-sm w-full max-w-4xl">
        <header className="flex items-start justify-between mr-8 ml-8 mt-4 border-b-[1px] border-sky-500 ">
          <div className="flex gap-4">
            <button
              className={`border-b-2 border-transparent ${
                colorInfo ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('info')}
            >
              Informações
            </button>
            <button
              className={`border-b-2 border-transparent ${
                colorConfig ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('config')}
            >
              Configurações
            </button>
            <button
              className={`border-b-2 border-transparent ${
                colorUpdate ? 'text-sky-500' : ''
              } hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
              onClick={() => handleMenu('update')}
            >
              Atualização
            </button>
          </div>
        </header>

        {menuName === 'info' ? (
          <Information />
        ) : menuName === 'config' ? (
          <div className="">
            <Settings />
            <Measure />
          </div>
        ) : (
          <UpdateModubus />
        )}
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={'LinnimDB-Borbulha'}>
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice image={ImgBorbulha} link="https://dualbase.com.br/produto/limnidb-borbulha/" />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg ">
        <CardInformation title="VISÃO GERAL">
          <p>
            Evite prejuízos em redes de monitoramento hidrológico. Conheça o sensor de nível por
            borbulhamento , LimniDB-Borbulha, que não fica em contato com a água, reduzindo os
            custos de operação e manutenção.
          </p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>Corpo em ABS.</p>
        </CardInformation>

        <CardInformation title="ESPECIFICAÇÃO">
          <p>Faixa de medição: 0 a 20 mca (metro de coluna d'água).</p>
          <p>Resolução: 0,001 mca (1 mm)</p>
          <p>Alimentação: 12 Vcc</p>
          <p>Consumo: 5A máx</p>
          <p>Sinal de saída digital: RS-485</p>
          <p>Sinal de saída: SDI-12</p>
          <p>Unidades de indicação: cca (centímetro de coluna d'água), mca, pé (ft), mBar e PSI</p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
