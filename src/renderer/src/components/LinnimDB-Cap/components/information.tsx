import { Device } from "@renderer/Context/DeviceContext";
import { readModbusData } from "@renderer/utils/modbusRTU";
import { useEffect, useState } from "react";

export default function Information(){
  const [modbusData, setModbusData] = useState<string[]>([]);
  const {mode}:any = Device()

  if(!mode.state){
      useEffect(() => {
        const fetchData = async () => {
            try {
                // Espera 1 segundo antes de fazer a chamada Modbus
                await new Promise(resolve => setTimeout(resolve, 500));

                // Array de chamadas Modbus com argumentos específicos
                const modbusCalls = [
                    { address: 288, register: 4, Int16: false },
                    { address: 256, register: 8, Int16: false },
                    { address: 320, register: 4, Int16: false },
                    { address: 304, register: 4, Int16: false },
                    { address: 272, register: 8, Int16: false }
                ];

                // Função para fazer chamadas Modbus em sequência
                const makeModbusCalls = async (calls) => {
                    for (let i = 0; i < calls.length; i++) {
                        const { address, register, Int16 } = calls[i];
                        const data = await readModbusData(address, register, Int16);
                        setModbusData(prevData => [...prevData, data as string]);
                        await new Promise(resolve => setTimeout(resolve, 300)); // Aguarda 200ms antes de fazer a próxima chamada
                        //const timestamp = new Date().toISOString();
                        //console.log(i, timestamp);
                    }
                };

                // Chama a função para fazer as chamadas Modbus
                await makeModbusCalls(modbusCalls);
            } catch (error) {
                //console.error('Erro ao fazer chamadas Modbus:', error);
            }
        };

        fetchData();
    }, []);

 }

 useEffect(() => {
  if (modbusData.length >= 4) {
     // criar variaveis de controle para cada campo para aguarda todas ficarem disponivel para exibir
  }
}, [modbusData]);

  return(
    <div className=' m-auto bg-transparent grid grid-cols-2  gap-4 my-36'>

          <div className='flex flex-col w-52'>
            <label> Número de Série</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={modbusData[0] || 'NAN'}

            />
          </div>

          <div className='flex flex-col w-52 '>
            <label>Modelo</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={modbusData[1] || 'NAN'}
            />
          </div>

          <div className='flex flex-col'>
            <label>Versão do Firmware</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={modbusData[2] || 'NAN'}
            />
          </div>
          <div className='flex flex-col'>
            <label>Versão do Hardware</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={modbusData[3] || 'NAN'}
            />
          </div>
          <div className='flex flex-col'>
            <label>Faixa de medição</label>
            <input className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
            type="text"
            disabled
            value={modbusData[4] || 'NAN'}
            />
          </div>
        </div>
  )
}
