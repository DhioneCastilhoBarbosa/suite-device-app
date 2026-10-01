import React from 'react'
import { Trans } from 'react-i18next'

interface CardProps {
  title: string
}

export function RichText({ i18nKey }: { i18nKey: string }) {
  return <Trans i18nKey={i18nKey} components={{ b: <strong />, i: <em /> }} />
}

export function CardInformation({ title, children }: React.PropsWithChildren<CardProps>) {
  return (
    <div className="flex w-full max-w-[800px] flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB]">
      <div className="mt-3 flex w-full flex-col items-start justify-center pb-3 px-3">
        <h1 className="flex w-72 max-w-full items-center justify-center rounded-t-lg bg-[#1769A0] p-1 font-bold uppercase text-white">
          {title}
        </h1>
        <div className="flex w-full flex-col justify-center rounded-b-lg rounded-r-lg bg-white px-3 py-4 text-sm shadow-[0px_5px_7px_0px_rgb(0,0,0,0.50)]">
          {children}
        </div>
      </div>
    </div>
  )
}
