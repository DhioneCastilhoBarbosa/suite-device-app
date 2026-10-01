import { Broadcast, CellTower, Faders, File, Gear, Key } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Report } from './setting-conponents/report'
import { ChangePassword } from './setting-conponents/changePassword'
import { Conection } from './setting-conponents/conection'
import { ReadingPorts } from './setting-conponents/readingPorts'
import { Transmition } from './setting-conponents/transmition'
import { General } from './setting-conponents/general'
import { t } from 'i18next'

type Props = {
  receiverSettingsReport: string | undefined
  receiverSettingsConection: string | undefined
  receiverGeneralName: string | undefined
  receiverGeneralGeolocation: string | undefined
  receiverGeneralTimeZone: string | undefined
  receiverGeneralTime: string | undefined
  receiverSettingsPortP1: string | undefined
  receiverSettingsPortP2: string | undefined
  receiverSettingsPortSdi: string | undefined
  receivedTimerFixed: string | undefined
  receivedTimerdynamic: string | undefined
  receivedTimerMaintenance: string | undefined
  receivedProtocol: string | undefined
  receivedProtocolDataMQTT: string | undefined
  receivedProtocolDataFTP: string | undefined
  receivedProtocolDataHTTP: string | undefined
  receiverHeritage: string | undefined
  receivedRepeatSync: string | undefined
  receivedNPT: string | undefined
  handleUpdateSettingsPorts: () => void
  handleUpdateSettingsGeneral: () => void
  handleUpdateSettingsReport: () => void
  handleUpdateSettingsConection: () => void
  handleUpdateSettingsTransmition: () => void
  handleSendSettingsTransmition: (settings: string[]) => void
  handleSendChargePassword: (settings: string) => void
  handleSendSettingsGeneral: (settings: string[]) => void
  handleSendSettingsPorts: (settings: string[]) => void
  handleSendSettingsReport: (settings: string[]) => void
  handleSendSettingsConection: (settings: string[]) => void
  handleFileInformations?: (newValue: string) => void
}

export default function Settings({
  handleUpdateSettingsReport,
  handleUpdateSettingsConection,
  handleUpdateSettingsGeneral,
  handleSendSettingsPorts,
  receiverSettingsReport,
  receiverSettingsConection,
  receiverGeneralName,
  receiverGeneralGeolocation,
  receiverGeneralTimeZone,
  receiverGeneralTime,
  receiverSettingsPortP1,
  receiverSettingsPortP2,
  receiverSettingsPortSdi,
  receivedProtocol,
  handleSendSettingsReport,
  handleSendSettingsConection,
  handleSendSettingsGeneral,
  handleSendChargePassword,
  handleUpdateSettingsPorts,
  handleSendSettingsTransmition,
  receivedTimerFixed,
  receivedTimerdynamic,
  receivedTimerMaintenance,
  receivedProtocolDataMQTT,
  receivedProtocolDataFTP,
  receivedProtocolDataHTTP,
  receiverHeritage,
  receivedRepeatSync,
  receivedNPT,

  handleUpdateSettingsTransmition
}: Props): JSX.Element {
  const [selected, setSelected] = useState('geral')
  const [ArraySelectedReport, setArraySelectedReport] = useState<string | undefined>()
  const [ArraySelectedConection, setArraySelectedConection] = useState<string | undefined>()
  const [GeneralName, setGeneralName] = useState<string | undefined>()
  const [GeneralGeolocation, setGeneralGeolocation] = useState<string | undefined>()
  const [GeneralTimeZone, setGeneralTimeZone] = useState<string | undefined>()
  const [GeneralTime, setGeneralTime] = useState<string | undefined>()
  const [GeneralHeritage, setGeneralHeritage] = useState<string | undefined>()
  const [GeneralRepeatSync, setGeneralRepeatSync] = useState<string | undefined>()
  const [GeneralNPT, setGeneralNPT] = useState<string | undefined>()
  const [PortP1, setPortP1] = useState<string | undefined>()
  const [PortP2, setPortP2] = useState<string | undefined>()
  const [PortSdi, setPortSdi] = useState<string | undefined>()
  const [TimerFixed, setTimerFixed] = useState<string | undefined>()
  const [TimerDynamic, setTimerDynamic] = useState<string | undefined>()
  const [TimerMaintenance, setTimerMaintenance] = useState<string | undefined>()
  const [Protocol, setProtocol] = useState<string | undefined>()
  const [ProtocolDataMQTT, setProtocolDataMQTT] = useState<string | undefined>()
  const [ProtocolDataFTP, setProtocolDataFTP] = useState<string | undefined>()
  const [ProtocolDataHTTP, setProtocolDataHTTP] = useState<string | undefined>()

  const menuItems = [
    { name: t('Geral'), icon: <Gear size={20} />, key: 'geral' },
    { name: t('Conexão'), icon: <CellTower size={20} />, key: 'conexao' },
    { name: t('Transmissão'), icon: <Broadcast size={20} />, key: 'transmissao' },
    { name: t('Relatório'), icon: <File size={20} />, key: 'relatorio' },
    { name: t('Senha'), icon: <Key size={20} />, key: 'senha' },
    { name: t('Portas de leitura'), icon: <Faders size={20} />, key: 'portas' }
  ]

  const selectedLabel = menuItems.find((item) => item.key === selected)?.name ?? selected

  const handleClick = (key: string): void => {
    setSelected(key)
    console.log('Opção selecionada:', key)
  }

  function handleUpdateGeneral(): void {
    setGeneralName('')
    setGeneralGeolocation('')
    setGeneralTimeZone('')
    setGeneralTime('')
    setGeneralHeritage('')
    setGeneralRepeatSync('')
    setGeneralNPT('')
    handleUpdateSettingsGeneral()
  }

  function handleUpdateConection(): void {
    setArraySelectedConection('')
    handleUpdateSettingsConection()
  }
  function handleUpdateReport(): void {
    setArraySelectedReport('')
    handleUpdateSettingsReport()
  }

  function handleUpdatePorts(): void {
    setPortP1('')
    setPortP2('')
    setPortSdi('')
    setProtocol('')
    handleUpdateSettingsPorts()
  }

  function handleUpdateTransmition(): void {
    setTimerFixed('')
    setTimerDynamic('')
    setProtocol('')
    setProtocolDataMQTT('')
    setProtocolDataFTP('')
    setProtocolDataHTTP('')
    handleUpdateSettingsTransmition()
  }

  useEffect(() => {
    if (receiverSettingsReport) {
      setArraySelectedReport(receiverSettingsReport ?? undefined)
    }
  }, [receiverSettingsReport])

  useEffect(() => {
    if (receiverGeneralName) {
      setGeneralName(receiverGeneralName)
    }
  }, [receiverGeneralName])

  useEffect(() => {
    if (receiverGeneralGeolocation) {
      setGeneralGeolocation(receiverGeneralGeolocation)
    }
  }, [receiverGeneralGeolocation])

  useEffect(() => {
    if (receiverGeneralTimeZone) {
      setGeneralTimeZone(receiverGeneralTimeZone)
    }
  }, [receiverGeneralTimeZone])

  useEffect(() => {
    if (receiverGeneralTime) {
      setGeneralTime(receiverGeneralTime)
    }
  }, [receiverGeneralTime])

  useEffect(() => {
    if (receiverSettingsConection) {
      setArraySelectedConection(receiverSettingsConection ?? undefined)
    }
  }, [receiverSettingsConection])

  useEffect(() => {
    if (receiverSettingsPortP1) {
      setPortP1(receiverSettingsPortP1 ?? undefined)
    }
    if (receiverSettingsPortP2) {
      setPortP2(receiverSettingsPortP2 ?? undefined)
    }
    if (receiverSettingsPortSdi) {
      setPortSdi(receiverSettingsPortSdi ?? undefined)
    }
  }, [receiverSettingsPortP1, receiverSettingsPortP2, receiverSettingsPortSdi])

  useEffect(() => {
    if (receivedTimerFixed) {
      setTimerFixed(receivedTimerFixed ?? undefined)
    }
    if (receivedTimerdynamic) {
      setTimerDynamic(receivedTimerdynamic ?? undefined)
    }
    if (receivedProtocol) {
      setProtocol(receivedProtocol ?? undefined)
    }
    if (receivedProtocolDataMQTT) {
      setProtocolDataMQTT(receivedProtocolDataMQTT ?? undefined)
    }
    if (receivedProtocolDataFTP) {
      setProtocolDataFTP(receivedProtocolDataFTP ?? undefined)
    }
    if (receivedProtocolDataHTTP) {
      setProtocolDataHTTP(receivedProtocolDataHTTP ?? undefined)
    }

    if (receivedTimerMaintenance) {
      setTimerMaintenance(receivedTimerMaintenance ?? undefined)
    }

    if (receiverHeritage) {
      setGeneralHeritage(receiverHeritage ?? undefined)
    }

    if (receivedRepeatSync) {
      setGeneralRepeatSync(receivedRepeatSync ?? undefined)
    }

    if (receivedNPT) {
      setGeneralNPT(receivedNPT ?? undefined)
    }
  }, [
    receivedTimerFixed,
    receivedTimerdynamic,
    receivedProtocol,
    receivedProtocolDataMQTT,
    receivedProtocolDataFTP,
    receivedProtocolDataHTTP,
    receivedTimerMaintenance,
    receiverHeritage,
    receivedRepeatSync,
    receivedNPT
  ])

  return (
    <div className="flex h-auto flex-row gap-2">
      <div className="mt-2">
        <nav className="mb-10 w-auto rounded-md border border-sky-100 bg-white p-3 shadow-sm">
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <li
                key={item.key}
                onClick={() => handleClick(item.key)}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 transition-colors duration-150 ${
                  selected === item.key
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-sky-50 hover:text-sky-600'
                }`}
              >
                {item.icon}
                {item.name}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mb-2 mt-2 flex flex-1 flex-col overflow-hidden rounded-md border border-sky-100 bg-white shadow-sm">
        <div className="flex flex-row border-b border-sky-600 bg-sky-500 py-1.5 pl-2">
          <span className="ml-2 text-xs font-bold uppercase tracking-wide text-white">
            {selectedLabel}
          </span>
        </div>
        {
          <div className="ml-8 mr-8 flex h-auto flex-col justify-center overflow-y-auto bg-white">
            {selected === 'geral' ? (
              <General
                handleSendSettingsGeneral={handleSendSettingsGeneral}
                handleUpdateSettingsGeneral={handleUpdateGeneral}
                receivedDeviceName={GeneralName}
                receivedGeolocation={GeneralGeolocation}
                receivedTimeZone={GeneralTimeZone}
                receivedTime={GeneralTime}
                receivedHeritage={GeneralHeritage}
                receivedRepeatSync={GeneralRepeatSync}
                receivedNtp={GeneralNPT}
              />
            ) : selected === 'conexao' ? (
              <Conection
                handleUpdateSettingsConection={handleUpdateConection}
                receivedSettingsConection={ArraySelectedConection}
                handleSendSettingsConection={handleSendSettingsConection}
              />
            ) : selected === 'transmissao' ? (
              <Transmition
                handleSendSettingsTransmition={handleSendSettingsTransmition}
                handleUpdateSettingsTransmition={handleUpdateTransmition}
                receivedTimerFixed={TimerFixed}
                receivedTimerdynamic={TimerDynamic}
                receivedProtocolInUse={Protocol}
                receivedDataProtocolMQTT={ProtocolDataMQTT}
                receivedDataProtocolFTP={ProtocolDataFTP}
                receivedDataProtocolHTTP={ProtocolDataHTTP}
                receivedTimerMaintenance={TimerMaintenance}
              />
            ) : selected === 'relatorio' ? (
              <Report
                handleUpdateSettingsReport={handleUpdateReport}
                receivedSettingsReport={ArraySelectedReport}
                handleSendSettingsReport={handleSendSettingsReport}
              />
            ) : selected === 'senha' ? (
              <ChangePassword handleSendChargePassword={handleSendChargePassword} />
            ) : (
              selected === 'portas' && (
                <ReadingPorts
                  handleSendSettingsPort={handleSendSettingsPorts}
                  handleUpdateSettingsPort={handleUpdatePorts}
                  receivedPortP1={PortP1}
                  receivedPortP2={PortP2}
                  receivedPortSdi={PortSdi}
                />
              )
            )}
          </div>
        }
      </div>
    </div>
  )
}
