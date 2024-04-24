import Button from "@renderer/components/button/Button";
import { connectClient, readModbusData } from "@renderer/utils/modbusRTU";


export default function Measure(){


  async function handleModbus(){

    try {
      const data = await readModbusData(256, 8, false);
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
