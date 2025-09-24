import { t } from 'i18next'
export default function Footer() {
  return (
    <div className="  w-full h-10 botton-0 flex items-center justify-center relative bottom-0 text-[10px] text-[#336B9E]">
      <span>{t('COPYRIGHT 2025 - TODOS OS DIREITOS RESERVADOS')}</span>
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
