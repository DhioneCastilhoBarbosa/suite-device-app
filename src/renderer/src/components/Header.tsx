import { Bell } from '@phosphor-icons/react'
import logo from '../assets/logo.svg'
import SelectLanguage from './Select/SelectLanguage'

export function Header() {
  return (
    <div className="max-h-16 bg-slate-50 border-b-[2px] border-sky-500 flex flex-row justify-between px-2 py-1 items-center absolute w-full">
      <div>
        <img className="w-44" src={logo} alt="Logotipo da empresa dualbase" />
      </div>
      <div className="flex items-center space-x-2 text-blue-950">
        <span>Sobre</span>
        <button>
          <Bell width={24} height={24} />
        </button>
        <SelectLanguage />
      </div>
    </div>
  )
}
