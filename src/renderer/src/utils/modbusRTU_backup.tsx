/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use strict'

//==============================================================
// create an empty modbus client
const ModbusRTU = window.require('modbus-serial')
const client = new ModbusRTU()

let mbsStatus = 'Initializing...' // holds a status of Modbus

// Modbus 'state' constants
const MBS_STATE_INIT = 'State init'
const MBS_STATE_GOOD_READ = 'State good (read)'
const MBS_STATE_FAIL_READ = 'State fail (read)'
const MBS_STATE_GOOD_CONNECT = 'State good (port)'
const MBS_STATE_FAIL_CONNECT = 'State fail (port)'

// eslint-disable-next-line no-unused-vars
let mbsId = 1
let mbsTimeout = 250 // 250
// eslint-disable-next-line no-unused-vars
let mbsState = MBS_STATE_INIT

// Upon SerialPort error
client.on('error', function (error) {
  console.log('SerialPort Error: ', error)
})

export function IdModBus(address) {
  client.setID(address)
}

interface ModBusConectProps {
  SerialName: String
  BaudRate: number
}

let cancelScan = false
const MAX_ADDRESS = 247
const CONCURRENCY = 20 // Número de endereços a escanear em paralelo
let deviceFound = false

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const scanAddress = async (mbsId: number): Promise<number | null> => {
  if (cancelScan || deviceFound) {
    return null
  }
  client.setID(mbsId) // Definir o endereço Modbus que estamos verificando
  console.log(`Verificando endereço ${mbsId}...`)
  try {
    const data = await client.readHoldingRegisters(255, 1)
    if (cancelScan || deviceFound) {
      return null
    }
    console.log(`Dispositivo encontrado no endereço ${mbsId}:`, data.data)
    deviceFound = true

    return mbsId // Dispositivo encontrado;
  } catch (err) {
    //console.error(`Nenhum dispositivo encontrado no endereço ${mbsId}`);
    return null
  }
}

export const scanNextAddress = async (): Promise<boolean> => {
  for (let i = 1; i <= MAX_ADDRESS; i += CONCURRENCY) {
    if (cancelScan || deviceFound) {
      return deviceFound
    }
    const promises: Promise<number | null>[] = []
    for (let j = i; j < i + CONCURRENCY && j <= MAX_ADDRESS; j++) {
      promises.push(scanAddress(j))
      await delay(250) // Atraso de 50ms entre as verificações (ajuste conforme necessário)/250
    }
    const results = await Promise.all(promises)
    const foundAddress = results.find((result) => result !== null)
    if (foundAddress !== undefined) {
      client.setID(foundAddress) // Definir o cliente para o endereço encontrado
      console.log('Varredura parada, dispositivo encontrado.')
      return true // Dispositivo encontrado
    }
  }
  console.log('Varredura completa, nenhum dispositivo encontrado.')
  return false // Varredura completa, nenhum dispositivo encontrado
}

// Para cancelar a varredura
export const cancelScanProcess = () => {
  cancelScan = true
  mbsId = 1
}

export async function connectClient({ SerialName, BaudRate }: ModBusConectProps): Promise<boolean> {
  cancelScan = false // Resetar o sinal de cancelamento
  client.setTimeout(mbsTimeout)

  try {
    await client.connectRTUBuffered(SerialName, {
      baudRate: BaudRate,
      parity: 'One',
      dataBits: 8,
      stopBits: 1
    })
    mbsState = MBS_STATE_GOOD_CONNECT
    mbsStatus = 'Connected, wait for reading...'
    console.log(mbsStatus)

    const deviceFound = await scanNextAddress()
    return deviceFound
  } catch (e) {
    mbsState = MBS_STATE_FAIL_CONNECT
    mbsStatus = (e as Error).message
   console.log('Erro Modbus:', e)
   throw e // <-- isso é essencial para propagar o erro
  }
}

export const cancelConnection = () => {
  cancelScan = true
  mbsId = 1
}

//==============================================================
export function readModbusData(
  address: number,
  register: number,
  Int16: boolean,
  Float32LE: boolean,
  timeout: number
) {
  return new Promise((resolve, reject) => {
    // try to read data
    client.setTimeout(timeout)
    client
      .readHoldingRegisters(address, register)
      .then(function (data) {
        mbsState = MBS_STATE_GOOD_READ
        mbsStatus = 'success'
        //console.log("Buffer:",data.buffer);

        let Data = data.buffer
        let asciiData = ''

        // Convert each byte to ASCII character
        for (let i = 0; i < Data.length; i++) {
          asciiData += String.fromCharCode(Data[i])
        }

        if (Int16 === true) {
          let Int16Data = Data.readInt16BE()
          console.log(Int16Data)
          resolve(Int16Data)
        } else if (Float32LE === true) {
          let floatValue = Data.readFloatBE(0) // Converte o buffer em um float de 32 bits em little-endian
          console.log(floatValue)
          resolve(floatValue)
        } else {
          console.log(asciiData)
          resolve(asciiData)
        }
      })
      .catch(function (e) {
        mbsState = MBS_STATE_FAIL_READ
        mbsStatus = e.message
        // console.log(e);
        reject(e)
      })
  })
}

function floatToRegisters(float) {
  const buffer = Buffer.alloc(4)
  buffer.writeFloatBE(float, 0)
  return [buffer.readUInt16BE(0), buffer.readUInt16BE(2)]
}

export const WriteModbus = async (register, value, type = 'int') => {
  try {
    if (type === 'float') {
      const registers = floatToRegisters(value)
      await client.writeRegisters(register, registers)
      console.log(`Valor float ${value} gravado nos endereços ${register} e ${register + 1}`)
    } else {
      await client.writeRegister(register, value)
      console.log(`Valor inteiro ${value} gravado no endereço ${register}`)
    }
  } catch (error) {
    console.error('Erro ao gravar no Modbus:', error)
  }
}

export function CloseModBus() {
  client.close(function (err) {
    if (err) {
      console.error('Erro ao fechar a conexão:', err)
    } else {
      console.log('Conexão fechada com sucesso.')
      mbsId = 1
      cancelScan = false
      deviceFound = false
    }
  })
}
/* eslint-enable no-unused-vars */
//==============================================================
