import { twMerge } from 'tailwind-merge'
import Conector from './conector/Conector'
import { Device } from '@renderer/Context/DeviceContext'
import { useEffect } from 'react'
import Footer from './Footer'

export default function Menu() {
  const { device, setDevice, setPort, PortOpen, SetPortOpen }: any = Device()

  function newDevice(device) {
    // console.log(device)
    setDevice({ name: device })
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
    <div className="flex max-h-screen flex-col justify-between bg-[#1769A0] w-52 rounded-lg mt-16 ">
      <div>
        <div className="flex items-center justify-center border-b-[2px] border-sky-500 pt-1 pb-3">
          <span className="text-white text-sm font-bold">Dispostivos</span>
        </div>

        <div className="flex items-center justify-center pt-4 text-white font-bold">
          <ul className="  w-full ml-1 mr-3">
            <li className="">
              <button
                className={twMerge(
                  'w-full h-8 flex items-center justify-start pl-4 rounded-b-lg rounded-tr-lg mb-2',
                  device.name === 'terminal'
                    ? 'bg-white text-[#1E9EF4]'
                    : `bg-[#1E9EF4] ${!PortOpen.state ? 'hover:bg-sky-400 hover:text-white' : ''}`
                )}
                onClick={() => newDevice('terminal')}
                disabled={PortOpen.state}
              >
                Terminal-SDI12
              </button>
            </li>
            <li>
              <button
                className={twMerge(
                  'w-full h-8 flex items-center justify-start pl-4 rounded-b-lg rounded-tr-lg mb-2',
                  device.name === 'linnimDB-Borbulha'
                    ? 'bg-white text-[#1E9EF4]'
                    : `bg-[#1E9EF4] ${!PortOpen.state ? 'hover:bg-sky-400 hover:text-white' : ''}`
                )}
                onClick={() => newDevice('linnimDB-Borbulha')}
                disabled={PortOpen.state}
              >
                LimniDB-Borbulha
              </button>
            </li>
            <li>
              <button
                className={twMerge(
                  'w-full h-8 flex items-center justify-start pl-4 rounded-b-lg rounded-tr-lg mb-2',
                  device.name === 'linnimDB-cap'
                    ? 'bg-white text-[#1E9EF4]'
                    : `bg-[#1E9EF4] ${!PortOpen.state ? 'hover:bg-sky-400 hover:text-white' : ''}`
                )}
                onClick={() => newDevice('linnimDB-cap')}
                disabled={PortOpen.state}
              >
                LimniDB-CAP
              </button>
            </li>
            <li>
              <button
                className={twMerge(
                  'w-full h-8 flex items-center justify-start pl-4 rounded-b-lg rounded-tr-lg mb-2',
                  device.name === 'teclado-sdi12'
                    ? 'bg-white text-[#1E9EF4]'
                    : `bg-[#1E9EF4] ${!PortOpen.state ? 'hover:bg-sky-400 hover:text-white' : ''}`
                )}
                onClick={() => newDevice('teclado-sdi12')}
                disabled={PortOpen.state}
              >
                Teclado-SDI12
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <Conector
          portDevice={ConnectToDevice}
          isOnline={PortOpen.state}
          PortStatus={ChangeStatus}
        />
      </div>
    </div>
  )
}
