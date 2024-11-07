// Importando a biblioteca serialport
const { SerialPort } = window.require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

// Definindo uma classe para o gerenciamento da porta serial
class SerialManagerRS232 {
  private port: typeof SerialPort | null = null
  private isOpen: boolean = false

  // Método para abrir a porta serial
  openPortRS232(portName: string, baudRate: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isOpen) {
        console.warn('A porta serial já está aberta.')
        resolve()
        return
      }

      this.port = new SerialPort({
        path: portName,
        baudRate: baudRate,
        dataBits: 8,
        parity: 'none',
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
  /*sendCommandRS232(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Porta serial não está aberta.'))
        return
      }

      this.port.write(command, (err) => {
        if (err) {
          console.log(`Erro ao enviar comando: ${err}`)
          reject(err)
        } else {
          console.log(`Comando ${command} enviado com sucesso`)

          //const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
          this.port.setMaxListeners(30)
          this.port.once('data', (data) => {
            resolve(data)
          })
        }
      })
    })
  }*/
    sendCommandRS232(command: string): Promise<string> {
      return new Promise((resolve, reject) => {
        if (!this.port) {
          return reject(new Error('Porta serial não está aberta.'));
        }

        // Remover listeners de dados anteriores
        this.port.removeAllListeners('data');

        // Se o comando for !A%, usar uma abordagem diferente
        if (command.startsWith('!A%') ){ //|| command.startsWith('!QUIT%')
          this.port.on('data', (data: Buffer) => {
            const chunk = data.toString().trim();

            // Se receber 'B', resolver a promessa
            if (chunk === 'B') {
              //console.log(`Recebido: ${chunk}`);
              resolve(chunk);  // Resolver com a resposta B
              this.port.removeAllListeners('data'); // Remove o listener após a resolução
            }
          });

          this.port.on('error', (err) => {
            console.error(`Erro ao receber dados: ${err.message}`);
            reject(err);
          });

          // Limpando o buffer antes de enviar o comando
          this.port.flush((err) => {
            if (err) {
              console.error(`Erro ao limpar buffer da porta: ${err.message}`);
              return reject(err);
            }

            console.log('Buffer da porta serial limpo com sucesso.');

            // Escrevendo o comando para a porta
            this.port.write(command, (err) => {
              if (err) {
                console.log(`Erro ao enviar comando: ${err}`);
                return reject(err);
              }

              console.log(`Comando ${command} enviado com sucesso`);
            });
          });
        }else if (command.startsWith('!QUIT%')) {
          // Limpando o buffer antes de enviar o comando
          this.port.flush((err) => {
            if (err) {
              console.error(`Erro ao limpar buffer da porta: ${err.message}`);
              return reject(err);
            }

            console.log('Buffer da porta serial limpo com sucesso.');

            // Escrevendo o comando para a porta
            this.port.write(command, (err) => {
              if (err) {
                console.log(`Erro ao enviar comando: ${err}`);
                return reject(err);
              }

              console.log(`Comando ${command} enviado com sucesso`);
              resolve('Comando enviado sem aguardar resposta'); // Resolver sem aguardar resposta
            });
          });
        }
        // Se o comando for nao !A%, usar ReadlineParser com delimitador '%'
        else if (!command.startsWith('!A%')) {
          const parser = this.port.pipe(new ReadlineParser({ delimiter: '%' }));

          parser.on('data', (data: Buffer) => {
            const chunk = data.toString().trim();
            //console.log(`Dados recebidos (POLL): ${chunk}`);
            resolve(chunk);  // Resolve com a resposta
            parser.removeAllListeners('data'); // Remove o listener após a resolução
          });

          parser.on('error', (err) => {
            console.error(`Erro ao receber dados: ${err.message}`);
            reject(err);
          });

          // Limpando o buffer antes de enviar o comando
          this.port.flush((err) => {
            if (err) {
              console.error(`Erro ao limpar buffer da porta: ${err.message}`);
              return reject(err);
            }

            console.log('Buffer da porta serial limpo com sucesso.');

            // Escrevendo o comando para a porta
            this.port.write(command, (err) => {
              if (err) {
                console.log(`Erro ao enviar comando: ${err}`);
                return reject(err);
              }

              console.log(`Comando ${command} enviado com sucesso`);

            });
          });
        }else {
          reject(new Error('Comando desconhecido.'));
        }
      });
    }




  // Método para receber dados da porta serial após o envio de comandos
  receiveDataRs232(): Promise<string> {
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
  closePortRS232(): void {
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

export default SerialManagerRS232
