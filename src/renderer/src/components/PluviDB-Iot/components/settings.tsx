import { Broadcast, CellTower, Faders, File, Gear, Key } from '@phosphor-icons/react'
import { useState } from 'react'
import { Report } from './setting-conponents/report'
import { ChangePassword } from './setting-conponents/changePassword'
import { Conection } from './setting-conponents/conection'

type Props = {
  receiverSettings?: string | undefined
  receiverTxPowerLevel?: string | undefined
  handleUpdateSettings?: () => void
  handleSendSettings?: (settings: string[]) => void
  handlesRecoverSettingsFactory?: () => void
  handleFileInformations?: (newValue: string) => void
  handleClearFailSafe?: () => void
}

export default function Settings(): JSX.Element {
  const [selected, setSelected] = useState('Geral')

  const menuItems = [
    { name: 'Geral', icon: <Gear size={20} />, key: 'Geral' },
    { name: 'Conexão', icon: <CellTower size={20} />, key: 'Conexão' },
    { name: 'Transmissão', icon: <Broadcast size={20} />, key: 'Transmissão' },
    { name: 'Relatorio', icon: <File size={20} />, key: 'Relatorio' },
    { name: 'Senha', icon: <Key size={20} />, key: 'Senha' },
    { name: 'Portas de leitura', icon: <Faders size={20} />, key: 'Portas de leituras' }
  ]

  const handleClick = (key: string): void => {
    setSelected(key)
    console.log('Opção selecionada:', key)
  }

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
              <div>geral</div>
            ) : selected === 'Conexão' ? (
              <Conection />
            ) : selected === 'Transmissão' ? (
              <div>Transmissão</div>
            ) : selected === 'Relatorio' ? (
              <Report />
            ) : selected === 'Senha' ? (
              <ChangePassword />
            ) : (
              selected === 'Portas de leituras' && <div>Portas de leituras</div>
            )}
          </div>
        }
      </div>
    </div>
  )
}
