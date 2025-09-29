import { useTranslation } from 'react-i18next'
import * as Select from '@radix-ui/react-select'
import { CaretDown, CaretUp } from '@phosphor-icons/react'

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
const LABELS: Record<Lang, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español'
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
    <Select.Root value={lang} onValueChange={(v) => i18n.changeLanguage(v)}>
      <Select.Trigger
        className="group flex items-center gap-2 h-8 px-2 border border-[#336B9E] rounded-lg bg-inherit"
        aria-label="Selecionar idioma"
      >
        <img className="h-4 w-6 rounded-sm" src={FLAGS[lang]} alt={ALTS[lang]} />
        <Select.Value>{LABELS[lang]}</Select.Value>

        {/* gira quando o Trigger está aberto */}
        <Select.Icon className="ml-1 transition-transform duration-200 group-data-[state=open]:rotate-180">
          <CaretDown size={14} weight="bold" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-[1000] overflow-hidden rounded-lg border bg-white dark:bg-zinc-900 shadow-md"
        >
          <Select.ScrollUpButton className="flex items-center justify-center py-1">
            <CaretUp size={14} weight="bold" />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            {(['pt', 'en', 'es'] as Lang[]).map((l) => (
              <Select.Item
                key={l}
                value={l}
                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer outline-none data-[highlighted]:bg-zinc-100 dark:data-[highlighted]:bg-zinc-800"
              >
                <img className="h-4 w-6 rounded-sm" src={FLAGS[l]} alt={ALTS[l]} />
                <Select.ItemText>{LABELS[l]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center py-1">
            <CaretDown size={14} weight="bold" />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
