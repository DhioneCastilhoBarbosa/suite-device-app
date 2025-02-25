import { useState } from 'react'

type Props = {
  receiverTxPowerLevel: string | undefined
  handleSendSettings: (settings: string[]) => void
  handleUpdateSettings: () => void
}

export function InstantData(): JSX.Element {
  const [selected, setSelected] = useState('5')
  const data = [
    { id: 1, name: 'Chuva P1 intantânea(mm):', value: '0.00' },
    { id: 2, name: 'Chuva P1 diária(mm):', value: '0.00' },
    { id: 3, name: 'Chuva P1 mensal(mm):', value: '0.00' },
    { id: 4, name: 'Chuva P1 anual(mm):', value: '0.00' },
    { id: 5, name: 'Chuva P2 intantânea(mm):', value: '0.00' },
    { id: 6, name: 'Chuva P2 diária(mm):', value: '0.00' },
    { id: 7, name: 'Chuva P2 mensal(mm):', value: '0.00' },
    { id: 8, name: 'Chuva P2 anual(mm):', value: '0.00' },
    { id: 9, name: 'Bateria(V):', value: '3.56' },
    { id: 10, name: 'Sinal(dBm):', value: '-93' },
    { id: 11, name: 'Contador de inicialização:', value: '5' }
  ]
  return (
    <div className="my-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Dados Instantâneos</th>

              <th className=" flex justify-end items-center gap-1">
                <label className=" mt-1.5 text-xs font-semibold text-gray-700">
                  Tempo de atualização:
                </label>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className=" mt-1.5  mr-2 block  p-1 border rounded-md bg-white text-gray-700 shadow-sm focus:ring focus:ring-blue-300"
                >
                  <option value="" disabled></option>
                  <option value="5">5 segundos</option>
                  <option value="10">10 segundos</option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {data.map((item) => (
              <tr key={item.id} className=" border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-6 text-left font-bold text-gray-500">{item.name}</td>
                <td className=" flex justify-center items-end py-3 px-6 text-left font-semibold text-gray-400 text-md">
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 text-gray-700 text-sm leading-normal rounded-b-lg ">
              <td className="py-3 px-6 text-left rounded-bl-lg" colSpan="3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
