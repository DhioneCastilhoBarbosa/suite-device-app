import sqlite3 from 'sqlite3'
sqlite3.verbose()

const db = new sqlite3.Database('./suite-device.db')

// Tabela de dispositivos (já existente)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      imei TEXT,
      brokerAddress TEXT,
      brokerPort TEXT,
      brokerUser TEXT,
      brokerPassword TEXT,
      brokerTopic TEXT
    )
  `)
})

// 🔥 Nova tabela terminal_logs
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS terminal_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER,
      message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

// Função para inserir dispositivo (já existente)
export function insertDevice(device: {
  name: string
  imei: string
  brokerAddress: string
  brokerPort: string
  brokerUser: string
  brokerPassword: string
  brokerTopic: string
}): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO devices (name, imei, brokerAddress, brokerPort, brokerUser, brokerPassword, brokerTopic)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        device.name,
        device.imei,
        device.brokerAddress,
        device.brokerPort,
        device.brokerUser,
        device.brokerPassword,
        device.brokerTopic
      ],
      function (err) {
        if (err) {
          console.error('Erro ao inserir dispositivo:', err)
          reject(err)
        } else {
          console.log('Dispositivo inserido com ID:', this.lastID)
          resolve()
        }
      }
    )
  })
}

// Função para buscar todos os dispositivos (já existente)
export type Device = {
  id: number
  name: string
  imei: string
  brokerAddress: string
  brokerPort: string
  brokerUser: string
  brokerPassword: string
  brokerTopic: string
}

export function getAllDevices(): Promise<Device[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM devices', [], (err, rows) => {
      if (err) {
        console.error('Erro ao buscar dispositivos:', err)
        reject(err)
      } else {
        resolve(rows as Device[])
      }
    })
  })
}

// 🔥 Função para deletar dispositivo (já existente)
export function deleteDevice(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM devices WHERE id = ?', [id], function (err) {
      if (err) {
        console.error('Erro ao deletar dispositivo:', err)
        reject(err)
      } else if (this.changes === 0) {
        reject(new Error(`Nenhum dispositivo encontrado com ID ${id}`))
      } else {
        console.log(`Dispositivo com ID ${id} deletado`)
        resolve()
      }
    })
  })
}

// 🔥 Função para atualizar dispositivo (já existente)
export function updateDevice(device: Device): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE devices
       SET name = ?, imei = ?, brokerAddress = ?, brokerPort = ?, brokerUser = ?, brokerPassword = ?, brokerTopic = ?
       WHERE id = ?`,
      [
        device.name,
        device.imei,
        device.brokerAddress,
        device.brokerPort,
        device.brokerUser,
        device.brokerPassword,
        device.brokerTopic,
        device.id
      ],
      function (err) {
        if (err) {
          console.error('Erro ao atualizar dispositivo:', err)
          reject(err)
        } else if (this.changes === 0) {
          reject(new Error(`Nenhum dispositivo encontrado com ID ${device.id}`))
        } else {
          console.log(`Dispositivo com ID ${device.id} atualizado`)
          resolve()
        }
      }
    )
  })
}

// 🔥 Nova: Função para inserir log do terminal
export function insertTerminalLog(deviceId: number, message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO terminal_logs (device_id, message) VALUES (?, ?)`,
      [deviceId, message],
      function (err) {
        if (err) {
          console.error('Erro ao salvar terminal log:', err)
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

// 🔥 Nova: Função para buscar logs por dispositivo
export function getTerminalLogsByDevice(
  deviceId: number
): Promise<{ id: number; message: string; timestamp: string }[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, message, timestamp FROM terminal_logs WHERE device_id = ? ORDER BY timestamp ASC`,
      [deviceId],
      (err, rows) => {
        if (err) {
          console.error('Erro ao buscar logs do terminal:', err)
          reject(err)
        } else {
          resolve(rows as { id: number; message: string; timestamp: string }[])
        }
      }
    )
  })
}

// 🔥 Função para deletar todos os logs por device_id
export function deleteTerminalLogsByDevice(deviceId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM terminal_logs WHERE device_id = ?', [deviceId], function (err) {
      if (err) {
        console.error('Erro ao deletar logs do dispositivo:', err)
        reject(err)
      } else {
        console.log(`Logs do dispositivo ${deviceId} deletados`)
        resolve()
      }
    })
  })
}
