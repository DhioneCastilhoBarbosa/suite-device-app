import { Drop, PencilSimple, TrashSimple, Plug, Plugs } from '@phosphor-icons/react'
import ContainerDevice from '../containerDevice/containerDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import AddDeviceModal from './components/addDeviceModalRemote'
import React, { useState, useEffect, useRef } from 'react'

interface Device {
  id: number
  name: string
  brokerAddress: string
  brokerPort: number
  brokerUser?: string
  brokerPassword?: string
  brokerTopic: string
  imei: string
}

export default function PluviDBIotRemote(): React.ReactElement {
  const [devices, setDevices] = useState<Device[]>([])
  const [idDevice, setIdDevice] = useState<string>('')
  const [lastSubPath, setLastSubPath] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editDevice, setEditDevice] = useState<Device | null>(null)
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)
  const [terminalOutput, setTerminalOutput] = useState<
    {
      id: number
      text: string
      status: 'normal' | 'pending' | 'warning' | 'responded' | 'highlight' | 'error'
    }[]
  >([])
  const [command, setCommand] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const { ipcRenderer } = window.require('electron')
  const lastSubPathRef = useRef(lastSubPath)
  const connectedDeviceRef = useRef<Device | null>(null)

  const loadDevices = async (): Promise<void> => {
    const devicesFromDb = await ipcRenderer.invoke('get-all-devices')
    setDevices(devicesFromDb)
  }

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [terminalOutput])

  useEffect(() => {
    connectedDeviceRef.current = connectedDevice
  }, [connectedDevice])

  useEffect(() => {
    lastSubPathRef.current = lastSubPath
  }, [lastSubPath])

  useEffect(() => {
    loadDevices()

    let localId = localStorage.getItem('idDevice')
    if (!localId) {
      localId = `device_${Math.random().toString(36).substr(2, 6)}`
      localStorage.setItem('idDevice', localId)
    }
    setIdDevice(localId)

    // 🔥 Registrar listener apenas uma vez
    const handleMessage = (_: unknown, data: { topic: string; message: string }): void => {
      const { topic, message } = data // ✅ Correção: desestruturando o objeto
      const device = connectedDeviceRef.current
      const prefix = lastSubPathRef.current

      console.log(`Mensagem recebida: [${topic}] -> ${message}`)

      if (!device) {
        console.log('Nenhum dispositivo conectado, ignorando mensagem.')
        return
      }

      const topicMatches = topic.includes(`${device.imei}/rsp`)
      const messageMatches = prefix && message.includes(prefix)

      if (topicMatches && messageMatches) {
        const timestamp = new Date().toLocaleString()
        const responseText = `${timestamp} ->Recebido de ${topic}: ${message}`
        const errorKeywords = ['error', 'unknown', 'denied', 'unlogged']
        const isError = errorKeywords.some((kw) => message.toLowerCase().includes(kw))
        const status: 'normal' | 'pending' | 'warning' | 'responded' | 'highlight' | 'error' =
          isError ? 'error' : 'normal'

        ipcRenderer
          .invoke('insertTerminalLog', {
            deviceId: device.id,
            message: responseText
          })
          .catch((err) => console.error('Erro ao registrar log:', err))

        setTerminalOutput((prev) => [
          ...prev.map((msg) =>
            msg.status === 'pending' && msg.text.includes(prefix)
              ? {
                  ...msg,
                  text: msg.text.replace(' (pendente de resposta)', ''),
                  status: 'responded' as const
                }
              : msg
          ),
          { id: Date.now(), text: responseText, status }
        ])
      } else {
        console.log(
          'Mensagem recebida, mas ignorada (não corresponde ao prefixo ou tópico esperado).'
        )
      }
    }

    ipcRenderer.on('mqtt-message', handleMessage)

    return () => {
      ipcRenderer.removeListener('mqtt-message', handleMessage)
    }
  }, []) // 👈 Remove connectedDevice e lastSubPath das dependências

  const handleConnectToggle = async (device: Device): Promise<void> => {
    if (connectedDevice?.name === device.name) {
      // Desconectar
      await ipcRenderer.invoke('mqtt-unsubscribe', `${device.brokerTopic}/#`)
      await ipcRenderer.invoke('mqtt-disconnect')
      setConnectedDevice(null)
      setLastSubPath('')
      setTerminalOutput([])
    } else {
      try {
        const brokerUrl = `mqtt://${device.brokerAddress}:${device.brokerPort}`
        const options = {
          username: device.brokerUser || undefined,
          password: device.brokerPassword || undefined,
          clientId: idDevice
        }
        await ipcRenderer.invoke('mqtt-connect', brokerUrl, options)
        await ipcRenderer.invoke('mqtt-subscribe', `${device.brokerTopic}/#`)
        setConnectedDevice(device)

        const logs = await ipcRenderer.invoke('get-terminal-logs', device.id)
        if (Array.isArray(logs)) {
          const logEntries = logs.map((log) => ({
            id: Date.now() + Math.random(),
            text: log.message,
            status: 'highlight' as const
          }))
          setTerminalOutput([
            { id: Date.now(), text: `Conectado a ${device.name}`, status: 'normal' },
            { id: Date.now(), text: '📜 Início do Histórico', status: 'highlight' },
            ...logEntries,
            { id: Date.now(), text: '📜 Fim do Histórico', status: 'highlight' }
          ])
        }
      } catch (error) {
        console.error('Erro ao conectar MQTT:', error)
        setTerminalOutput([
          { id: Date.now(), text: `Erro na conexão: ${error}`, status: 'warning' }
        ])
      }
    }
  }

  const handleSendCommand = async (): Promise<void> => {
    if (connectedDevice && command.trim()) {
      const id = Date.now()
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14)
      const now = new Date()
      const timestampFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      const ID = `${idDevice}${timestamp}`
      setLastSubPath(ID)
      const fullTopic = `${connectedDevice.imei}/cmd`
      const initialText = `${timestampFormatted}  ->Publicado no tópico ${fullTopic}: ${ID}|${command}`
      const commandWithId = `${ID}|${command}`

      await ipcRenderer.invoke('mqtt-publish', fullTopic, commandWithId)
      await ipcRenderer.invoke('insertTerminalLog', {
        deviceId: connectedDevice.id,
        message: initialText
      })
      setTerminalOutput((prev) => [...prev, { id, text: initialText, status: 'pending' }])
      setCommand('')

      setTimeout(() => {
        setTerminalOutput((prev) =>
          prev.map((msg) =>
            msg.status === 'pending' && msg.text.includes(ID)
              ? { ...msg, text: `${msg.text} (pendente de resposta)`, status: 'pending' }
              : msg
          )
        )
      }, 15000)
    }
  }

  const handleClearLogs = async (): Promise<void> => {
    if (connectedDevice) {
      const res = await ipcRenderer.invoke('clear-terminal-logs', connectedDevice.id)
      if (res.success)
        setTerminalOutput([{ id: Date.now(), text: 'Histórico apagado!', status: 'normal' }])
    }
  }

  const handleDeleteDevice = async (id: number): Promise<void> => {
    try {
      const result = await ipcRenderer.invoke('delete-device', id)
      if (result.success) {
        setTerminalOutput((prev) => [
          ...prev,
          { id: Date.now(), text: 'Dispositivo removido!', status: 'normal' }
        ])
        await loadDevices()
      } else {
        console.error('Erro ao deletar:', result.error)
      }
    } catch (error) {
      console.error('Erro ao deletar dispositivo:', error)
    }
  }
  const handleSaveLogs = async (): Promise<void> => {
    if (!connectedDevice) return alert('Nenhum dispositivo conectado.')
    const imei = connectedDevice.imei
    const header = `Relatório de logs do Pluvi-IoT-${imei}\n\n`
    const logs = terminalOutput.map((e) => e.text).join('\n')
    const res = await ipcRenderer.invoke('save-logs-file', {
      fileName: `Pluvio-Iot-${imei}.txt`,
      content: header + logs
    })
    if (res.success) console.log('Salvo:', res.path)
  }

  return (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'PluviDB-IoT'}>
        <Drop size={30} />
      </HeaderDevice>

      <div className="flex flex-col justify-center bg-white mr-8 ml-8 mt-4 rounded-lg shadow-lg text-zinc-700 text-sm w-full max-w-5xl mb-1 pb-2">
        <header className="flex items-center justify-between mr-8 ml-8 mt-4 border-b-[1px] border-sky-400 min-h-12">
          <div className="flex gap-4 text-sky-600 font-semibold text-lg">
            <button>Dispositivos Remotos</button>
          </div>
        </header>

        <div className="flex h-[500px] mr-8 ml-8 mt-4 rounded-lg overflow-hidden">
          <div className="w-1/4 bg-sky-50 p-4 rounded-l-lg flex flex-col">
            <h3 className="font-bold text-sky-700 mb-3 text-base">Dispositivos</h3>
            <ul className="flex-1 overflow-auto space-y-2">
              {devices.map((device, index) => {
                const isConnected = connectedDevice?.name === device.name
                const isAnotherConnectedOrConnected = connectedDevice // Se algum dispositivo estiver conectado

                return (
                  <li
                    key={index}
                    className="bg-white border border-sky-200 rounded flex items-center justify-between px-3 py-2 shadow-sm hover:shadow-md transition"
                  >
                    <span className="font-medium flex-1">{device.name}</span>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          setEditDevice(device)
                          setIsModalOpen(true)
                        }}
                        disabled={!!isAnotherConnectedOrConnected} // 🔥 Desabilita todos se houver algum conectado
                        className={`text-yellow-500 hover:text-yellow-600 ${isAnotherConnectedOrConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Editar"
                      >
                        <PencilSimple size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        disabled={!!isAnotherConnectedOrConnected} // 🔥 Desabilita todos se houver algum conectado
                        className={`text-red-500 hover:text-red-600 ${isAnotherConnectedOrConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Deletar"
                      >
                        <TrashSimple size={20} />
                      </button>
                      <button
                        onClick={() => handleConnectToggle(device)}
                        disabled={!!(isAnotherConnectedOrConnected && !isConnected)} // 🔥 Só ativa "Desconectar" para o conectado
                        className={`${isConnected ? 'text-green-600 hover:text-green-700' : 'text-green-500 hover:text-green-600'} ${isAnotherConnectedOrConnected && !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isConnected ? 'Desconectar' : 'Conectar'}
                      >
                        {isConnected ? <Plugs size={20} /> : <Plug size={20} />}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <button
              onClick={() => {
                setEditDevice(null)
                setIsModalOpen(true)
              }}
              className="mt-4 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              + Adicionar
            </button>
          </div>

          <div className="flex-1 bg-sky-100 p-4 rounded-r-lg flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sky-700 font-semibold">
                Terminal {connectedDevice ? `- ${connectedDevice.name}` : ''}
              </h3>
              {connectedDevice && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearLogs}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Limpar Histórico
                  </button>

                  <button
                    onClick={handleSaveLogs}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Salvar Histórico
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white border border-sky-200 rounded p-3 overflow-auto text-sky-800 shadow-inner">
              {terminalOutput.length > 0 ? (
                terminalOutput.map((msg, index) => (
                  <p
                    key={`${msg.id}-${index}`}
                    className={`break-words px-2 py-1 rounded mb-1 ${
                      msg.status === 'pending'
                        ? 'bg-yellow-200'
                        : msg.status === 'warning'
                          ? 'bg-yellow-300'
                          : msg.status === 'responded'
                            ? 'bg-green-200'
                            : msg.status === 'highlight'
                              ? 'bg-gray-200' // 🔥 Adiciona o fundo cinza
                              : msg.status === 'error'
                                ? 'bg-red-500 text-white'
                                : 'bg-white'
                    }`}
                  >
                    &gt; {msg.text}
                  </p>
                ))
              ) : (
                <p className="text-gray-400">Conecte a um dispositivo para usar o terminal</p>
              )}
              <div ref={terminalEndRef} /> {/* Referência para rolar até aqui */}
            </div>

            <div className="flex mt-3">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Digite o comando..."
                disabled={!connectedDevice}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault() // Evita comportamento padrão de form
                    handleSendCommand() // Chama a função para enviar
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-l-lg outline-none border ${connectedDevice ? 'bg-white border-sky-300 focus:ring-2 focus:ring-sky-400' : 'bg-gray-200 border-gray-300 cursor-not-allowed'} transition`}
              />
              <button
                onClick={handleSendCommand}
                disabled={!connectedDevice}
                className={`${connectedDevice ? 'bg-sky-500 hover:bg-sky-600' : 'bg-gray-400 cursor-not-allowed'} text-white px-4 py-2 rounded-r-lg shadow-md transition`}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddDeviceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditDevice(null)
          loadDevices()
        }}
        device={
          editDevice
            ? {
                ...editDevice,
                brokerPort: String(editDevice.brokerPort),
                brokerUser: editDevice.brokerUser ?? '',
                brokerPassword: editDevice.brokerPassword ?? ''
              }
            : undefined
        }
      />
    </ContainerDevice>
  )
}
