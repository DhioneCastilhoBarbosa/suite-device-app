import { DownloadSimple } from '@phosphor-icons/react'
import { t } from 'i18next'

const DEFAULT_MANUAL_URL = 'https://dualbase.com.br/produtos/'

interface ImageDeviceProps {
  image: string
  link?: string
  className?: string
  fit?: 'cover' | 'contain'
}

export function ImageDevice({
  image,
  link = DEFAULT_MANUAL_URL,
  className
}: ImageDeviceProps) {
  return (
    <div className={`device-banner relative z-0 mb-1 w-full ${className ?? ''}`}>
      <img src={image} alt="" />
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-3 z-10 flex items-center justify-center rounded-md bg-[#1E9EF4] px-2 py-1.5 text-white shadow-sm transition-all duration-150 hover:bg-sky-400 hover:shadow-md"
      >
        <DownloadSimple size={25} />
        <span className="m-1 text-sm">{t('Saiba mais')}</span>
      </a>
    </div>
  )
}
