import { Drop, GearSix } from '@phosphor-icons/react'
import { CardInformation, RichText } from '../cardInfomation/CardInformation'
import ImgTeclado from '../../assets/TecladoSDI12-banner.png'
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
import { Device } from '../../Context/DeviceContext'
import { saveAs } from 'file-saver'
import { t } from 'i18next'

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
export function OpenPortRS232({ portName, bauld }: SerialProps): Promise<void> {
  return serialManagerRS232.openPortRS232(portName, bauld)
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

const arrayInit = [
  '!0', // 2 caracteres
  '030', // 3 caracteres
  '0060', // 4 caracteres
  '00', // 2 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '           ', // 10 caracteres
  '0%' // 2 caracteres
]

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function TecladoSDI12(props: TecladoSDI12Props) {
  const [, setMenuName] = useState('config')
  const [colorConfig, setColorConfig] = useState(true)
  const [ResponseDonwInformation, setResponseDownInformation] = useState<string>(arrayInit.join())
  const [ClearInformations, setClearInformations] = useState(false)
  const [changeInformations, setChangeInformations] = useState<string>('')
  const [changeVariablesMain, setChangeVariablesMain] = useState<string>('')
  const [changeVariablesControl, setChangeVariablesControl] = useState<string>('')
  const [SendNewConfiguration, setSendNewConfiguration] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [deviceFound, setDeviceFound] = useState<boolean | null>(null) // null indica que a varredura ainda não foi iniciada
  const { mode, PortOpen }: any = Device()

  const closeNoDeviceFoundModal = () => {
    setDeviceFound(null)
    serialManagerRS232.closePortRS232()
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleComandConect() {
    // Defina o tempo limite em milissegundos
    const TIMEOUT = 5000 // 5 segundos, por exemplo

    // Função para definir o timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), TIMEOUT)
    })

    // Combine o timeout com a resposta do serialManagerRS232
    Promise.race([serialManagerRS232.sendCommandRS232('!A%'), timeoutPromise])
      .then((response) => {
        if (response.toString() === 'B') {
          setIsLoading(false)
        } else {
          setIsLoading(true)
        }
      })
      .catch((error) => {
        if (error.message === 'Timeout') {
          setIsLoading(false)
          setDeviceFound(false)
        } else {
          console.error(error)
          setIsLoading(true)
        }
      })
  }

  function handleDownInformation(comand: string): void {
    setResponseDownInformation(''),
      serialManagerRS232
        .sendCommandRS232(comand)
        .then((response) => setResponseDownInformation(response))
    console.log(ResponseDonwInformation)
  }

  function handleSendInformation(): void {
    serialManagerRS232.sendCommandRS232(SendNewConfiguration)
  }

  function handleClearInformation(comand: boolean): void {
    if (comand) {
      setClearInformations(true)
    } else {
      setClearInformations(false)
    }
  }

  function handleFileInformation(comand: string): void {
    setResponseDownInformation(comand)
  }

  function handleSaveInformation(): void {
    const blob = new Blob([SendNewConfiguration], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'TecladoSDI12.txt')
  }

  function handleChangeInformations(comand: string): void {
    setChangeInformations(comand)
  }

  function handleChangeVariablesMain(comand: string): void {
    setChangeVariablesMain(comand)
  }

  function handleChangeVariablesControler(comand: string): void {
    setChangeVariablesControl(comand)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleMenu(menu) {
    if (menu === 'config') {
      setColorConfig(true)
    }

    setMenuName(menu)
  }

  function addSpacesToEmptyValues(input: string): string {
    // Substitui cada vírgula vazia (,,) por uma vírgula com espaço (, )
    return input.replace(/,(?=,)/g, ',            ')
  }

  useEffect(() => {
    const newvalue = changeInformations + changeVariablesMain + changeVariablesControl

    setSendNewConfiguration(addSpacesToEmptyValues(newvalue))
  }, [changeInformations, changeVariablesMain, changeVariablesControl])

  useEffect(() => {
    if (props.isConect && !mode.state) {
      setIsLoading(true)
      const timer = setTimeout(() => {
        handleComandConect()
      }, 1000) // 1000 milissegundos = 1 segundos

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      return () => clearTimeout(timer)
    }
    return undefined
  }, [props.isConect])

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={t('Teclado SDI-12')}>
        <Drop size={30} />
      </HeaderDevice>

      <div className="mx-4 mb-4 mt-4 flex w-full min-w-0 max-w-4xl flex-col justify-start overflow-visible rounded-lg bg-white pb-4 text-sm text-zinc-500 shadow-sm sm:mx-8">
        <header className="mx-4 mt-3 shrink-0 overflow-visible border-b border-sky-500 sm:mx-6">
          <div className="flex min-h-11 flex-wrap items-end justify-start gap-1 overflow-visible sm:gap-2">
            <button
              className={`inline-flex shrink-0 items-center gap-1.5 overflow-visible rounded-t-md px-3 py-2 text-sm font-medium leading-normal transition-colors duration-150 ${
                colorConfig
                  ? 'border-b-2 border-sky-500 text-sky-600'
                  : 'border-b-2 border-transparent text-zinc-500 hover:text-sky-500'
              }`}
              onClick={() => handleMenu('config')}
            >
              <GearSix size={16} />
              {t('Configurações')}
            </button>
          </div>
        </header>

        {
          <div className="mt-2 min-w-0 overflow-y-auto">
            <Settings
              informations={ResponseDonwInformation}
              clear={ClearInformations}
              onClearReset={handleClearInformation}
              changeInformations={handleChangeInformations}
              isloading={isLoading}
            />
            <VariableMain
              informations={ResponseDonwInformation}
              clear={ClearInformations}
              onClearReset={handleClearInformation}
              changeVariableMain={handleChangeVariablesMain}
            />
            <VariableControl
              informations={ResponseDonwInformation}
              clear={ClearInformations}
              onClearReset={handleClearInformation}
              changeVariableMain={handleChangeVariablesControler}
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
      {deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={t('Teclado SDI-12')}>
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice
        image={ImgTeclado}
        link="https://dualbase.com.br/produtos/"
        fit="contain"
      />

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>Teclado SDI-12</b> é um dispositivo de entrada de informações para dataloggers. Permite a inserção manual de valores diretamente na PCD. Conecta-se por meio de um cabo SDI-12 ao datalogger existente na estação." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            • <RichText i18nKey="<b>Permite o registro de variáveis diárias no campo;</b>" />
          </p>
          <p>
            •{' '}
            <RichText i18nKey="<b>Permite a comparação e validação entre os dados medidos e os registros do observador;</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Configurável para até 10 parâmetros.</b>" />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            {t(
              'Meteorologia operacional, pesquisa climática, universidades, órgãos públicos, monitoramento ambiental e projetos institucionais.'
            )}
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
