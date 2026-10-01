import { t } from 'i18next'
export default function Footer() {
  return (
    <div className="flex h-10 w-full shrink-0 items-center justify-center text-[10px] text-[#336B9E]">
      <span>{t('COPYRIGHT 2026 - TODOS OS DIREITOS RESERVADOS')}</span>
      <a
        className=" underline ml-1"
        href="https://www.dualbase.com.br/"
        target="_blank"
        rel="noreferrer"
      >
        DUALBASE
      </a>
    </div>
  )
}
