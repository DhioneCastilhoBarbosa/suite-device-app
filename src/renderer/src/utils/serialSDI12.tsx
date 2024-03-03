
// Importando a biblioteca serialport
const { SerialPort } = window.require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

// Definindo uma classe para o gerenciamento da porta serial
class SerialManager {
  private port: SerialPort | null = null
  private isOpen: boolean = false


  // Método para abrir a porta serial
  openPort(portName: string, baudRate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isOpen) {
        console.warn('A porta serial já está aberta.')
        resolve()


        return
      }

      this.port = new SerialPort({
        path: portName,
        baudRate: baudRate,
        dataBits: 7,
        parity: 'even',
        stopBits: 1

      })




      this.port.once('open', () => {
        console.log(`Porta serial ${portName} aberta com sucesso.`)
        this.isOpen = true
        resolve()
      })

      this.port.once('error', (err) => {
        console.error(`Erro ao abrir a porta serial: ${err.message}`)
        reject(err)
      })
    })
  }

  // Método para enviar comandos pela porta serial
  sendCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Porta serial não está aberta.'))
        return
      }
      this.port.setMaxListeners(30)
      this.port.set({ brk: true }, (err) => {
        if (err) {
          console.log('Erro ao definir o breakState')
        } else {
          console.log('breakState definido com sucesso')

          setTimeout(() => {
            this.port.set({ brk: false }, (err) => {
              if (err) {
                console.log('Erro ao desligar o breakState')
              } else {
                console.log('breakState desligado com sucesso')

                setTimeout(() => {
                  this.port.write(command, (err) => {
                    if (err) {
                      console.log(`Erro ao enviar comando: ${err}`)
                    } else {
                      console.log('Comando enviado com sucesso')

                      const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
                      this.port.setMaxListeners(30)
                      parser.once('data', (data) => {
                        //console.log('Resposta SDI12:', data)
                        resolve(data)
                      })
                    }
                  })
                }, 8)
              }
            })
          }, 13) // Aguarda 13ms antes de desligar o breakState
        }
      })
    })
  }

  // Método para receber dados da porta serial após o envio de comandos
  receiveData(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Porta serial não está aberta.'))
        return
      }

      this.port.once('data', (data) => {
        const receivedData = data.toString()
        console.log(`Dados recebidos: ${receivedData}`)
        resolve(receivedData)
      })

      this.port.once('error', (err) => {
        console.error(`Erro ao receber dados: ${err.message}`)
        reject(err)
      })
    })
  }

  // Método para fechar a porta serial
  closePort(): void {
    if (this.port && this.isOpen) {
      this.port.close((err) => {
        if (err) {
          console.error(`Erro ao fechar a porta serial: ${err.message}`)
        } else {
          console.log('Porta serial fechada com sucesso.')
          this.isOpen = false
        }
      })
    } else {
      console.warn('A porta serial já está fechada.')
    }
  }
}

export default SerialManager
