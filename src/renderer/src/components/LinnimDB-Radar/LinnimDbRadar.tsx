import { ArrowsClockwise, GearSix, Info, Waves } from '@phosphor-icons/react'
import { CardInformation } from '../cardInfomation/CardInformation'
import { Trans } from 'react-i18next'
import ImgLimniDbRadar from '../../assets/LimniDB-RADAR-banner.png'
import { ImageDevice } from '../imageDevice/ImageDevice'
import Information from './components/information'
import { useEffect, useState } from 'react'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import Measure from './components/measure'
import UpdateModubus from '../updateModbus/updateModbus'
import { t } from 'i18next'

function RichText({ i18nKey }: { i18nKey: string }) {
  return <Trans i18nKey={i18nKey} components={{ b: <strong />, i: <em /> }} />
}

interface LinnimDbRadarProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

export default function LinnimDbRadar(props: LinnimDbRadarProps): JSX.Element {
  const [menuName, setMenuName] = useState('info')
  const [colorInfo, setColorInfo] = useState(true)
  const [colorConfig, setColorConfig] = useState(false)
  const [colorUpdate, setColorUpdate] = useState(false)
  const [updateFirmwareSelected, setUpdateFirmwareSelected] = useState(false)
  const isFirmwareOnly = props.isConect && updateFirmwareSelected

  useEffect(() => {
    if (!props.isConect) return
    handleMenu(updateFirmwareSelected ? 'update' : 'info')
  }, [props.isConect])

  function handleMenu(menu): void {
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
      <HeaderDevice DeviceName={t('LimniDB-RADAR')}>
        <Waves size={30} />
      </HeaderDevice>

      <div className="mb-3 mt-2 flex w-full min-w-0 max-w-4xl flex-col justify-center rounded-lg bg-white pb-6 text-sm text-zinc-500 shadow-sm mr-4 ml-4 sm:mr-8 sm:ml-8">
        <header className="mx-4 mt-3 border-b border-sky-500 sm:mx-6">
          <div className="flex flex-wrap justify-start gap-1 sm:gap-2">
            {!isFirmwareOnly && (
              <>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    colorInfo
                      ? 'border-b-2 border-sky-500 text-sky-600'
                      : 'border-b-2 border-transparent text-zinc-500 hover:text-sky-500'
                  }`}
                  onClick={() => handleMenu('info')}
                >
                  <Info size={16} />
                  {t('Informações')}
                </button>
                <button
                  className={`inline-flex items-center gap-1.5 rounded-t-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                    colorConfig
                      ? 'border-b-2 border-sky-500 text-sky-600'
                      : 'border-b-2 border-transparent text-zinc-500 hover:text-sky-500'
                  }`}
                  onClick={() => handleMenu('config')}
                >
                  <GearSix size={16} />
                  {t('Configurações')}
                </button>
              </>
            )}
            {isFirmwareOnly && (
              <button
                className="inline-flex items-center gap-1.5 rounded-t-md border-b-2 border-sky-500 px-3 py-2 text-sm font-medium text-sky-600"
                onClick={() => handleMenu('update')}
              >
                <ArrowsClockwise size={16} />
                {t('Atualização')}
              </button>
            )}
          </div>
        </header>

        {isFirmwareOnly ? (
          <div className="pb-2">
            <UpdateModubus />
          </div>
        ) : menuName === 'config' ? (
          <div className="min-w-0 w-full overflow-x-hidden px-1 pb-8">
            <Settings />
            <Measure />
          </div>
        ) : (
          <Information />
        )}
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice
        DeviceName={'LimniDB-RADAR'}
        rightSlot={
          <label
            className={`flex cursor-pointer items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors ${
              updateFirmwareSelected ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-white/60 text-[#1769A0] focus:ring-white/40 focus:ring-offset-0"
              checked={updateFirmwareSelected}
              onChange={() => setUpdateFirmwareSelected((prev) => !prev)}
            />
            <span className="text-xs font-semibold text-white/90">{t('Atualizar Firmware')}</span>
          </label>
        }
      >
        <Waves size={30} />
      </HeaderDevice>

      <ImageDevice
        image={ImgLimniDbRadar}
        link="https://dualbase.com.br/produto/limnidb-radar/"
      />

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>LimniDB-RADAR</b> é um sensor de nível <b>sem contato</b> com a água. Mede a distância até a lâmina d’água por ondas eletromagnéticas e é normalmente instalado em pontes ou estruturas seguras. É seguro, de fácil uso e baixa manutenção, com compensação de temperatura e baixa incerteza de medição." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            • <RichText i18nKey="<b>Sensor radar 80 GHz</b> para medição de nível de água;" />
          </p>
          <p>
            • <RichText i18nKey="<b>Corpo em alumínio anodizado</b> com proteção IP68;" />
          </p>
          <p>
            • <RichText i18nKey="<b>Saídas digitais SDI-12 e Modbus</b>, com compensação de temperatura." />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            {t(
              'Hidrologia, meteorologia, monitoramento de rios e reservatórios, instalação em pontes e estruturas seguras.'
            )}
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
