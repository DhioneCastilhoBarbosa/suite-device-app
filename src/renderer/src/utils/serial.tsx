// Importando a biblioteca serialport
const { SerialPort } = window.require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

type SerialInst = InstanceType<typeof SerialPort>

/** FlushFileBuffers no Windows (ERROR_INVALID_FUNCTION = 1) em CH340, CDC e afins. */
function isRecoverableFlushDrainError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  if (/FlushFileBuffers/i.test(msg)) return true
  if (/PurgeComm/i.test(msg)) return true
  if (/Draining connection/i.test(msg) && /Unknown error code 1/i.test(msg)) return true
  if (/Flushing connection/i.test(msg) && /Unknown error code 1/i.test(msg)) return true
  if (/Unknown error code 1/i.test(msg) && /(drain|flush)/i.test(msg)) return true
  return false
}

export type Rs232PortOptions = {
  dataBits?: 5 | 6 | 7 | 8
  parity?: 'none' | 'even' | 'odd' | 'mark' | 'space'
  stopBits?: 1 | 2
  rtscts?: boolean
  xon?: boolean
  xoff?: boolean
}

// Definindo uma classe para o gerenciamento da porta serial
class SerialManagerRS232 {
  private port: SerialInst | null = null
  private isOpen = false
  private currentPath: string | null = null

  private sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)) }

  // Captura contínua do TSatDB. Em conversores USB-serial lentos a resposta chega em
  // rajadas espaçadas, então o listener fica permanente: bytes que chegam entre o fim de
  // uma leitura e o início da próxima ficam no buffer em vez de serem descartados.
  private tsatBuffer = ''
  private tsatLastByteAt = 0
  private tsatCapture: ((data: Buffer) => void) | null = null
  private tsatReadGeneration = 0
  // CH340, CDC e clones Prolific devolvem ERROR_INVALID_FUNCTION em PurgeComm/FlushFileBuffers.
  // Depois da primeira falha, os comandos seguintes não chamam mais essas APIs.
  private usbSerialIoLimited = false

  private attachTSatCapture(): void {
    if (!this.port) return
    const current = this.tsatCapture
    if (current && this.port.listeners('data').includes(current)) return
    const capture = (data: Buffer): void => {
      this.tsatBuffer += data.toString()
      // Teto para dados não solicitados não crescerem sem limite com a aba parada.
      if (this.tsatBuffer.length > 512 * 1024) {
        this.tsatBuffer = this.tsatBuffer.slice(-256 * 1024)
      }
      this.tsatLastByteAt = Date.now()
    }
    this.tsatCapture = capture
    this.port.on('data', capture)
  }

  private wireLifecycle() {
    if (!this.port) return
    const boundPort = this.port
    const onClose = () => {
      // Ignora close de handle antigo após reopenSafe
      if (this.port !== boundPort) return
      this.isOpen = false
      this.currentPath = null
      try {
        boundPort.removeAllListeners()
      } catch {}
    }
    const onError = (err: Error) => {
      if (this.port !== boundPort) return
      // FlushFileBuffers/drain code 1 em USB-serial no Windows — porta continua aberta.
      if (isRecoverableFlushDrainError(err)) {
        console.warn('[serial] erro recuperável de flush/drain ignorado:', err?.message ?? err)
        return
      }
      this.isOpen = false
      this.currentPath = null
    }
    boundPort.once('close', onClose)
    boundPort.on('error', onError)
  }

  private async hardClose(): Promise<void> {
    const p = this.port
    this.port = null
    this.isOpen = false
    this.currentPath = null
    this.tsatBuffer = ''
    this.tsatCapture = null
    this.usbSerialIoLimited = false
    if (!p) return
    try { p.removeAllListeners() } catch {}
    await new Promise<void>(res => p.flush?.(()=>res()) ?? res())
    await new Promise<void>(res => p.drain?.(()=>res()) ?? res())
    await new Promise<void>(res => p.close?.(()=>res()) ?? res())
  }

  /** fecha qualquer coisa pendurada e reabre do zero */
  public async reopenSafe(portName:string, baudRate:number, options?: Rs232PortOptions): Promise<void> {
    await this.hardClose()
    await this.sleep(300) // deixa o driver “assentar”
    await this.openPortRS232(portName, baudRate, options)
  }


  // Método para abrir a porta serial

    openPortRS232(portName: string, baudRate: number, options?: Rs232PortOptions): Promise<void> {
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
          dataBits: options?.dataBits ?? 8,
          parity: options?.parity ?? 'none',
          stopBits: options?.stopBits ?? 1,
          rtscts: options?.rtscts ?? false,
          xon: options?.xon ?? false,
          xoff: options?.xoff ?? false,
          highWaterMark: 4 * 1024 * 1024,
          autoOpen: false,
          lock: false,
        }) as SerialInst

        this.port.open((err?: Error) => {
          if (err) return reject(err)
          this.isOpen = true
          this.currentPath = portName
          this.tsatBuffer = ''
          this.tsatCapture = null
          this.usbSerialIoLimited = false
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
    this.attachTSatCapture()

    const formatted = `${command}\r\n`
    let settled = false

    const cleanup = () => {
      try { this.port?.removeListener('error', onErrorOnce) } catch {}
      try { this.port?.removeListener('close', onCloseOnce) } catch {}
    }
    const finishOk = () => {
      if (settled) return
      settled = true
      cleanup()
      resolve()
    }
    const finishErr = (error: Error) => {
      if (settled) return
      settled = true
      cleanup()
      reject(error)
    }
    const onErrorOnce = (err: Error) => {
      if (isRecoverableFlushDrainError(err)) {
        this.usbSerialIoLimited = true
        console.warn('[serial] erro recuperável durante envio TSat:', err.message)
        return
      }
      finishErr(new Error(`Erro na porta: ${err.message}`))
    }
    const onCloseOnce = () => {
      finishErr(new Error('Porta foi fechada durante envio.'))
    }

    const writeCommand = () => {
      if (settled) return
      const port = this.port
      if (!port || !this.isOpen) {
        return finishErr(new Error('Porta serial não está aberta.'))
      }

      // Encerra a leitura anterior e descarta o que sobrou dela. A resposta deste
      // comando ainda não começou a chegar.
      this.tsatReadGeneration += 1
      this.tsatBuffer = ''

      port.write(formatted, (writeErr?: Error | null) => {
        if (writeErr) {
          return finishErr(new Error(`Erro ao enviar comando: ${writeErr.message}`))
        }
        // O write já entregou os bytes. Em CH340/CDC/Prolific o drain (FlushFileBuffers)
        // falha com o código 1 e, se rejeitar aqui, a busca do transmissor nunca lê a resposta.
        if (this.usbSerialIoLimited) return finishOk()
        port.drain((drainErr?: Error | null) => {
          if (drainErr && isRecoverableFlushDrainError(drainErr)) {
            this.usbSerialIoLimited = true
            console.warn('[serial] drain ignorado no TSat:', drainErr.message)
            return finishOk()
          }
          if (drainErr) return finishErr(new Error(`Erro no drain: ${drainErr.message}`))
          finishOk()
        })
      })
    }

    this.port.once('error', onErrorOnce)
    this.port.once('close', onCloseOnce)

    if (this.usbSerialIoLimited) {
      writeCommand()
      return
    }

    // Flush antes de escrever. Em USB-serial no Windows o PurgeComm pode falhar com a
    // porta ainda utilizável; o comando segue e as próximas escritas pulam o flush.
    this.port.flush((flushErr?: Error | null) => {
      if (flushErr && isRecoverableFlushDrainError(flushErr)) {
        this.usbSerialIoLimited = true
        console.warn(`[serial] flush ignorado antes de "${command}":`, flushErr.message)
      } else if (flushErr) {
        console.warn(`[serial] flush falhou antes de "${command}":`, flushErr.message)
      }
      writeCommand()
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

  /**
   * Lê a resposta do TSatDB a partir do buffer de captura contínua.
   *
   * `silenceMs` só define quando uma resposta de formato desconhecido é considerada
   * terminada, por isso precisa ser folgado: em USB-serial lento um valor curto corta a
   * resposta no meio. Quando o chamador sabe reconhecer a resposta completa, `isComplete`
   * encerra a leitura na hora, sem esperar o silêncio.
   */
  receiveDataTSatDB(options?: {
    silenceMs?: number
    overallTimeoutMs?: number
    isComplete?: (response: string) => boolean
  }): Promise<string> {
    const silenceMs = options?.silenceMs ?? 500
    const overallTimeoutMs = options?.overallTimeoutMs ?? 20000
    const isComplete = options?.isComplete

    return new Promise((resolve, reject) => {
      if (!this.port || !this.isOpen) {
        reject(new Error('Porta serial não está aberta.'))
        return
      }

      this.attachTSatCapture()

      const generation = this.tsatReadGeneration
      const deadline = Date.now() + overallTimeoutMs
      let poll: NodeJS.Timeout | null = null

      const onError = (err: Error): void => {
        if (isRecoverableFlushDrainError(err)) {
          this.usbSerialIoLimited = true
          console.warn('[serial] erro recuperável durante leitura TSat:', err.message)
          return
        }
        finish()
        reject(err)
      }

      const finish = (): void => {
        if (poll) clearInterval(poll)
        try { this.port?.removeListener('error', onError) } catch {}
      }

      const take = (): string => {
        const received = this.tsatBuffer
        this.tsatBuffer = ''
        return received.trim()
      }

      poll = setInterval(() => {
        if (generation !== this.tsatReadGeneration) {
          finish()
          reject(new Error('Leitura substituída por outro comando.'))
          return
        }

        const buffered = this.tsatBuffer

        if (buffered && isComplete?.(buffered)) {
          finish()
          resolve(take())
          return
        }

        if (buffered && Date.now() - this.tsatLastByteAt >= silenceMs) {
          finish()
          resolve(take())
          return
        }

        if (Date.now() >= deadline) {
          finish()
          if (buffered) {
            resolve(take())
            return
          }
          reject(new Error('Tempo limite excedido para resposta do comando.'))
        }
      }, 25)

      this.port.on('error', onError)
    })
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

  prepareRawSerialAccess(): void {
    if (!this.port) return
    try {
      this.port.removeAllListeners('data')
    } catch {}
    try {
      ;(this.port as { unpipe?: () => void }).unpipe?.()
    } catch {}
  }

  /** Limpa buffers e baixa DTR/RTS (evita hold de reset em alguns USB-UART). */
  async prepareMcumgrSession(): Promise<void> {
    this.prepareRawSerialAccess()
    if (!this.port || !this.isOpen) return

    await new Promise<void>((resolve) => {
      this.port!.flush(() => resolve())
    })

    await new Promise<void>((resolve) => {
      try {
        this.port!.set({ dtr: false, rts: false }, () => resolve())
      } catch {
        resolve()
      }
    })

    await this.sleep(250)
  }

  getRawPort(): SerialInst | null {
    return this.port && this.isOpen ? this.port : null
  }

  writeRaw(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.isOpen) {
        return reject(new Error('Porta serial não está aberta.'))
      }
      this.port.write(data, (err?: Error) => {
        if (err) return reject(err)
        // O write já entregou os bytes ao driver. Em alguns USB-serial no Windows,
        // FlushFileBuffers (drain) devolve ERROR_INVALID_FUNCTION (código 1) mesmo
        // com a porta aberta e o comando na fila de transmissão.
        this.port!.drain((drainErr?: Error) => {
          if (drainErr && !isRecoverableFlushDrainError(drainErr)) return reject(drainErr)
          if (drainErr) {
            console.warn('[serial] drain ignorado após writeRaw:', drainErr.message)
          }
          resolve()
        })
      })
    })
  }

  subscribeRawData(listener: (chunk: string) => void): () => void {
    if (!this.port) return () => {}
    const onData = (buf: Buffer) => {
      listener(buf.toString())
    }
    this.port.on('data', onData)
    return () => {
      try {
        this.port?.removeListener('data', onData)
      } catch {}
    }
  }

  isPortOpen(): boolean {
    return this.isOpen && this.port !== null
  }

  getCurrentPath(): string | null {
    return this.currentPath
  }

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
