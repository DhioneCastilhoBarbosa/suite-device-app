import { useEffect, useState } from 'react'

type Props = {
  receivedDataInst: string | undefined
  //handleSendSettings?: (settings: string[]) => void
  handleUpdateInst: () => void
}

export function InstantData({ receivedDataInst, handleUpdateInst }: Props): JSX.Element {
  const [selected, setSelected] = useState('5')
  const [date, setDate] = useState('00/00/00 00:00:00')
  const [data, setData] = useState([
    { id: 1, name: 'Chuva P1 instantânea(mm):', value: '0.00' },
    { id: 2, name: 'Chuva P1 diária(mm):', value: '0.00' },
    { id: 3, name: 'Chuva P1 mensal(mm):', value: '0.00' },
    { id: 4, name: 'Chuva P1 anual(mm):', value: '0.00' },
    { id: 5, name: 'Chuva P1 Total(mm):', value: '0.00' },
    { id: 6, name: 'Chuva P2 instantânea(mm):', value: '0.00' },
    { id: 7, name: 'Chuva P2 diária(mm):', value: '0.00' },
    { id: 8, name: 'Chuva P2 mensal(mm):', value: '0.00' },
    { id: 9, name: 'Chuva P2 anual(mm):', value: '0.00' },
    { id: 10, name: 'Chuva P2 Total(mm):', value: '0.00' },
    { id: 11, name: 'Bateria(V):', value: '0.0' },
    { id: 12, name: 'Sinal(dBm):', value: '0' },
    { id: 13, name: 'Contador de inicialização:', value: '0' }
  ])

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateInst()
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const matchInst = receivedDataInst ? receivedDataInst.match(/inst=([\d.;-]+)!/) : null
    const valuesArray = matchInst ? matchInst[1].split(';') : []
    //console.log('valuesArray:', valuesArray.length)
    setData((prevData) =>
      prevData.map((item, index) => ({
        ...item,
        value: valuesArray[index] ?? item.value
      }))
    )

    const matchDate = receivedDataInst ? receivedDataInst.match(/dt=(.*)!/) : null
    const dateArray = matchDate ? matchDate[1] : ''
    setDate(dateArray)
  }, [receivedDataInst])

  useEffect(() => {
    const interval = setInterval(
      () => {
        handleUpdateInst()
      },
      Number(selected) * 1000
    )
    return () => clearInterval(interval)
  }, [selected])

  return (
    <div className="my-2">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal ">
              <th className="py-1 px-6 text-left">Dados Instantâneos</th>

              <th className=" flex  justify-end items-center gap-1">
                <label className="mt-1  text-xs font-semibold text-gray-700">
                  Totalização a cada 60 segundos
                </label>
                <span className="ml-2"></span>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            <tr className=" border-b border-gray-200 hover:bg-gray-50">
              <td className="py-1 px-6 text-left font-bold text-gray-500">Data/Hora:</td>
              <td className=" flex justify-center items-end py-1.5 px-6 text-left font-semibold text-gray-400 text-md">
                {date}
              </td>
            </tr>
            {data.map((item) => (
              <tr key={item.id} className=" border-b border-gray-200 hover:bg-gray-50">
                <td className="py-1 px-6 text-left font-bold text-gray-500">{item.name}</td>
                <td className=" flex justify-center items-end py-1.5 px-6 text-left font-semibold text-gray-400 text-md">
                  {item.value}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 text-gray-700 text-sm leading-normal rounded-b-lg ">
              <td className="py-3 px-6 text-left rounded-bl-lg" colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
