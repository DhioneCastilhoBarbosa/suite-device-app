// src/utils/mqttManagerIPC.ts
const { ipcRenderer } = window.require('electron');

class MqttManagerIPC {
  connect(brokerUrl: string, options: any = {}): Promise<void> {
    return ipcRenderer.invoke('mqtt-connect', brokerUrl, options);
  }

  publish(topic: string, message: string): Promise<void> {
    return ipcRenderer.invoke('mqtt-publish', topic, message);
  }

  subscribe(topic: string, callback: (topic: string, message: string) => void): Promise<void> {
    ipcRenderer.on('mqtt-message', (_, receivedTopic, message) => {
      if (receivedTopic === topic) {
        callback(receivedTopic, message);
      }
    });
    return ipcRenderer.invoke('mqtt-subscribe', topic);
  }

  unsubscribe(topic: string): Promise<void> {
    return ipcRenderer.invoke('mqtt-unsubscribe', topic);
  }

  disconnect(): Promise<void> {
    return ipcRenderer.invoke('mqtt-disconnect');
  }
}

export default MqttManagerIPC;
