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
    <div className="z-20 flex w-full shrink-0 flex-row items-center justify-between border-b-[2px] border-sky-500 bg-slate-50 px-2 py-1">
      <div>
        <img className="w-44" src={logo} alt="Logotipo da empresa dualbase" />
      </div>
      <div className="flex items-center space-x-2 text-blue-950">
        <button onClick={handleAbout}>{t('Sobre')}</button>
        <SelectLanguage />
      </div>
      <About visible={isVisible} onClose={handleClose} />
    </div>
  )
}
