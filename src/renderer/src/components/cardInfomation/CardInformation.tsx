import React from 'react'

interface CardProps {
  title: string
}

export function CardInformation({ title, children }: React.PropsWithChildren<CardProps>) {
  return (
    <div className="bg-[#EDF4FB] max-w-[800px] flex items-center  flex-col justify-center rounded-b-lg ">
      <div className=" pb-3 flex items-start justify-center flex-col mt-3">
        <h1 className="w-72 bg-[#1769A0] rounded-t-lg p-1 flex items-center justify-center text-white font-bold">
          {title}
        </h1>
        <div className="h-28 w-[800px] bg-white py-1 px-3 flex  justify-center flex-col rounded-b-lg rounded-r-lg text-sm text justify shadow-[0px_5px_7px_0px_rgb(0,0,0,0.50)]">
          {children}
        </div>
      </div>
    </div>
  )
}
