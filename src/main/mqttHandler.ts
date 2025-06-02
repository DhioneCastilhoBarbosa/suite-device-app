import { ipcMain, BrowserWindow } from 'electron'
import mqtt from 'mqtt'
import fs from 'fs'
let mqttClient: mqtt.MqttClient | null = null
let rendererReady = false // Flag para indicar que o renderer está pronto
let pendingMessages: { topic: string; message: string }[] = [] // Array para armazenar mensagens pendentes

export function setupMQTTHandlers(mainWindow: BrowserWindow): void {
  // Conectar ao broker MQTT
  ipcMain.handle('mqtt-connect', async (event, { brokerUrl, options }) => {
    return new Promise<void>((resolve, reject) => {
      //fs.writeFileSync('C:/Temp/mqtt_debug.log', `MQTT conectado\n`, { flag: 'a' })
      const clientId = options?.clientId || `client_${Math.random().toString(36).substr(2, 9)}`
      mqttClient = mqtt.connect(brokerUrl, { ...options, clientId })

      mqttClient.on('connect', () => {
        console.log('✅ MQTT conectado:', clientId)
        if (mqttClient) {
          mqttClient.subscribe('topico/#', (err) => {
            if (err) console.error('❌ Falha ao subscrever:', err)
            else console.log('📢 Subscrito no tópico topico/#')
          })
        }
        resolve() // Resolve a conexão após sucesso
      })

      mqttClient.on('error', (err) => {
        console.error('Erro MQTT:', err.message)
        reject(err)
      })

      mqttClient.on('message', (topic, message) => {
        /*fs.writeFileSync('C:/Temp/mqtt_debug.log', `Mensagem recebida: ${topic} ${message}\n`, {
          flag: 'a'
        })*/
        const messageStr = message.toString()
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
    if (mqttClient) mqttClient.publish(topic, message, { qos: 1 })
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
