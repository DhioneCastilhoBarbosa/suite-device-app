import { Bell } from '@phosphor-icons/react'
import logo from '../assets/logo.svg'
import SelectLanguage from './Select/SelectLanguage'
import { useState } from 'react'
import About from './about/about'
import { t } from 'i18next'

export function Header() {
  const [isVisible, setIsVisible] = useState(false)
  function handleAbout() {
    setIsVisible(!isVisible)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  return (
    <div className="max-h-16 bg-slate-50 border-b-[2px] border-sky-500 flex flex-row justify-between px-2 py-1 items-center w-screen fixed z-20">
      <div>
        <img className="w-44" src={logo} alt="Logotipo da empresa dualbase" />
      </div>
      <div className="flex items-center space-x-2 text-blue-950">
        <button onClick={handleAbout}>{t('Sobre')}</button>
        <button>
          <Bell width={24} height={24} />
        </button>
        <SelectLanguage />
      </div>
      <About visible={isVisible} onClose={handleClose} />
    </div>
  )
}
