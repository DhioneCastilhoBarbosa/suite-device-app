import { Drop, PencilSimple, TrashSimple, Plug, Plugs } from '@phosphor-icons/react'
import ContainerDevice from '../containerDevice/containerDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import AddDeviceModal from './components/addDeviceModalRemote'
import React, { useState, useRef, useEffect } from 'react'
import MqttManager from '../../utils/mqttManager'
import { t } from 'i18next'

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

type TerminalLogEntry = {
  id: number
  text: string
  status: 'normal' | 'pending' | 'warning' | 'responded' | 'highlight' | 'error'
  reqId?: string
}

const normalizeId = (s: string) =>
  s
    .replace(/^\s*["']?/, '')
    .replace(/["']?\s*$/, '')
    .trim()
    .toLowerCase()

const extractReqId = (s: string): string | null => {
  if (!s) return null
  const cleaned = String(s)
  const byPipe = cleaned
    .split('|')
    .map((t) => normalizeId(t))
    .find((t) => t.startsWith('device_'))
  if (byPipe) return byPipe
  const mJson = cleaned.match(/id\s*[:=]\s*"?([^"\s|;,]*device_[^"\s|;,]*)"?/i)
  if (mJson) return normalizeId(mJson[1])
  const mLoose = cleaned.match(/(device_[A-Za-z0-9]+)/i)
  return mLoose ? normalizeId(mLoose[1]) : null
}

// "Recebido de <topic>: <payload>"
const parseSavedReceiveLine = (line: string): { topic: string; payload: string } | null => {
  //const m = String(line).match(/Recebido de\s+([^:]+):\s*(.*)$/)
  const received = t('Recebido de')
  const rx = new RegExp(`${received.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+([^:]+):\\s*(.*)$`)
  const m = rx.exec(String(line))
  if (!m) return null
  return { topic: m[1].trim(), payload: m[2].trim() }
}

export default function PluviDBIotRemote(): React.ReactElement {
  const [devices, setDevices] = useState<Device[]>([])
  const [idDevice, setIdDevice] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editDevice, setEditDevice] = useState<Device | null>(null)
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null)

  const [terminalOutput, setTerminalOutput] = useState<TerminalLogEntry[]>([])
  const mqttManagerRef = useRef<MqttManager | null>(null)
  const [command, setCommand] = useState('')
  const terminalEndRef = useRef<HTMLDivElement>(null)
  const { ipcRenderer } = (window as any).require('electron')

  // Dedupe pós-conexão
  const seenPayloadsRef = useRef<Set<string>>(new Set()) // seedado do DB
  const warmupUntilRef = useRef<number>(0) // timestamp ms
  const warmupEchoBudgetRef = useRef<number>(0) // 1 eco UI-only na conexão
  const recentBurstRef = useRef<Map<string, number>>(new Map()) // anti-duplicata instantânea

  const loadDevices = async (): Promise<void> => {
    try {
      const devicesFromDb = await ipcRenderer.invoke('get-all-devices')
      setDevices(devicesFromDb)
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error)
    }
  }

  useEffect(() => {
    ipcRenderer.send('renderer-ready')

    const handleMQTTMessage = async (
      _event: any,
      { topic, message }: { topic: string; message: string }
    ) => {
      if (!connectedDevice) return
      if (!topic.includes(`${connectedDevice.imei}/rsp`)) return

      const respId = extractReqId(message)
      const nowEpoch = Date.now()
      const isWarmup = nowEpoch < warmupUntilRef.current

      const payloadStr = String(message).trim()
      const payloadKey = `${topic}|${payloadStr}`

      const timestamp = new Date().toLocaleString('pt-BR')
      //const responseText = `${timestamp} -> Recebido de ${topic}: ${message}`
      const responseText = `${timestamp} -> ${t('Recebido de {{topic}}: {{message}}', { topic, message })}`

      const errorKeywords = ['error', 'denied', 'unlogged']
      const isError = errorKeywords.some((k) => payloadStr.toLowerCase().includes(k))

      // Anti-duplicata instantânea
      const last = recentBurstRef.current.get(payloadKey)
      if (last && nowEpoch - last < 250) return
      recentBurstRef.current.set(payloadKey, nowEpoch)

      setTerminalOutput((prev) => {
        let matched = false

        // Promove pending/warning -> responded
        const promoted = prev.map((entry) => {
          const isSameReq = respId && entry.reqId && normalizeId(entry.reqId) === respId
          if (isSameReq && (entry.status === 'pending' || entry.status === 'warning')) {
            matched = true
            return {
              ...entry,
              text: entry.text
                .replace(` ${t('(pendente de resposta)')}`, '')
                .replace(` ${t('(sem resposta a mais de 5min)')}`, ''),
              status: 'responded' as TerminalLogEntry['status']
            }
          }
          return entry
        })

        // Se casou reqId: sempre mostra e persiste
        if (matched) {
          ipcRenderer.invoke('insertTerminalLog', {
            deviceId: connectedDevice.id,
            message: responseText
          })
          return [
            ...promoted,
            {
              id: Date.now(),
              text: responseText,
              status: (isError ? 'error' : 'normal') as TerminalLogEntry['status']
            }
          ]
        }

        // Warmup: se já existe no DB, só 1 eco visual e sem persistir
        if (isWarmup && seenPayloadsRef.current.has(payloadKey)) {
          if (warmupEchoBudgetRef.current > 0) {
            warmupEchoBudgetRef.current -= 1
            return [
              ...promoted,
              {
                id: Date.now(),
                text: responseText,
                status: (isError ? 'error' : 'normal') as TerminalLogEntry['status']
              }
            ]
          }
          return promoted
        }

        // Fora do warmup ou conteúdo novo
        seenPayloadsRef.current.add(payloadKey)
        ipcRenderer.invoke('insertTerminalLog', {
          deviceId: connectedDevice.id,
          message: responseText
        })
        return [
          ...promoted,
          { id: Date.now(), text: responseText, status: isError ? 'error' : 'normal' }
        ]
      })
    }

    ipcRenderer.on('mqtt-message', handleMQTTMessage)
    return () => ipcRenderer.removeListener('mqtt-message', handleMQTTMessage)
  }, [connectedDevice])

  useEffect(() => {
    loadDevices()
  }, [])

  const handleDeleteDevice = async (id: number): Promise<void> => {
    try {
      const result = await ipcRenderer.invoke('delete-device', id)
      if (result.success) {
        setTerminalOutput((prev) => [
          ...prev,
          { id: Date.now(), text: t('Dispositivo removido!'), status: 'normal' }
        ])
        await loadDevices()
      } else {
        console.error('Erro ao deletar:', result.error)
      }
    } catch (error) {
      console.error('Erro ao deletar dispositivo:', error)
    }
  }

  const handleConnectToggle = async (device: Device) => {
    if (connectedDevice?.name === device.name) {
      mqttManagerRef.current?.unsubscribe(`${device.brokerTopic}/#`)
      mqttManagerRef.current?.disconnect()
      mqttManagerRef.current = null
      setConnectedDevice(null)
      setTerminalOutput([])
      seenPayloadsRef.current = new Set()
      warmupUntilRef.current = 0
      warmupEchoBudgetRef.current = 0
      recentBurstRef.current = new Map()
      return
    }

    try {
      const manager = new MqttManager()
      const brokerUrl = `mqtt://${device.brokerAddress}:${device.brokerPort}`
      const options = {
        username: device.brokerUser || undefined,
        password: device.brokerPassword || undefined,
        connectTimeout: 4000,
        clientId: idDevice,
        topic: device.imei
      }
      await manager.connect(brokerUrl, options)
      mqttManagerRef.current = manager
      setConnectedDevice(device)

      // 1) Carrega logs do DB
      const logs = await ipcRenderer.invoke('get-terminal-logs', device.id)
      if (!Array.isArray(logs)) {
        console.warn('get-terminal-logs não retornou um array:', logs)
        return
      }

      const errorKeywords = ['error', 'denied', 'unlogged']

      // 2) Seed dedupe com respostas já salvas no DB (topic|payload) — usado no warmup
      seenPayloadsRef.current = new Set()
      for (const l of logs) {
        const line = String(l.message).trim()
        const parsed = parseSavedReceiveLine(line)
        if (parsed) {
          seenPayloadsRef.current.add(`${parsed.topic}|${parsed.payload}`)
        }
      }
      recentBurstRef.current = new Map()

      // 3) IDs já respondidos no histórico
      const receivedIds = new Set<string>()
      for (const l of logs) {
        const lineText = String(l.message).trim()
        if (lineText.includes(t('Recebido de')) || lineText.includes('Recebido de')) {
          const id = extractReqId(lineText)
          if (id) receivedIds.add(id)
        }
      }

      // 4) Reconstrói histórico com DEDUPE POR LINHA (timestamp incluso)
      const dbSeenReceiveLines = new Set<string>()
      const dbSeenPublishLines = new Set<string>()
      const logEntries: TerminalLogEntry[] = []

      for (const l of logs) {
        const currentText = String(l.message).trim()
        const isPublicado =
          currentText.includes(t('Publicado no tópico {{topic}}', { topic: '' }).split('{{')[0]) ||
          currentText.includes('Publicado no tópico')
        const isRecebido =
          currentText.includes(t('Recebido de')) || currentText.includes('Recebido de')

        if (isPublicado) {
          if (dbSeenPublishLines.has(currentText)) continue
          dbSeenPublishLines.add(currentText)

          const idPublicado = extractReqId(currentText)
          const status: TerminalLogEntry['status'] =
            idPublicado && receivedIds.has(idPublicado) ? 'responded' : 'warning'
          logEntries.push({
            id: Date.now() + Math.random(),
            text: currentText,
            status,
            reqId: idPublicado || undefined
          })
        } else if (isRecebido) {
          if (dbSeenReceiveLines.has(currentText)) continue
          dbSeenReceiveLines.add(currentText)

          const isError = errorKeywords.some((k) => currentText.toLowerCase().includes(k))
          logEntries.push({
            id: Date.now() + Math.random(),
            text: currentText,
            status: isError ? 'error' : 'highlight'
          })
        } else {
          // Outras linhas
          logEntries.push({
            id: Date.now() + Math.random(),
            text: currentText,
            status: 'highlight'
          })
        }
      }

      setTerminalOutput([
        {
          id: Date.now(),
          text: t('Conectado a {{name}}', { name: device.name }),
          status: 'normal'
        },
        { id: Date.now(), text: t('📜 Início do Histórico'), status: 'highlight' },
        ...logEntries,
        { id: Date.now(), text: t('📜 Fim do Histórico'), status: 'highlight' }
      ])

      // 5) Assina e abre janela de aquecimento (1 eco visual permitido)
      manager.subscribe(`${device.brokerTopic}/#`)
      warmupUntilRef.current = Date.now() + 1500
      warmupEchoBudgetRef.current = 1
    } catch (error: any) {
      setTerminalOutput([
        {
          id: Date.now(),
          text: t('Erro na conexão: {{msg}}', { msg: error?.message ?? String(error) }),
          status: 'warning'
        }
      ])
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
      const ID = normalizeId(`${idDevice}${timestamp}`)

      const fullTopic = `${connectedDevice.imei}/cmd`
      const initialText = `${timestampFormatted}  ->${t('Publicado no tópico {{topic}}', { topic: fullTopic })}: ${ID}|${command}`

      const commandWithId = `${ID}|${command}`

      mqttManagerRef.current.publish(fullTopic, commandWithId)
      await ipcRenderer.invoke('insertTerminalLog', {
        deviceId: connectedDevice.id,
        message: initialText
      })

      setTerminalOutput((prev) => [
        ...prev,
        { id, text: initialText, status: 'pending', reqId: ID }
      ])
      setCommand('')

      // Marca "pendente" em 10s
      setTimeout(() => {
        setTerminalOutput((prev) =>
          prev.map((msg) =>
            msg.id === id && msg.status === 'pending'
              ? { ...msg, text: `${msg.text} ${t('(pendente de resposta)')}`, status: 'pending' }
              : msg
          )
        )
      }, 10000)

      // Escala para WARNING em 5 min
      setTimeout(
        () => {
          setTerminalOutput((prev) =>
            prev.map((msg) =>
              msg.id === id && msg.status === 'pending'
                ? {
                    ...msg,
                    status: 'warning',
                    text: `${msg.text.replace(` ${t('(pendente de resposta)')}`, '')} ${t('(sem resposta a mais de 5min)')}`
                  }
                : msg
            )
          )
        },
        5 * 60 * 1000
      )
    }
  }

  const handleClearLogs = async (): Promise<void> => {
    if (connectedDevice) {
      const result = await ipcRenderer.invoke('clear-terminal-logs', connectedDevice.id)
      if (result.success) {
        setTerminalOutput([{ id: Date.now(), text: t('Histórico apagado!'), status: 'normal' }])

        seenPayloadsRef.current = new Set()
        warmupUntilRef.current = 0
        warmupEchoBudgetRef.current = 0
        recentBurstRef.current = new Map()
      } else {
        console.error('Erro ao limpar logs:', result.error)
      }
    }
  }

  const handleSaveLogs = async (): Promise<void> => {
    if (!connectedDevice) {
      alert(t('Nenhum dispositivo conectado para salvar o histórico.'))
      return
    }

    const imei = connectedDevice.imei
    const header = t('Relatório de logs do Pluvi-IoT-{{imei}}', { imei }) + '\n\n'
    const logs = terminalOutput.map((entry) => entry.text).join('\n')
    const content = header + logs

    try {
      const result = await ipcRenderer.invoke('save-logs-file', {
        fileName: t('Pluvio-IoT-{{imei}}.txt', { imei }),
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
            <button>{t('Dispositivos Remotos')}</button>
          </div>
        </header>

        <div className="flex h-[500px] mr-8 ml-8 mt-4 rounded-lg overflow-hidden">
          <div className="w-1/4 bg-sky-50 p-4 rounded-l-lg flex flex-col">
            <h3 className="font-bold text-sky-700 mb-3 text-base">{t('Dispositivos')}</h3>
            <ul className="flex-1 overflow-auto space-y-2">
              {devices.map((device, index) => {
                const isConnected = connectedDevice?.name === device.name
                const isAnotherConnectedOrConnected = connectedDevice
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
                        disabled={!!isAnotherConnectedOrConnected}
                        className={`text-yellow-500 hover:text-yellow-600 ${isAnotherConnectedOrConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={t('Editar')}
                      >
                        <PencilSimple size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        disabled={!!isAnotherConnectedOrConnected}
                        className={`text-red-500 hover:text-red-600 ${isAnotherConnectedOrConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={t('Deletar')}
                      >
                        <TrashSimple size={20} />
                      </button>
                      <button
                        onClick={() => handleConnectToggle(device)}
                        disabled={!!(isAnotherConnectedOrConnected && !isConnected)}
                        className={`${isConnected ? 'text-green-600 hover:text-green-700' : 'text-green-500 hover:text-green-600'} ${isAnotherConnectedOrConnected && !isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={isConnected ? t('Desconectar') : t('Conectar')}
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
              {t('+ Adicionar')}
            </button>
          </div>

          <div className="flex-1 bg-sky-100 p-4 rounded-r-lg flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sky-700 font-semibold">
                {t('Terminal')} {connectedDevice ? `- ${connectedDevice.name}` : ''}
              </h3>
              {connectedDevice && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearLogs}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {t('Limpar Histórico')}
                  </button>
                  <button
                    onClick={handleSaveLogs}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {t('Salvar Histórico')}
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white border border-sky-200 rounded p-3 overflow-auto text-sky-800 shadow-inner">
              {terminalOutput.length > 0 ? (
                terminalOutput.map((msg, index) => (
                  <p
                    key={`${msg.id}-${index}`}
                    className={`px-2 py-1 rounded mb-1 ${
                      msg.status === 'responded'
                        ? 'bg-green-200'
                        : msg.status === 'warning'
                          ? 'bg-red-500 text-white'
                          : msg.status === 'pending'
                            ? 'bg-yellow-200'
                            : msg.status === 'highlight'
                              ? 'bg-gray-200'
                              : msg.status === 'error'
                                ? 'bg-red-800 text-white'
                                : 'bg-white'
                    }`}
                  >
                    &gt; {msg.text}
                  </p>
                ))
              ) : (
                <p className="text-gray-400">
                  {t('Conecte a um dispositivo para usar o terminal')}
                </p>
              )}
              <div ref={terminalEndRef} />
            </div>

            <div className="flex mt-3">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={t('Digite o comando...')}
                disabled={!connectedDevice}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSendCommand()
                  }
                }}
                className={`flex-1 px-4 py-2 rounded-l-lg outline-none border ${connectedDevice ? 'bg-white border-sky-300 focus:ring-2 focus:ring-sky-400' : 'bg-gray-200 border-gray-300 cursor-not-allowed'} transition`}
              />
              <button
                onClick={handleSendCommand}
                disabled={!connectedDevice}
                className={`${connectedDevice ? 'bg-sky-500 hover:bg-sky-600' : 'bg-gray-400 cursor-not-allowed'} text-white px-4 py-2 rounded-r-lg shadow-md transition`}
              >
                {t('Enviar')}
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
