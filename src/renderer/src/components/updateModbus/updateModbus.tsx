import {ArrowsClockwise, FolderOpen } from "@phosphor-icons/react";
import Button from "../button/Button";

export default function UpdateModubus(){
  return(
  <div className="flex flex-col items-center  w-full h-96 ">
    <div className='flex flex-col w-2/3 mt-8'>
      <label>Status</label>
      <textarea className=" h-36 border border-[2px] border-zinc-200 resize-none whitespace-pre-wrap outline-none text-black text-sm rounded-md"/>
      <label className="mt-4">BaudRate</label>
      <select className="w-40 h-6 rounded-md">
        <option value="115200">115200</option>
        <option value="9600">9600</option>
      </select>
    </div>
    <div className="flex flex-row gap-8 mt-10">
      <Button size={"large"}>
        <FolderOpen size={24}/>
        Selecionar arquivo
      </Button>
      <Button size={"large"}>
        <ArrowsClockwise size={24}/>
        Atualizar
      </Button>
    </div>
  </div>

  )}
