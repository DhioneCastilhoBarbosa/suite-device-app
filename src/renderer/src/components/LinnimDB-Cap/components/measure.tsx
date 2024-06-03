import Button from "@renderer/components/button/Button";
import { readModbusData } from "@renderer/utils/modbusRTU";
import { useState } from "react";


export default function Measure(){
  const[readPressure, setReadPressure] = useState<number>(0)

  async function handleModbus(){

    try {
      const data = await readModbusData(2, 2, false,true);

      setReadPressure(data as number)
      console.log(data); // Aqui você terá os dados lidos do Modbus
  } catch (error) {
      console.error('Erro ao ler dados Modbus:', error);
  }

  }

  return(
    <>
      <div className="flex items-start justify-between  mb-4 border-b-[1px] border-sky-500 mr-8 ml-8 ">
        <label>Leitura</label>
      </div>
      <div className="flex flex-row justify-center gap-20 items-end mr-auto ml-auto mt-4 mb-8">
        <div className="flex flex-col mt-4">
          <label>Pressão</label>
          <input
          type="text"
          value={readPressure.toString()}
          disabled={true}
          className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
          min={0}
          />
        </div>
        <Button filled={true} size={"medium"} onClick={handleModbus}>Medir</Button>
      </div>
    </>
  )
}
