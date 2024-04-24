import {  Drop } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import ImgBorbulha from '../../assets/LinnimDdBorbulha.svg'
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


export default function LinnimDbCap(props : LinnimDbCapProps) {
  const [menuName, setMenuName] = useState('info')
  const [colorInfo, setColorInfo] = useState(true)
  const [colorConfig, setColorConfig] = useState(false)
  const [colorUpdate, setColorUpdate] = useState(false)

  function handleMenu(menu){
    if(menu==="info"){
      setColorInfo(true)
      setColorConfig(false)
      setColorUpdate(false)
    }
    else if(menu === "config"){
      setColorInfo(false)
      setColorConfig(true)
      setColorUpdate(false)
    }
    else{
      setColorInfo(false)
      setColorConfig(false)
      setColorUpdate(true)
    }


    setMenuName(menu)


  }


  return props.isConect?(
    <ContainerDevice heightScreen= {true}>
     <HeaderDevice DeviceName={"LinnimDB-Cap"}>
      <Drop size={30} />
     </HeaderDevice>

      <div className=" flex flex-col justify-center bg-white mr-8 ml-8 mt-28 rounded-lg text-zinc-500 text-sm w-full max-w-4xl ">
        <header className="flex items-start justify-between mr-8 ml-8 mt-4 border-b-[1px] border-sky-500 ">
          <div className="flex gap-4">
            <button
            className={`border-b-2 border-transparent ${colorInfo? 'text-sky-500': ''} hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
            onClick={()=>handleMenu("info")}
            >
              Informações
              </button>
            <button
            className= {`border-b-2 border-transparent ${colorConfig? 'text-sky-500': ''} hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
            onClick={()=>handleMenu("config")}
            >
              Configurações
            </button>
            <button
            className= {`border-b-2 border-transparent ${colorUpdate? 'text-sky-500': ''} hover:border-b-2 hover:border-sky-500 inline-block relative duration-300`}
            onClick={()=>handleMenu("update")}
            >
            Atualização
            </button>
          </div>
        </header>

        { menuName==="info"?<Information/>
        : menuName==="config"? <div className=''><Settings/><Measure/></div>
        : <UpdateModubus/>
        }

        {
          /*menuName ==="config"?
          <Measure/>
          :
          <div></div>*/
        }
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={"LinnimDB-Cap"}>
        <Drop size={30} />
     </HeaderDevice>

      <ImageDevice image={ImgBorbulha} />

      <div className="bg-[#EDF4FB] pt-3 flex items-center flex-col justify-center rounded-b-lg ">
        <CardInformation title="VISÃO GERAL">
          <p>
            Conversor USB/SDI12 é um equipamento capaz de comunicar com dispositivos SDI-12 afim de
            verificar o funcionamento e acessar configurações.
          </p>
        </CardInformation>

        <CardInformation title="CARACTERÍSTICAS">
          <p>
            Capacidade de enviar quaisquer comandos digitados (modo transparente), além de possuir
            alguns atalhos para comandos pré-definidos.
          </p>
          <p>Aceita múltiplos sensores ligados simultaneamente.</p>
          <p>
            Identifica o endereço do sensor automaticamente (para este caso permite penas 1 sensor
            no barramento).
          </p>
          <p>Pode salvar LOG de comunicação.</p>
        </CardInformation>

        <CardInformation title="ESPECIFICAÇÃO">
          <p>Compatível com plataforma Windows (XP ou superior, incluindo Windows 11).</p>
          <p>Compatível com todas as versões do SDI-12 (incluindo v1.4).</p>
          <p> Compatível com USB2.0.</p>
          <p>Alimentação pela porta USB (5V).</p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
