import { DownloadSimple, FolderOpen, UploadSimple } from "@phosphor-icons/react";
import { Device } from "@renderer/Context/DeviceContext";
import Button from "@renderer/components/button/Button";
import { readModbusData } from "@renderer/utils/modbusRTU";
import { useEffect, useState } from "react";


export default function Settings(){
  const [modbusData, setModbusData] = useState<string[]>([]);
  const[address, setAddress] = useState(0)
  const [unit, setUnit] = useState(0)
  const [coefA, setCoefA] = useState(0)
  const [coefB, setCoefB] = useState(0)
  const {mode}:any = Device()


  const fetchData = async () => {
    try {
        // Espera 500 millsegundo antes de fazer a chamada Modbus
        await new Promise(resolve => setTimeout(resolve, 500));

        // Array de chamadas Modbus com argumentos específicos
        const modbusCalls = [
            { address: 255, register: 1, Int16: true },
            { address: 336, register: 1, Int16: true },
            { address: 352, register: 2, Int16: true },
            { address: 368, register: 2, Int16: true },
        ];

        // Função para fazer chamadas Modbus em sequência
        const makeModbusCalls = async (calls) => {
            for (let i = 0; i < calls.length; i++) {
                const { address, register, Int16 } = calls[i];
                const data = await readModbusData(address, register, Int16);
                setModbusData(prevData => [...prevData, data as string]);
                await new Promise(resolve => setTimeout(resolve, 300)); // Aguarda 200ms antes de fazer a próxima chamada

            }

        };

        // Chama a função para fazer as chamadas Modbus
        await makeModbusCalls(modbusCalls);

    } catch (error) {
        //console.error('Erro ao fazer chamadas Modbus:', error);
    }
};



  if(!mode.state){
    useEffect(() => {

      fetchData();
  }, []);

}

useEffect(() => {
  if (modbusData.length >= 4) {
     handleUpdateData()
  }
}, [modbusData]);


// aguarda receber todo os dado modbus para utilizar

function handleUpdateData(){

  setAddress(parseInt(modbusData[0]))
  setUnit(parseInt(modbusData[1]))
  setCoefA(parseInt(modbusData[2]))
  setCoefB(parseInt(modbusData[3]))
}

function updateAddress(event){
  setAddress(event.target.value)
}

function updateUnit(event){
  setUnit(event.target.value)
}
function updateCoefA(event){
  setCoefA(event.target.value)
}
function updateCoefB(event){
  setCoefB(event.target.value)
}

  return(
    <div className="flex flex-col items-center justify-center ">
      <div className="grid grid-cols-2  gap-4 h-full mt-4">


      <div className="flex flex-col w-52">
          <label>Endereço MODBUS</label>
          <input
          type="number"
          className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
          min={0}
          value={address}
          onChange={updateAddress}

          />
        </div>

        <div className="flex flex-col w-56 ">
          <label>Unidade</label>
          <select name="unidade" id="unidade" value={unit.toString()} onChange={updateUnit}className="w-48 rounded-md h-6">
          <option value="0">-</option>
            <option value="">mCA</option>
            <option value="">Pa</option>
            <option value="7">bar</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label>Coeficiente</label>
         <div className=" flex flex-row w-52 items-center justify-center border border-zinc-400 rounded-md p-2 gap-2">
          <div className="w-auto flex flex-col items-center pb-5">
            <label>Ax</label>
            <input
            type="number"
            className='w-full border border-zinc-400 rounded-md h-6 outline-none text-center'
            min={0}
            value={coefA}
            onChange={updateCoefA}
            />
          </div>
          <div className="w-6 flex flex-col justify-center">
            <span>+</span>
          </div>
          <div className="w-auto flex flex-col items-center pb-5">
            <label>B</label>
            <input
            type="number"
            className='w-full border border-zinc-400 rounded-md h-6 outline-none text-center'
            min={0}
            value={coefB}
            onChange={updateCoefB}
            />
          </div>
         </div>
        </div>



      </div>
      <div className=" flex flex-row gap-4 h-14 my-10 ">
        <Button size={"large"}>
            <FolderOpen size={24}/>
            Selecione o arquivo
        </Button>
        <Button size={"large"} onClick={fetchData}>
            <DownloadSimple size={24}/>
            Baixa informações
        </Button>
        <Button size={"large"}>
          <UploadSimple size={24}/>
            Enviar configurações
        </Button>
      </div>

    </div>

  )
}
