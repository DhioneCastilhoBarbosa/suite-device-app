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
        highWaterMark: 4194304, // 4MB
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
  sendCommandPluviIot(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        reject(new Error('Porta serial não está aberta.'))
        return
      }

      const formattedCommand = `${command}\r` // Adiciona <CR> ao final do comando

      this.port.write(formattedCommand, (err) => {
        if (err) {
          console.log(`Erro ao enviar comando: ${err.message}`)
          reject(err)
          return
        }

        //console.log(`Comando enviado: ${formattedCommand}`)

        const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
        this.port.setMaxListeners(30)

        parser.once('data', (data) => {
          resolve(data.toString().trim())
        })
      })
    })
  }


    sendCommandTSatDB(command: string): Promise<void> {
      return new Promise((resolve, reject) => {
          if (!this.port) {
              return reject(new Error('Porta serial não está aberta.'));
          }

          // Adiciona os sufixos \r\n ao comando
          const formattedCommand = `${command}\r\n`;

          // Envia o comando pela porta serial
          this.port.write(formattedCommand, (err) => {
              if (err) {
                  return reject(new Error(`Erro ao enviar comando: ${err.message}`));
              }
              resolve();
          });
      });
  }
  // Método para enviar comandos pela porta serial

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

  receiveDataTSatDB(): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!this.port) {
            reject(new Error('Porta serial não está aberta.'));
            return;
        }

        let response = '';
        const timeoutDuration = 500; // Tempo de espera para finalizar a captura
        let timeout: NodeJS.Timeout;

        const onData = (data: Buffer) => {
            response += data.toString();

            // Reinicia o timeout sempre que novos dados chegam
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.port.removeListener('data', onData);
                this.port.removeListener('error', onError);
                resolve(response.trim());
            }, timeoutDuration);
        };

        const onError = (err: Error) => {
            clearTimeout(timeout);
            this.port.removeListener('data', onData);
            this.port.removeListener('error', onError);
            reject(err);
        };

        this.port.on('data', onData);
        this.port.once('error', onError);
    });
}



receiveDataPluvi(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!this.port) {
      reject(new Error('Porta serial não está aberta.'));
      return;
    }

    let response = '';
    const timeoutDuration = 200; // Aumentado para 2s
    let timeout: NodeJS.Timeout;

    const onData = (data: Buffer) => {
      response += data.toString();
      //console.log(`Recebendo dados Data: ${response.length} bytes`);

      // Reinicia o timeout sempre que novos dados chegam
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log(`Recebimento finalizado, total: ${response.length} bytes`);
        this.port?.removeListener('data', onData);
        this.port?.removeListener('error', onError);
        resolve(response.trim());
      }, timeoutDuration);
    };

    const onError = (err: Error) => {
      clearTimeout(timeout);
      this.port?.removeListener('data', onData);
      this.port?.removeListener('error', onError);
      reject(err);
    };

    this.port.on('data', onData);
    this.port.once('error', onError);
  });
}


receiveReportPluvi(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!this.port) {
      reject(new Error('Porta serial não está aberta.'));
      return;
    }

    let response = '';
    const timeoutDuration = 2000; // Aumentado para 2s
    let timeout: NodeJS.Timeout;

    const onData = (data: Buffer) => {
      response += data.toString();
      //console.log(`Recebendo dados report: ${response.length} bytes`);

      // Reinicia o timeout sempre que novos dados chegam
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log(`Recebimento finalizado, total: ${response.length} bytes`);
        this.port?.removeListener('data', onData);
        this.port?.removeListener('error', onError);
        resolve(response.trim());
      }, timeoutDuration);
    };

    const onError = (err: Error) => {
      clearTimeout(timeout);
      this.port?.removeListener('data', onData);
      this.port?.removeListener('error', onError);
      reject(err);
    };

    this.port.on('data', onData);
    this.port.once('error', onError);
  });
}


/*
  receiveDataPluvi(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!this.port) {
      reject(new Error('Porta serial não está aberta.'))
      return
    }

    this.port.once('data', (data) => {
      const receivedData = data.toString().trim() // Remove CR e LF
      console.log(`Dados recebidos: ${receivedData}`)
      resolve(receivedData) // Retorna a string recebida
    })

    this.port.once('error', (err) => {
      console.error(`Erro ao receber dados: ${err.message}`)
      reject(err)
    })
  })
}
*/

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
