import { X } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import MqttManager from '../../../utils/mqttManager'

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  device?: {
    id?: number // Adiciona ID para permitir atualização
    name: string
    imei: string
    brokerAddress: string
    brokerPort: string
    brokerUser: string
    brokerPassword: string
    brokerTopic: string
  }
}

export default function AddDeviceModal({
  isOpen,
  onClose,
  device
}: AddDeviceModalProps): React.ReactElement {
  const [name, setName] = useState('')
  const [imei, setImei] = useState('')
  const [brokerAddress, setBrokerAddress] = useState('')
  const [brokerPort, setBrokerPort] = useState('1883')
  const [brokerUser, setBrokerUser] = useState('')
  const [brokerPassword, setBrokerPassword] = useState('')
  const [brokerTopic, setBrokerTopic] = useState('')
  const [conexaoStatus, setConexaoStatus] = useState<string | null>(null)

  useEffect(() => {
    if (device) {
      setName(device.name)
      setImei(device.imei)
      setBrokerAddress(device.brokerAddress)
      setBrokerPort(device.brokerPort)
      setBrokerUser(device.brokerUser)
      setBrokerPassword(device.brokerPassword)
      setBrokerTopic(device.brokerTopic)
    } else {
      setName('')
      setImei('')
      setBrokerAddress('')
      setBrokerPort('1883')
      setBrokerUser('')
      setBrokerPassword('')
      setBrokerTopic('')
    }
    setConexaoStatus(null)
  }, [device, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    const deviceData = {
      id: device?.id, // Para update
      name,
      imei,
      brokerAddress,
      brokerPort,
      brokerUser,
      brokerPassword,
      brokerTopic
    }

    try {
      const { ipcRenderer } = window.require('electron')
      let result
      if (device?.id) {
        // Atualizar
        result = await ipcRenderer.invoke('update-device', deviceData)
      } else {
        // Novo
        result = await ipcRenderer.invoke('save-device', deviceData)
      }

      if (result.success) {
        setConexaoStatus(
          device?.id ? 'Dispositivo atualizado com sucesso!' : 'Dispositivo salvo com sucesso!'
        )
        onClose() // Fecha o modal
      } else {
        const errorMessage = result.error ?? 'Erro desconhecido'
        setConexaoStatus(`Erro ao salvar no banco: ${errorMessage}`)
        console.error('Erro ao salvar no banco:', errorMessage)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setConexaoStatus(`Erro no IPC: ${errorMessage}`)
      console.error('Erro no IPC:', error)
    }
  }

  const testarConexaoBroker = async (): Promise<void> => {
    if (!brokerAddress || !brokerPort) {
      setConexaoStatus('Por favor, preencha endereço e porta do broker.')
      return
    }

    setConexaoStatus('Conectando...')
    const mqttManager = new MqttManager()
    const brokerUrl = `mqtt://${brokerAddress}:${brokerPort}`
    const options = {
      username: brokerUser || undefined,
      password: brokerPassword || undefined,
      connectTimeout: 4000
    }

    try {
      await mqttManager.connect(brokerUrl, options)
      setConexaoStatus('Conexão bem-sucedida!')
      mqttManager.disconnect()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setConexaoStatus(`Erro na conexão: ${errorMessage}`)
    }
  }

  if (!isOpen) return <></>

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg animate-fade-in">
        <div className="flex justify-between items-center border-b border-sky-400 pb-2 mb-4">
          <h2 className="text-lg font-bold text-sky-600">
            {device ? 'Editar Dispositivo' : 'Novo Dispositivo'}
          </h2>
          <button onClick={onClose} className="text-sky-600 hover:text-sky-800 transition-colors">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" value={device?.id || ''} />
          {/* Restante dos campos */}
          <div>
            <label className="block text-sm font-medium text-sky-700">Nome do Dispositivo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-sky-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-sky-700">IMEI</label>
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value)}
              required
              className="w-full border border-sky-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-sky-700">Endereço do Broker</label>
              <input
                type="text"
                value={brokerAddress}
                onChange={(e) => setBrokerAddress(e.target.value)}
                required
                className="w-full border border-sky-300 rounded-md px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sky-700">Porta</label>
              <input
                type="text"
                value={brokerPort}
                onChange={(e) => setBrokerPort(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full border border-sky-300 rounded-md px-2 py-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-sky-700">Usuário</label>
              <input
                type="text"
                value={brokerUser}
                onChange={(e) => setBrokerUser(e.target.value)}
                className="w-full border border-sky-300 rounded-md px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sky-700">Senha</label>
              <input
                type="password"
                value={brokerPassword}
                onChange={(e) => setBrokerPassword(e.target.value)}
                className="w-full border border-sky-300 rounded-md px-2 py-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-sky-700">Tópico</label>
            <input
              type="text"
              value={imei}
              onChange={(e) => setBrokerTopic(e.target.value)}
              className="w-full border border-sky-300 rounded-md px-2 py-1 bg-zinc-300 cursor-not-allowed"
              disabled
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={testarConexaoBroker}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Testar Conexão
            </button>
            {conexaoStatus && <span className="text-sm ml-2">{conexaoStatus}</span>}
          </div>

          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-md shadow-sm"
            >
              {device ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
