import { ArrowsClockwise, Drop, GearSix, Info } from '@phosphor-icons/react'
import { CardInformation, RichText } from '../cardInfomation/CardInformation'
import ImgBorbulha from '../../assets/LimniDB-BORBULHA-banner.png'
import { ImageDevice } from '../imageDevice/ImageDevice'
import Information from './components/information'
import { useEffect, useState } from 'react'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import Measure from './components/measure'
import UpdateModubus from '../updateModbus/updateModbus'
import { t } from 'i18next'

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
  const [updateFirmwareSelected, setUpdateFirmwareSelected] = useState(false)
  const isFirmwareOnly = props.isConect && updateFirmwareSelected

  useEffect(() => {
    if (!props.isConect) return
    handleMenu(updateFirmwareSelected ? 'update' : 'info')
  }, [props.isConect])

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

  //console.log('LinnimDB-Borbulha', props.isConect)

  return props.isConect ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={t('LimniDB-BORBULHA')}>
        <Drop size={30} />
      </HeaderDevice>

      <div className="mx-2 mb-2 mt-2 flex min-h-0 w-full min-w-0 max-w-4xl flex-1 flex-col overflow-hidden rounded-lg bg-white pb-2 text-sm text-zinc-500 shadow-sm sm:mx-4">
        <header className="mx-4 mt-2 shrink-0 border-b border-sky-500 sm:mx-6">
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
          <div className="app-scroll min-h-0 flex-1 overflow-y-auto pb-2">
            <UpdateModubus />
          </div>
        ) : menuName === 'config' ? (
          <div className="app-scroll min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto px-1 pb-2">
            <Settings />
            <Measure />
          </div>
        ) : (
          <div className="app-scroll min-h-0 flex-1 overflow-y-auto">
            <Information />
          </div>
        )}
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice
        DeviceName={'LimniDB-BORBULHA'}
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
        <Drop size={30} />
      </HeaderDevice>

      <ImageDevice
        image={ImgBorbulha}
        link="https://dualbase.com.br/produto/limnidb-borbulha/"
        fit="contain"
      />

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>LimniDB-BORBULHA</b> é um equipamento para medição indireta do nível de água em ambientes agressivos, onde o sensor deve permanecer protegido contra impactos, detritos ou condições severas de operação. O princípio de medição por borbulhamento proporciona elevada confiabilidade mesmo nas aplicações mais exigentes." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            •{' '}
            <RichText i18nKey="<b>Sistema de autopurga que realiza a limpeza automática da linha de medição;</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Sensor protegido contra impactos e incrustações;</b>" />
          </p>
          <p>
            •{' '}
            <RichText i18nKey="<b>Saídas digitais RS-485 e SDI-12</b>, com ampla compatibilidade de integração." />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            {t(
              'Monitoramento em rios com elevada carga de sedimentos, canais, barragens, áreas sujeitas a detritos, ambientes agressivos e instalações onde sensores submersos convencionais apresentam limitações.'
            )}
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
