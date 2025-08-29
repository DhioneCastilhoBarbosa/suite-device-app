import { ipcMain, BrowserWindow } from 'electron'
import mqtt from 'mqtt'

let mqttClient: mqtt.MqttClient | null = null
let rendererReady = false // Flag para indicar que o renderer está pronto
let pendingMessages: { topic: string; message: string }[] = [] // Array para armazenar mensagens pendentes

export function setupMQTTHandlers(mainWindow: BrowserWindow): void {
  // Conectar ao broker MQTT
  ipcMain.handle('mqtt-connect', async (event, { brokerUrl, options }) => {
    //console.log('🛬 Dados recebidos no main process:', brokerUrl, options)
    return new Promise<void>((resolve, reject) => {
      //fs.writeFileSync('C:/Temp/mqtt_debug.log', `MQTT conectado\n`, { flag: 'a' })
      const clientId = options?.clientId || `client_${Math.random().toString(36).substr(2, 9)}`
      //console.log('🔗 Conectado ao topic:', options?.topic, 'com clientId:', clientId)
      mqttClient = mqtt.connect(brokerUrl, { ...options, clientId, clean: false }) // ✅ mantém a sessão MQTT

      mqttClient.on('connect', () => {
        console.log('✅ MQTT conectado:', clientId)
        if (mqttClient) {
          mqttClient.subscribe(`${options.topic}/rsp`, { qos: 1 }, (err) => {
            if (err) console.error('❌ Falha ao subscrever:', err)
            else console.log(`📢 Subscrito no tópico ${options.topic}`)
          })
        }
        resolve() // Resolve a conexão após sucesso
      })

      mqttClient.on('error', (err) => {
        console.error('Erro MQTT:', err.message)
        reject(err)
      })

      // Armazena a última mensagem por tópico
      const ultimaMensagemPorTopico = new Map<string, string>()

      mqttClient.on('message', (topic, message) => {
        const messageStr = message.toString()
        const ultima = ultimaMensagemPorTopico.get(topic)

        // Se a mensagem for duplicada (igual à última), ignore
        if (ultima === messageStr) {
          console.log(`⚠️ Ignorando mensagem duplicada de ${topic}`)
          return
        }

        // Atualiza o conteúdo da última mensagem recebida para o tópico
        ultimaMensagemPorTopico.set(topic, messageStr)

        console.log(`📨 Mensagem MQTT recebida: ${topic}: ${messageStr}`)

        if (rendererReady && mainWindow && !mainWindow.isDestroyed()) {
          console.log('🔔 Enviando mensagem para renderer')
          mainWindow.webContents.send('mqtt-message', { topic, message: messageStr })
        } else {
          console.log('⏳ Renderer não pronto, armazenando mensagem')
          pendingMessages.push({ topic, message: messageStr })
        }
      })
    })
  })

  // Publicar mensagem
  ipcMain.on('mqtt-publish', (event, { topic, message }) => {
    if (mqttClient)
      mqttClient.publish(topic, message, {
        qos: 1,
        retain: false // ✅ Correto: dentro do objeto de opções
      })
  })

  // Subscrição no tópico
  ipcMain.on('mqtt-subscribe', (event, { topic }) => {
    if (mqttClient) mqttClient.subscribe(topic, { qos: 1 })
  })

  // Cancelar inscrição
  ipcMain.on('mqtt-unsubscribe', (event, { topic }) => {
    if (mqttClient) mqttClient.unsubscribe(topic)
  })

  // Desconectar MQTT
  ipcMain.on('mqtt-disconnect', () => {
    if (mqttClient) {
      mqttClient.end()
      mqttClient = null
      console.log('🔌 MQTT desconectado')
    }
  })

  // Renderer sinalizando que está pronto
  ipcMain.on('renderer-ready', () => {
    console.log('✅ Renderer sinalizou pronto, enviando mensagens pendentes...')
    rendererReady = true
    if (mainWindow && !mainWindow.isDestroyed()) {
      pendingMessages.forEach(({ topic, message }) => {
        mainWindow.webContents.send('mqtt-message', { topic, message })
      })
      pendingMessages = [] // Limpa mensagens pendentes
    } else {
      console.warn('⚠️ mainWindow não está disponível para enviar mensagens pendentes')
    }
  })
}
