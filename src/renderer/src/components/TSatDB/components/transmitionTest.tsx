import { Broom, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useState } from 'react'
type Props = {
  handleTestTransmissions: (id: string, channel: string, message: string) => void
}
export function TransmissionTest({ handleTestTransmissions }: Props): JSX.Element {
  const [id, setId] = useState('0000')
  const [channel, setChannel] = useState('33')
  const [message, setMessage] = useState('')

  const handleInputChange = (id: string, value: string): void => {
    switch (id) {
      case 'ID':
        setId(value)
        break
      case 'channel':
        setChannel(value)
        break
      case 'message':
        setMessage(value)
        break
      default:
        break
    }
  }

  const handleSendTransmission = (): void => {
    handleTestTransmissions(id, channel, message)
  }

  const handleClear = () => {
    setId('0000')
    setChannel('33')
    setMessage('')
  }

  return (
    <div className=" flex flex-col w-full justify-center items-center mt-20">
      <div className=" flex w-full ">
        <label className="bg-sky-500 text-white w-full text-center font-bold text-xl rounded-t-md">
          Teste de transmissão
        </label>
      </div>
      <div className="flex flex-col w-full gap-4 border-[1px] border-sky-500 p-8 items-start rounded-b-md">
        <div className="flex flex-col gap-2">
          <label> ID da plataforma</label>
          <input
            id="ID"
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-52"
            type="text"
            value={id}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label> Número do canal da transmissão</label>
          <input
            id="channel"
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
            type="number"
            value={channel}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label>Mensagem a ser transmitida</label>
          <input
            id="message"
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-96"
            type="text"
            value={message}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
            placeholder="Digite a mensagem a ser transmitida"
          />
        </div>
      </div>
      <div className="flex flex-row justify-end items-center gap-4 mt-4 w-full">
        <Button size={'large'} filled={false} className="h-10" onClick={handleClear}>
          <Broom size={24} />
          Limpar
        </Button>
        <Button size={'large'} className="h-10" filled={false} onClick={handleSendTransmission}>
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
