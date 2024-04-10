
export default function Information(){
  return(
    <div className=' m-auto bg-transparent grid grid-cols-2  gap-4 '>

          <div className='flex flex-col w-52'>
            <label> Número de Série</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={125896}
            />
          </div>

          <div className='flex flex-col w-52 '>
            <label>Modelo</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={"linnidb-cap"}
            />
          </div>

          <div className='flex flex-col'>
            <label>Versão do Firmware</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={"v.1-23"}
            />
          </div>
          <div className='flex flex-col'>
            <label>Versão do Hardware</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={"v.2-20"}
            />
          </div>
          <div className='flex flex-col'>
            <label>Faixa de medição</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={"0 - 20 ma"}
            />
          </div>
        </div>
  )
}
