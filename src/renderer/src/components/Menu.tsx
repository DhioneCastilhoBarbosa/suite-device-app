import { twMerge } from 'tailwind-merge'
import Conector from './conector/Conector'
import { Device } from '../Context/DeviceContext'
import { useEffect } from 'react'
import { t } from 'i18next'
import { cancelConnection, setPortOwner } from '../utils/modbusRTU'

const DEVICES = [
  { key: 'linnimDB-Borbulha', label: 'LimniDB-BORBULHA', match: (name: string) => name === 'linnimDB-Borbulha' },
  { key: 'linnimDB-cap', label: 'LimniDB-CAP', match: (name: string) => name === 'linnimDB-cap' },
  { key: 'linnimDB-radar', label: 'LimniDB-RADAR', match: (name: string) => name === 'linnimDB-radar' },
  {
    key: 'PluviDB-Iot',
    label: 'PluviDB-IoT',
    match: (name: string) => name === 'PluviDB-Iot' || name === 'PluviDB-Iot-Remote'
  },
  {
    key: 'PCD-Pluviometrica',
    label: 'PCD Pluviométrica',
    match: (name: string) => name === 'PCD-Pluviometrica' || name === 'PCD-Pluviometrica-Remote'
  },
  { key: 'teclado-sdi12', label: 'Teclado SDI-12', match: (name: string) => name === 'teclado-sdi12' },
  { key: 'terminal', label: 'Terminal SDI-12', match: (name: string) => name === 'terminal' },
  { key: 'terminal-serial', label: 'Terminal Serial', match: (name: string) => name === 'terminal-serial' },
  { key: 'TSatDB', label: 'TSatDB', match: (name: string) => name === 'TSatDB' }
] as const

export default function Menu() {
  const { device, setDevice, setPort, PortOpen, SetPortOpen }: any = Device()

  function newDevice(next: string) {
    if (next === device.name) return
    setPortOwner(null)
    void cancelConnection()
    SetPortOpen({ state: false })
    setDevice({ name: next })
  }

  function ChangeStatus(status) {
    SetPortOpen({ state: status })
  }

  function ConnectToDevice(isdevice) {
    setPort({ name: isdevice })
  }

  useEffect(() => {
    //console.log("Menu renderizou")
  }, [PortOpen.state])

  return (
    <div className="flex h-full min-h-0 w-52 shrink-0 flex-col rounded-lg bg-[#1769A0]">
      <div className="flex shrink-0 items-center justify-center border-b-[2px] border-sky-500 pb-3 pt-1">
        <span className="text-sm font-bold text-white">{t('Dispositivos')}</span>
      </div>

      <div className="sidebar-device-list min-h-0 flex-1 overflow-y-auto pl-1 pr-3 pt-4 font-bold text-white">
        <ul>
          {DEVICES.map((item) => (
            <li
              key={item.key}
              className={PortOpen.state ? 'cursor-not-allowed' : undefined}
            >
              <button
                className={twMerge(
                  'mb-2 flex h-8 w-full items-center justify-start rounded-b-lg rounded-tr-lg pl-4 text-left text-sm',
                  PortOpen.state ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer',
                  item.match(device.name)
                    ? 'bg-white text-[#1E9EF4]'
                    : `bg-[#1E9EF4] ${!PortOpen.state ? 'hover:bg-sky-400 hover:text-white' : ''}`
                )}
                onClick={() => newDevice(item.key)}
                disabled={PortOpen.state}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="shrink-0">
        <Conector
          portDevice={ConnectToDevice}
          isOnline={PortOpen.state}
          PortStatus={ChangeStatus}
        />
      </div>
    </div>
  )
}
