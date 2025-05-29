import { Drop, PencilSimple, TrashSimple, Plug, Plugs } from '@phosphor-icons/react'
import ContainerDevice from '../containerDevice/containerDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import AddDeviceModal from './components/addDeviceModalRemote'
import React, { useState, useRef, useEffect } from 'react'
import MqttManager from '../../utils/mqttManager'

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
  const [idDevice, setIdDevice] = useState<string>('') // Adicionado para armazenar o ID
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
  const mqttManagerRef = useRef<MqttManager | null>(null)
  const [command, setCommand] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const { ipcRenderer } = window.require('electron')

  const loadDevices = async (): Promise<void> => {
    try {
      const devicesFromDb = await ipcRenderer.invoke('get-all-devices')
      setDevices(devicesFromDb)
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    }
  }

  useEffect(() => {
    loadDevices()
  }, [])

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

  const handleConnectToggle = async (device): Promise<void> => {
    if (connectedDevice?.name === device.name) {
      mqttManagerRef.current?.unsubscribe(`${device.brokerTopic}/#`)
      mqttManagerRef.current?.disconnect()
      mqttManagerRef.current = null
      setConnectedDevice(null)
      setLastSubPath('')
      setTerminalOutput([])

      /*setTimeout(() => {
        setTerminalOutput(() => [
          { id: Date.now(), text: `Desconectado de ${device.name}`, status: 'normal' }
        ])
      }, 200)*/
    } else {
      try {
        const manager = new MqttManager()
        const brokerUrl = `mqtt://${device.brokerAddress}:${device.brokerPort}`
        const options = {
          username: device.brokerUser || undefined,
          password: device.brokerPassword || undefined,
          connectTimeout: 4000
        }
        await manager.connect(brokerUrl, options)

        mqttManagerRef.current = manager
        setConnectedDevice(device)

        // 🔥 Carregar logs anteriores do banco
        const logs = await ipcRenderer.invoke('get-terminal-logs', device.id)
        if (Array.isArray(logs)) {
          const logEntries = logs.map((log) => ({
            id: Date.now() + Math.random(),
            text: log.message,
            status: 'highlight' as const // 🔥 Usando highlight para cinza
          }))

          // 🔥 Limpa terminal antes de carregar histórico
          setTerminalOutput([
            { id: Date.now(), text: `Conectado a ${device.name}`, status: 'normal' },
            { id: Date.now(), text: '📜 Início do Histórico', status: 'highlight' }
          ])

          // 🔥 Adiciona os logs do histórico e o fim depois
          setTerminalOutput((prev) => [
            ...prev,
            ...logEntries,
            { id: Date.now(), text: '📜 Fim do Histórico', status: 'highlight' }
          ])
        } else {
          console.warn('get-terminal-logs não retornou um array:', logs)
        }

        // 🔥 Subscrição com wildcard e verificação do tópico
        manager.subscribe(`${device.brokerTopic}/#`, async (message, topicReceived) => {
          const messageStr = message.toString()
          const prefix = lastSubPath

          // 🔥 Verifica se o tópico contém o nome do device
          const topicMatchesDevice = topicReceived.includes(`${device.imei}/rsp`)
          const messageMatchesPrefix = messageStr.includes(prefix)

          if (topicMatchesDevice && messageMatchesPrefix) {
            const now = new Date()

            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')
            const hours = String(now.getHours()).padStart(2, '0')
            const minutes = String(now.getMinutes()).padStart(2, '0')
            const seconds = String(now.getSeconds()).padStart(2, '0')

            const timestampFormatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
            const responseText = `${timestampFormatted}  ->Recebido de ${topicReceived}: ${messageStr}`
            await ipcRenderer.invoke('insertTerminalLog', {
              deviceId: device.id,
              message: responseText
            })
            const errorKeywords = ['error', 'unknown', 'denied', 'unlogged']
            const isError = errorKeywords.some((keyword) =>
              responseText.toLowerCase().includes(keyword)
            )
            const responseObj = isError
              ? { id: Date.now(), text: responseText, status: 'error' }
              : { id: Date.now(), text: responseText, status: 'normal' }

            setTerminalOutput((prev) => [
              ...prev.map((msg) =>
                msg.status === 'pending'
                  ? {
                      ...msg,
                      text: msg.text.replace(' (pendente de resposta)', ''),
                      status: 'responded' as const
                    }
                  : msg
              ),
              responseObj as {
                id: number
                text: string
                status: 'normal' | 'pending' | 'warning' | 'responded' | 'highlight'
              }
            ])
          } else {
            console.log('Mensagem ignorada: não corresponde ao dispositivo ou prefixo')
          }
        })
      } catch (error) {
        setTerminalOutput([
          {
            id: Date.now(),
            text: `Erro na conexão: ${typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)}`,
            status: 'warning'
          }
        ])
      }
    }
  }

  const handleSendCommand = async (): Promise<void> => {
    if (connectedDevice && mqttManagerRef.current && command.trim()) {
      const id = Date.now()
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, '')
        .slice(0, 14)

      const now = new Date()

      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')

      const timestampFormatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      const ID = `${idDevice}${timestamp}`
      setLastSubPath(ID) // <-- Armazena o subPath
      const fullTopic = `${connectedDevice.imei}/cmd`
      const initialText = `${timestampFormatted}  ->Publicado no tópico ${fullTopic}: ${ID}|${command}`
      const commandWithId = `${ID}|${command}`

      mqttManagerRef.current.publish(fullTopic, commandWithId)
      await ipcRenderer.invoke('insertTerminalLog', {
        deviceId: connectedDevice.id,
        message: initialText
      })
      setTerminalOutput((prev) => [...prev, { id, text: initialText, status: 'pending' }])
      setCommand('')

      setTimeout(() => {
        setTerminalOutput((prev) =>
          prev.map((msg) =>
            msg.id === id && msg.status === 'pending'
              ? { ...msg, text: `${msg.text} (pendente de resposta)`, status: 'pending' }
              : msg
          )
        )
      }, 10000)
    }
  }

  const handleClearLogs = async (): Promise<void> => {
    if (connectedDevice) {
      const result = await ipcRenderer.invoke('clear-terminal-logs', connectedDevice.id)
      if (result.success) {
        setTerminalOutput([{ id: Date.now(), text: 'Histórico apagado!', status: 'normal' }])
      } else {
        console.error('Erro ao limpar logs:', result.error)
      }
    }
  }

  const handleSaveLogs = async (): Promise<void> => {
    if (!connectedDevice) {
      alert('Nenhum dispositivo conectado para salvar o histórico.')
      return
    }

    const imei = connectedDevice.imei
    const header = `Relatório de logs do Pluvi-IoT-${imei}\n\n`
    const logs = terminalOutput.map((entry) => entry.text).join('\n')
    const content = header + logs

    try {
      const result = await ipcRenderer.invoke('save-logs-file', {
        fileName: `Pluvio-Iot-${imei}.txt`,
        content
      })
      if (result.success) {
        console.log('Histórico salvo com sucesso:', result.path)
      } else {
        console.error('Erro ao salvar o arquivo:', result.error)
      }
    } catch (error) {
      console.error('Erro ao salvar histórico:', error)
    }
  }

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [terminalOutput])

  useEffect(() => {
    // Carrega ou cria um idDevice único no localStorage
    let localId = localStorage.getItem('idDevice')
    if (!localId) {
      localId = `device_${Math.random().toString(36).substr(2, 6)}`
      localStorage.setItem('idDevice', localId)
    }
    setIdDevice(localId)

    loadDevices()
  }, [])

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
                terminalOutput.map((msg) => (
                  <p
                    key={msg.id}
                    className={`px-2 py-1 rounded mb-1 ${
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
