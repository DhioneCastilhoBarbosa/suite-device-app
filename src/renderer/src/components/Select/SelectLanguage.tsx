import { useTranslation } from 'react-i18next'

// ajuste os caminhos conforme seus arquivos
import flagBR from '../../assets/Brasil.svg'
import flagUS from '../../assets/flag_us.png'
import flagES from '../../assets/flag_es.png'

type Lang = 'pt' | 'en' | 'es'
const FLAGS: Record<Lang, string> = { pt: flagBR, en: flagUS, es: flagES }
const ALTS: Record<Lang, string> = {
  pt: 'bandeira do Brasil',
  en: 'flag of USA',
  es: 'bandera de España'
}

function baseLng(l?: string): Lang {
  if (!l) return 'pt'
  if (l.startsWith('pt')) return 'pt'
  if (l.startsWith('en')) return 'en'
  if (l.startsWith('es')) return 'es'
  return 'pt'
}

export default function SelectLanguage(): JSX.Element {
  const { i18n } = useTranslation()
  const lang = baseLng(i18n.resolvedLanguage || i18n.language)

  return (
    <div className="flex items-center border-[1px] border-[#336B9E] rounded-lg p-[4px] h-8">
      <img className="h-4 w-6 mr-1 rounded-sm" src={FLAGS[lang]} alt={ALTS[lang]} />
      <select
        className="p-[4px] w-auto bg-inherit outline-0"
        value={lang}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="pt">Português</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  )
}
