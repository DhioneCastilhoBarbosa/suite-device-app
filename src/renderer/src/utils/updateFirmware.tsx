/* eslint-disable @typescript-eslint/explicit-function-return-type */
const { SerialPort } = window.require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
import { WriteModbus, CloseModBus } from '../utils/modbusRTU'
let serialPort
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let parser

async function openSerialPort(portName: string, baudRate: number): Promise<void> {
  return new Promise((resolve, reject) => {
    serialPort = new SerialPort(
      {
        path: portName,
        baudRate: baudRate,
        parity: 'none',
        dataBits: 8,
        stopBits: 1
      },
      (err) => {
        if (err) {
          return reject(`Erro ao abrir a porta serial: ${err.message}`)
        }
        //console.log("Porta serial aberta com sucesso");
        parser = serialPort.pipe(new ReadlineParser({ delimiter: '*' }))
        resolve()
      }
    )
    serialPort.setMaxListeners(100)
  })
}

function closeSerialPort(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (serialPort && serialPort.isOpen) {
      serialPort.close((err) => {
        if (err) {
          return reject(`Erro ao fechar a porta serial: ${err.message}`)
        }
        //console.log("Porta serial fechada com sucesso");
        resolve()
      })
    } else {
      resolve()
    }
  })
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function update(stateInfo, fail) {
  const array = stateInfo

  const line = array[0].toString()
  const linearray = line.split('\n')
  console.log('lineArray:',linearray)

  let Data = ''
  serialPort.on('data', async (data) => {
    console.log('Dados recebidos:', data.toString());
    Data = ''
    Data += data.toString()
    if (data.includes('ERRO NO CRC')) {
      fail()
      return
    }
  })
  const tempoInicial: Date = new Date()
  for (let i = 0; i < linearray.length; i++) {
    const tt = linearray[i]
    console.log(linearray[i])

    if (tt.length > 10) {
      serialPort.write(linearray[i])
      await wait(23) //23 millisegundos
    }

    if ((i + 1) % 16 == 0 && tt.length === linearray[1].length) {
      while (!Data.includes('.')){
        await wait(12) //12
      }
      Data = ''
    }
  }

  const tempoFinal: Date = new Date()
  const diferenca: number = tempoFinal.getTime() - tempoInicial.getTime()
  const diferencaSegundos = diferenca / 1000
  console.log('Processo concluído com sucesso no tempo de:', diferencaSegundos)
}

const aguardarRespostaSerial = async (serialPort, response, timeout): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      serialPort.removeAllListeners('data')
      reject(new Error('Tempo de espera excedido'))
    }, timeout)

    serialPort.on('data', (data) => {
      const receivedData = data.toString()

      if (receivedData.includes(response)) {
        clearTimeout(timer)
        resolve()
      }
    })
  })
}

interface UpdateFirmwareProps {
  file: string
  portName: string
  baudRate: number
  synced: () => void
  finished: () => void
  fail: () => void
}
function timeoutPromise(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
}

async function WriteModbusWithTimeout(address, value, timeout) {
  return Promise.race([WriteModbus(address, value), timeoutPromise(timeout)])
}

async function CloseModBusWithTimeout(timeout) {
  return Promise.race([CloseModBus(), timeoutPromise(timeout)])
}

export async function atualizaFirmware({
  file,
  portName,
  baudRate,
  synced,
  finished,
  fail
}: UpdateFirmwareProps) {
  const stateInfo = [file]
  try {
    await WriteModbusWithTimeout(416, 1, 5000) // 5000 ms = 5 segundos de timeout para WriteModbus
  } catch (error) {
    console.error('WriteModbus failed or timed out:', error)
  }

  try {
    await CloseModBusWithTimeout(5000) // 5000 ms = 5 segundos de timeout para CloseModBus
  } catch (error) {
    console.error('CloseModBus failed or timed out:', error)
  }

  try {
    //await WriteModbus(416,1) // comando reset
    //await CloseModBus()
    await wait(1000)
    await openSerialPort(portName, baudRate)
    await wait(200)
    //console.log("Aguardando resposta 'BL2.0' da porta serial...");
    await aguardarRespostaSerial(serialPort, 'BL2.0', 10000)

    // console.log("Resposta 'BL2.0' recebida. Enviando comando '#'");
    serialPort.write('#')

    //console.log("Aguardando resposta 'Recebendo arquivo...' da porta serial...");
    await aguardarRespostaSerial(serialPort, 'Recebendo arquivo...', 10000)

    synced()
    //console.log("Resposta 'Recebendo arquivo...' recebida. Enviando dados.");

    await wait(3000)
    // Envie os dados aqui
    await update(stateInfo, fail)
    await closeSerialPort()
    finished()
  } catch (error: any) {
    console.error(`Erro durante a atualização de firmware: ${error.message}`)
    fail()
  }
}

//ERRO NO CRC!!!
