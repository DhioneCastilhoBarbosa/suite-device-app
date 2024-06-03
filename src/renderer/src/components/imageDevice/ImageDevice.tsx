import { DownloadSimple } from "@phosphor-icons/react"


interface ImageDeviceProps{
  image: string
  link?: string
}

export function ImageDevice({image, link}:ImageDeviceProps){

  return(
    <div className=' w-full flex items-center justify-center mb-1 z-0 relative'>
          <img className= 'w-full h-full object-cover object-bottom'src={image} alt="" />
          <button className="absolute  flex items-center justify-center bg-[#1E9EF4] hover:bg-sky-400 text-white rounded-lg p-1 bottom-0 right-0 mr-2 mb-2">
            <DownloadSimple size={25}/>
            <a href={link} target="_blank" rel="noopener noreferrer"className="text-sm m-1">Baixar Manual</a>
          </button>
    </div>
  )
}
