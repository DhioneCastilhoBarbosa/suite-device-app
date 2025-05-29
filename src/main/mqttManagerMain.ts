import { ipcMain, webContents } from 'electron'
import mqtt, { MqttClient, IClientOptions } from 'mqtt'

let client: MqttClient | null = null
const connectedTopics: Set<string> = new Set()

ipcMain.handle('mqtt-connect', async (_, brokerUrl: string, options: IClientOptions) => {
  return new Promise((resolve, reject) => {
    if (client?.connected) {
      console.log('Já conectado ao broker.')
      resolve('Já conectado')
      return
    }

    const clientId = options?.clientId || `client_${Math.random().toString(36).substr(2, 9)}`
    client = mqtt.connect(brokerUrl, { clientId, clean: false, ...options })

    client.on('connect', () => {
      console.log('MQTT conectado com clientId:', clientId)
      resolve('Conectado')
    })

    client.on('error', (err) => {
      console.error('Erro MQTT:', err.message)
      reject(err.message)
    })

    client.on('message', (topic, message) => {
      const msgString = message.toString()
      console.log(`Mensagem recebida: [${topic}] -> ${msgString}`)
      webContents
        .getAllWebContents()
        .forEach((wc) => wc.send('mqtt-message', { topic, message: msgString }))
    })
  })
})

ipcMain.handle('mqtt-publish', async (_, topic: string, message: string) => {
  if (client) {
    client.publish(topic, message, { qos: 1 })
    console.log(`Publicado no tópico ${topic}: ${message}`)
    return 'Publicado'
  } else {
    console.warn('Tentativa de publicar sem conexão MQTT.')
    return 'Erro: cliente não conectado'
  }
})

ipcMain.handle('mqtt-subscribe', async (_, topic: string) => {
  if (client) {
    if (!connectedTopics.has(topic)) {
      client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`Erro ao subscrever no tópico ${topic}:`, err.message)
        } else {
          connectedTopics.add(topic)
          console.log(`Inscrito no tópico ${topic}`)
        }
      })
    }
    return 'Subscrito'
  } else {
    console.warn('Tentativa de subscrever sem conexão MQTT.')
    return 'Erro: cliente não conectado'
  }
})

ipcMain.handle('mqtt-unsubscribe', async (_, topic: string) => {
  if (client) {
    if (connectedTopics.has(topic)) {
      client.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`Erro ao desinscrever do tópico ${topic}:`, err.message)
        } else {
          connectedTopics.delete(topic)
          console.log(`Desinscrito do tópico ${topic}`)
        }
      })
    }
    return 'Desinscrito'
  } else {
    console.warn('Tentativa de desinscrever sem conexão MQTT.')
    return 'Erro: cliente não conectado'
  }
})

ipcMain.handle('mqtt-disconnect', async () => {
  if (client) {
    client.end(() => {
      console.log('MQTT desconectado.')
    })
    client = null
    connectedTopics.clear()
    return 'Desconectado'
  } else {
    console.warn('Tentativa de desconectar sem cliente MQTT.')
    return 'Erro: cliente não conectado'
  }
})
