import { Broadcast, CellTower, Faders, File, Gear, Key } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Report } from './setting-conponents/report'
import { ChangePassword } from './setting-conponents/changePassword'
import { Conection } from './setting-conponents/conection'
import { ReadingPorts } from './setting-conponents/readingPorts'
import { Transmition } from './setting-conponents/transmition'
import { General } from './setting-conponents/general'

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
  receiverHeritage,
  receivedRepeatSync,
  receivedNPT,

  handleUpdateSettingsTransmition
}: Props): JSX.Element {
  const [selected, setSelected] = useState('Geral')
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

  const menuItems = [
    { name: 'Geral', icon: <Gear size={20} />, key: 'Geral' },
    { name: 'Conexão', icon: <CellTower size={20} />, key: 'Conexão' },
    { name: 'Transmissão', icon: <Broadcast size={20} />, key: 'Transmissão' },
    { name: 'Relatório', icon: <File size={20} />, key: 'Relatório' },
    { name: 'Senha', icon: <Key size={20} />, key: 'Senha' },
    { name: 'Portas de leitura', icon: <Faders size={20} />, key: 'Portas de leituras' }
  ]

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
    receivedTimerMaintenance,
    receiverHeritage,
    receivedRepeatSync,
    receivedNPT
  ])

  return (
    <div className="flex flex-row gap-2 h-auto">
      <div className=" mt-2 ">
        <nav className="w-auto bg-white shadow-lg  rounded-lg p-4 border-[1px] border-gray-200 mb-10">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.key}
                onClick={() => handleClick(item.key)}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                  selected === item.key ? 'bg-sky-500 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.name}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className=" flex flex-1  flex-col mt-2 mb-2 border-[1px] border-gray-200 rounded-lg">
        <div className="flex flex-row bg-gray-200 pl-2 py-1">
          <span className="ml-2 text-sm font-semibold">{selected}</span>
        </div>
        {
          <div className=" h-auto overflow-y-auto mr-8 ml-8 flex flex-col justify-center">
            {selected === 'Geral' ? (
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
            ) : selected === 'Conexão' ? (
              <Conection
                handleUpdateSettingsConection={handleUpdateConection}
                receivedSettingsConection={ArraySelectedConection}
                handleSendSettingsConection={handleSendSettingsConection}
              />
            ) : selected === 'Transmissão' ? (
              <Transmition
                handleSendSettingsTransmition={handleSendSettingsTransmition}
                handleUpdateSettingsTransmition={handleUpdateTransmition}
                receivedTimerFixed={TimerFixed}
                receivedTimerdynamic={TimerDynamic}
                receivedProtocolInUse={Protocol}
                receivedDataProtocolMQTT={ProtocolDataMQTT}
                receivedDataProtocolFTP={ProtocolDataFTP}
                receivedTimerMaintenance={TimerMaintenance}
              />
            ) : selected === 'Relatório' ? (
              <Report
                handleUpdateSettingsReport={handleUpdateReport}
                receivedSettingsReport={ArraySelectedReport}
                handleSendSettingsReport={handleSendSettingsReport}
              />
            ) : selected === 'Senha' ? (
              <ChangePassword handleSendChargePassword={handleSendChargePassword} />
            ) : (
              selected === 'Portas de leituras' && (
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
