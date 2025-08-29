// Importando a biblioteca serialport
const { SerialPort } = window.require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

type SerialInst = InstanceType<typeof SerialPort>

// Definindo uma classe para o gerenciamento da porta serial
class SerialManagerRS232 {
  private port: SerialInst | null = null
  private isOpen = false
  private currentPath: string | null = null

  private sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)) }

  private wireLifecycle() {
    if (!this.port) return
    const onClose = (err?:Error) => {
      this.isOpen = false
      this.currentPath = null
      try { this.port?.removeAllListeners() } catch {}
    }
    const onError = (e:Error) => {
      // marca fechado para impedir usos com handle “morto”
      this.isOpen = false
      this.currentPath = null
    }
    this.port.once('close', onClose)
    this.port.on('error', onError)
  }

  private async hardClose(): Promise<void> {
    const p = this.port
    this.port = null
    this.isOpen = false
    this.currentPath = null
    if (!p) return
    try { p.removeAllListeners() } catch {}
    await new Promise<void>(res => p.flush?.(()=>res()) ?? res())
    await new Promise<void>(res => p.drain?.(()=>res()) ?? res())
    await new Promise<void>(res => p.close?.(()=>res()) ?? res())
  }

  /** fecha qualquer coisa pendurada e reabre do zero */
  public async reopenSafe(portName:string, baudRate:number): Promise<void> {
    await this.hardClose()
    await this.sleep(300) // deixa o driver “assentar”
    await this.openPortRS232(portName, baudRate)
  }


  // Método para abrir a porta serial

    openPortRS232(portName: string, baudRate: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // se já está aberta na mesma porta, ok
        if (this.isOpen && this.currentPath === portName) return resolve()
        // se está aberta em outra porta, fecha agressivo
        if (this.isOpen && this.currentPath && this.currentPath !== portName) {
          await this.hardClose()
          await this.sleep(200)
        }

        this.port = new SerialPort({
          path: portName,
          baudRate,
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
          highWaterMark: 4 * 1024 * 1024,
          autoOpen: false,
          lock: false,
        }) as SerialInst

        this.port.open((err?: Error) => {
          if (err) return reject(err)
          this.isOpen = true
          this.currentPath = portName
          this.wireLifecycle()
          console.log(`Porta serial ${portName} aberta.`)
          resolve()
        })
      } catch (e:any) {
        reject(e)
      }
    })
  }

  /*openPortRS232(portName: string, baudRate: number): Promise<void> {
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
  }*/

  // Método para enviar comandos pela porta serial

    sendCommandPluviIot(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.isOpen) return reject(new Error('Porta serial não está aberta.'))

      try { this.port.removeAllListeners('data') } catch {}
      try { (this.port as any).unpipe?.() } catch {}

      const formatted = `${command}\r`
      const parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
      this.port.setMaxListeners(30)

      parser.once('data', (data: Buffer) => {
        try { parser.removeAllListeners() } catch {}
        resolve(data.toString().trim())
      })
      parser.once('error', (err:Error) => reject(err))

      this.port.write(formatted, (err?:Error) => {
        if (err) return reject(err)
      })
    })
  }

  /*sendCommandPluviIot(command: string): Promise<string> {
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
  }*/

  sendCommandTSatDB(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!this.port || !this.isOpen) {
      return reject(new Error('Porta serial não está aberta.'))
    }

    // Saneamento: nada de listeners/pipes antigos
    try { this.port.removeAllListeners('data') } catch {}
    try { (this.port as any).unpipe?.() } catch {}

    const formatted = `${command}\r\n`

    const onErrorOnce = (err: Error) => {
      cleanup()
      reject(new Error(`Erro na porta: ${err.message}`))
    }
    const onCloseOnce = () => {
      cleanup()
      reject(new Error('Porta foi fechada durante envio.'))
    }
    const cleanup = () => {
      try { this.port?.removeListener('error', onErrorOnce) } catch {}
      try { this.port?.removeListener('close', onCloseOnce) } catch {}
    }

    this.port.once('error', onErrorOnce)
    this.port.once('close', onCloseOnce)

    // Flush antes de escrever
    this.port.flush((flushErr?: Error) => {
      if (flushErr) {
        cleanup()
        return reject(new Error(`Erro no flush: ${flushErr.message}`))
      }

      this.port.write(formatted, (writeErr?: Error) => {
        if (writeErr) {
          cleanup()
          return reject(new Error(`Erro ao enviar comando: ${writeErr.message}`))
        }

        // Garante que tudo saiu do buffer do Node para o driver
        this.port!.drain((drainErr?: Error) => {
          cleanup()
          if (drainErr) {
            return reject(new Error(`Erro no drain: ${drainErr.message}`))
          }
          resolve()
        })
      })
    })
  })
}



  /*sendCommandTSatDB(command: string): Promise<void> {
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
  }*/


  // Método para enviar comandos pela porta serial

  /*sendCommandRS232(command: string): Promise<string> {
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
    }*/

  sendCommandRS232(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!this.port || !this.isOpen) {
      return reject(new Error('Porta serial não está aberta.'))
    }

    // Limpa qualquer resíduo de envio anterior
    try { this.port.removeAllListeners('data') } catch {}
    try { (this.port as any).unpipe?.() } catch {}

    const onErr = (e: Error) => { cleanup(); reject(new Error(`Erro na porta: ${e.message}`)) }
    const onClose = () => { cleanup(); reject(new Error('Porta foi fechada durante o envio.')) }
    const cleanup = () => {
      try { this.port?.removeListener('error', onErr) } catch {}
      try { this.port?.removeListener('close', onClose) } catch {}
      try { parser?.removeAllListeners?.() } catch {}
      // não mantenha pipes ativos
      try { (this.port as any).unpipe?.(parser) } catch {}
    }

    this.port.once('error', onErr)
    this.port.once('close', onClose)

    let parser: any = null

    // Caso 1: comando especial !QUIT% → enviar e resolver sem aguardar resposta
    if (command.startsWith('!QUIT%')) {
      this.port.flush((fe?: Error) => {
        if (fe) { cleanup(); return reject(new Error(`Erro no flush: ${fe.message}`)) }
        this.port!.write(command, (we?: Error) => {
          if (we) { cleanup(); return reject(new Error(`Erro ao enviar: ${we.message}`)) }
          this.port!.drain((de?: Error) => {
            cleanup()
            if (de) return reject(new Error(`Erro no drain: ${de.message}`))
            resolve('OK') // enviado com sucesso, sem esperar resposta
          })
        })
      })
      return
    }

    // Caso 2: comando !A% → esperar um 'B' bruto (sem parser)
    if (command.startsWith('!A%')) {
      const onData = (buf: Buffer) => {
        const chunk = buf.toString().trim()
        if (chunk === 'B' || chunk.includes('B')) {
          this.port?.removeListener('data', onData)
          cleanup()
          return resolve('B')
        }
      }
      this.port.on('data', onData)

      this.port.flush((fe?: Error) => {
        if (fe) { this.port?.removeListener('data', onData); cleanup(); return reject(new Error(`Erro no flush: ${fe.message}`)) }
        this.port!.write(command, (we?: Error) => {
          if (we) { this.port?.removeListener('data', onData); cleanup(); return reject(new Error(`Erro ao enviar: ${we.message}`)) }
          this.port!.drain((de?: Error) => {
            if (de) { this.port?.removeListener('data', onData); cleanup(); return reject(new Error(`Erro no drain: ${de.message}`)) }
            // mantém onData até receber o 'B' ou ocorrer erro/close
          })
        })
      })
      return
    }

    // Caso 3: demais comandos → usar ReadlineParser com delimitador '%'
    parser = this.port.pipe(new (ReadlineParser as any)({ delimiter: '%' }))
    const onParsed = (data: Buffer | string) => {
      const chunk = data.toString().trim()
      cleanup()
      resolve(chunk)
    }
    const onParsedErr = (e: Error) => {
      cleanup()
      reject(new Error(`Erro no parser: ${e.message}`))
    }
    parser.once('data', onParsed)
    parser.once('error', onParsedErr)

    this.port.flush((fe?: Error) => {
      if (fe) { cleanup(); return reject(new Error(`Erro no flush: ${fe.message}`)) }
      this.port!.write(command, (we?: Error) => {
        if (we) { cleanup(); return reject(new Error(`Erro ao enviar: ${we.message}`)) }
        this.port!.drain((de?: Error) => {
          if (de) { cleanup(); return reject(new Error(`Erro no drain: ${de.message}`)) }
          // aguarda resposta no parser→onParsed
        })
      })
    })
  })
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

    async closePortRS232(): Promise<void> {
    await this.hardClose()
    console.log('Porta serial fechada.')
  }

  /*closePortRS232(): void {
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
  }*/
}
export default SerialManagerRS232
