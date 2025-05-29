// src/utils/MqttManager.ts
const mqtt = window.require('mqtt') // Ajuste para uso do require do Electron
import type { MqttClient, IClientOptions } from 'mqtt'

class MqttManager {
  private client: MqttClient | null = null

 connect(brokerUrl: string, options: IClientOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const clientId = localStorage.getItem('idDevice') || `client_${Math.random().toString(36).substr(2, 9)}`;

    this.client = mqtt.connect(brokerUrl, {
      clientId,        // 🔥 Cliente com ID único
      clean: false,    // 🔥 Sessão persistente
      ...options
    });

    if (this.client) {
      this.client.on('connect', () => {
        console.log('MQTT conectado com sucesso com clientId:', clientId);
        resolve();
      });

      this.client.on('error', (err) => {
        console.error('Erro na conexão MQTT:', err.message);
        reject(err);
      });
    } else {
      reject(new Error('Falha ao criar o cliente MQTT'));
    }
  });
}

publish(topic: string, message: string): void {
  if (!this.client) {
    throw new Error('Cliente MQTT não está conectado');
  }
  this.client.publish(topic, message, { qos: 1 });  // 🔥 Mantém QoS 1
}

subscribe(topic: string, callback: (message: string, topic: string) => void): void {
  if (!this.client) {
    throw new Error('Cliente MQTT não está conectado');
  }
  this.client.subscribe(topic, { qos: 1 });  // 🔥 Subscrição com QoS 1
  this.client.on('message', (receivedTopic, message) => {
    callback(message.toString(), receivedTopic);
  });
}

unsubscribe(topic: string): void {
  if (!this.client) {
    throw new Error('Cliente MQTT não está conectado')
  }
  this.client.unsubscribe(topic, (err) => {
    if (err) {
      console.error('Erro ao cancelar inscrição:', err)
    } else {
      console.log(`Cancelada a inscrição no tópico: ${topic}`)
    }
  })
}

  disconnect(): void {
    if (this.client) {
      this.client.end()
      console.log('MQTT desconectado')
      this.client = null
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false
  }
}

export default MqttManager
