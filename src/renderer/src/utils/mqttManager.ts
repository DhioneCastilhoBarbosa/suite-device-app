const { ipcRenderer } = require('electron');

class MqttManager {
  // ✅ Declaração explícita da propriedade privada
  private _listener: ((event: any, data: any) => void) | null = null;

  async connect(brokerUrl: string, options = {}) {
    try {
      await ipcRenderer.invoke('mqtt-connect', { brokerUrl, options });
      console.log('✅ Conectado ao MQTT',options);
    } catch (err) {
      console.error('❌ Erro ao conectar MQTT:', err);
    }
  }

  publish(topic: string, message: string) {
    ipcRenderer.send('mqtt-publish', { topic, message });
  }

  subscribe(topic: string) {
  ipcRenderer.send('mqtt-subscribe', { topic });
}

  unsubscribe(topic: string) {
    ipcRenderer.send('mqtt-unsubscribe', { topic });
    if (this._listener) {
      ipcRenderer.removeListener('mqtt-message', this._listener);
      this._listener = null;
    }
  }

  disconnect() {
    ipcRenderer.send('mqtt-disconnect');
    if (this._listener) {
      ipcRenderer.removeListener('mqtt-message', this._listener);
      this._listener = null;
    }
  }

  isConnected() {
    console.warn('isConnected: Status depende do main process. Retornando falso por padrão.');
    return false;
  }
}

export default MqttManager;
