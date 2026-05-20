import { encode, decode } from 'cbor-x'

const fs = window.require('fs') as typeof import('fs')

const NmpOp = { Read: 0, Write: 2 } as const
const NmpGroup = { Default: 0, Image: 1 } as const
const NmpIdImage = { State: 0, Upload: 1 } as const
const NmpIdDef = { Reset: 5 } as const

type SerialPortLike = {
  isOpen?: boolean
  write: (data: Buffer, cb?: (err?: Error | null) => void) => boolean
  drain: (cb?: (err?: Error | null) => void) => void
  flush: (cb?: (err?: Error | null) => void) => void
  on: (event: 'data', listener: (chunk: Buffer) => void) => void
  removeListener: (event: 'data', listener: (chunk: Buffer) => void) => void
}

function computeXmodemCrc16(buf: Buffer): number {
  const poly = 0x1021
  let crc = 0
  for (const byte of buf) {
    crc ^= byte << 8
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? (crc << 1) ^ poly : crc << 1
      crc &= 0xffff
    }
  }
  return crc
}

type Waiter = {
  resolve: (value: number) => void
  reject: (reason?: unknown) => void
  timer: ReturnType<typeof setTimeout>
}

class SerialByteReader {
  private queue: number[] = []
  private waiters: Waiter[] = []
  private readonly onData: (chunk: Buffer) => void

  constructor(private port: SerialPortLike) {
    this.onData = (chunk: Buffer) => {
      for (const byte of chunk) {
        if (this.waiters.length > 0) {
          const waiter = this.waiters.shift()!
          clearTimeout(waiter.timer)
          waiter.resolve(byte)
        } else {
          this.queue.push(byte)
        }
      }
    }
    port.on('data', this.onData)
  }

  clear(): void {
    this.queue.length = 0
  }

  destroy(): void {
    this.port.removeListener('data', this.onData)
    for (const waiter of this.waiters) {
      clearTimeout(waiter.timer)
      waiter.reject(new Error('Leitor serial encerrado'))
    }
    this.waiters.length = 0
  }

  readByte(timeoutMs: number): Promise<number> {
    if (this.queue.length > 0) {
      return Promise.resolve(this.queue.shift()!)
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.waiters.findIndex((w) => w.resolve === resolve)
        if (idx >= 0) this.waiters.splice(idx, 1)
        reject(new Error('Timeout na leitura serial'))
      }, timeoutMs)

      this.waiters.push({ resolve, reject, timer })
    })
  }
}

export interface McumgrClientSpecs {
  initialTimeoutS?: number
  subsequentTimeoutMs?: number
  nbRetry?: number
  lineLength?: number
  mtu?: number
}

export class McumgrClient {
  private specs: Required<McumgrClientSpecs>
  private reader: SerialByteReader | null = null
  private seq = 0

  constructor(
    private port: SerialPortLike,
    specs: McumgrClientSpecs = {}
  ) {
    this.specs = {
      initialTimeoutS: specs.initialTimeoutS ?? 60,
      subsequentTimeoutMs: specs.subsequentTimeoutMs ?? 500,
      nbRetry: specs.nbRetry ?? 4,
      lineLength: specs.lineLength ?? 128,
      mtu: specs.mtu ?? 512
    }
    this.reader = new SerialByteReader(port)
  }

  dispose(): void {
    this.reader?.destroy()
    this.reader = null
  }

  private buildHeader(op: number, group: number, id: number, bodyLength: number): Buffer {
    const hdr = Buffer.alloc(8)
    hdr[0] = op
    hdr[1] = 0
    hdr.writeUInt16BE(bodyLength, 2)
    hdr.writeUInt16BE(group, 4)
    hdr[6] = this.seq & 0xff
    hdr[7] = id
    return hdr
  }

  private encodeRequest(op: number, group: number, id: number, bodyObj: Record<string, unknown> = {}): Buffer {
    const body = encode(bodyObj)
    const header = this.buildHeader(op, group, id, body.length)
    const payload = Buffer.concat([header, body])
    const crc = computeXmodemCrc16(payload)
    const withCrc = Buffer.concat([payload, Buffer.from([(crc >> 8) & 0xff, crc & 0xff])])
    const lengthPrefix = Buffer.alloc(2)
    lengthPrefix.writeUInt16BE(withCrc.length, 0)
    const full = Buffer.concat([lengthPrefix, withCrc])
    const b64 = full.toString('base64')
    const maxChunk = this.specs.lineLength - 4
    const lines: string[] = []
    for (let i = 0; i < b64.length; i += maxChunk) {
      lines.push(b64.slice(i, i + maxChunk))
    }
    const packets: Buffer[] = []
    for (let i = 0; i < lines.length; i++) {
      const prefix = i === 0 ? Buffer.from([0x06, 0x09]) : Buffer.from([0x04, 0x14])
      packets.push(Buffer.concat([prefix, Buffer.from(lines[i], 'ascii'), Buffer.from('\n', 'ascii')]))
    }
    this.seq = (this.seq + 1) & 0xff
    return Buffer.concat(packets)
  }

  private async readLine(timeoutMs: number): Promise<Buffer> {
    const bytes: number[] = []
    while (true) {
      const b = await this.reader!.readByte(timeoutMs)
      if (b === 0x0a) break
      bytes.push(b)
    }
    return Buffer.from(bytes)
  }

  private async readFramedResponse(isFirstRequest: boolean): Promise<{ body: Record<string, unknown> }> {
    const timeoutMs = isFirstRequest
      ? this.specs.initialTimeoutS * 1000
      : this.specs.subsequentTimeoutMs

    let base64Accum = ''
    let expectedLen: number | null = null
    let chunkIndex = 0
    let accumulated = Buffer.alloc(0)

    while (true) {
      const b1 = await this.reader!.readByte(timeoutMs)
      const b2 = await this.reader!.readByte(timeoutMs)

      if (chunkIndex === 0) {
        if (b1 !== 0x06 || b2 !== 0x09) {
          throw new Error(`Prefixo inicial inválido: [${b1}, ${b2}]`)
        }
      } else if (b1 !== 0x04 || b2 !== 0x14) {
        throw new Error(`Prefixo de chunk inválido: [${b1}, ${b2}]`)
      }

      const lineBuf = await this.readLine(timeoutMs)
      base64Accum += lineBuf.toString('ascii')
      accumulated = Buffer.from(base64Accum, 'base64')

      if (chunkIndex === 0 && accumulated.length >= 2) {
        expectedLen = accumulated.readUInt16BE(0)
      }

      chunkIndex++
      if (expectedLen !== null && accumulated.length - 2 >= expectedLen) break
    }

    const lengthField = accumulated.readUInt16BE(0)
    const dataWithCrc = accumulated.slice(2, 2 + lengthField)
    const bodyAndHeader = dataWithCrc.slice(0, dataWithCrc.length - 2)
    const receivedCrc = dataWithCrc.readUInt16BE(dataWithCrc.length - 2)
    const computedCrc = computeXmodemCrc16(bodyAndHeader)
    if (receivedCrc !== computedCrc) throw new Error('CRC16 inválido na resposta')

    const hdr = bodyAndHeader.slice(0, 8)
    const cborBody = bodyAndHeader.slice(8)
    const bodyLen = hdr.readUInt16BE(2)
    if (bodyLen !== cborBody.length) throw new Error('Tamanho CBOR inconsistente')

    return { body: cborBody.length > 0 ? (decode(cborBody) as Record<string, unknown>) : {} }
  }

  private async flushPort(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.port.flush((err) => (err ? reject(err) : resolve()))
    })
    this.reader?.clear()
  }

  private async transceive(
    op: number,
    group: number,
    id: number,
    bodyObj: Record<string, unknown> = {},
    isFirstRequest = false
  ): Promise<{ body: Record<string, unknown> }> {
    const packet = this.encodeRequest(op, group, id, bodyObj)
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.specs.nbRetry; attempt++) {
      try {
        await this.flushPort()
        await new Promise<void>((resolve, reject) => {
          this.port.write(packet, (err) => (err ? reject(err) : resolve()))
        })
        await new Promise<void>((resolve, reject) => {
          this.port.drain((err) => (err ? reject(err) : resolve()))
        })
        return await this.readFramedResponse(isFirstRequest)
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
      }
    }

    throw lastError ?? new Error('Falha na comunicação serial')
  }

  async checkRecoveryModeQuick(): Promise<boolean> {
    const previousTimeout = this.specs.initialTimeoutS
    this.specs.initialTimeoutS = 2
    try {
      const response = await this.transceive(NmpOp.Read, NmpGroup.Image, NmpIdImage.State, {}, true)
      if (response.body?.rc !== undefined && response.body.rc !== 0) return false
      return true
    } catch {
      return false
    } finally {
      this.specs.initialTimeoutS = previousTimeout
    }
  }

  async resetDevice(): Promise<void> {
    const response = await this.transceive(NmpOp.Write, NmpGroup.Default, NmpIdDef.Reset, {})
    if (response.body?.rc !== undefined && response.body.rc !== 0) {
      throw new Error(`Reset falhou com rc=${response.body.rc}`)
    }
  }

  async imageUpload(
    binPath: string,
    slot = 0,
    progressCallback: (off: number, total: number) => void = () => {}
  ): Promise<void> {
    const crypto = window.require('crypto') as typeof import('crypto')
    const firmware = fs.readFileSync(binPath)
    const totalSize = firmware.length
    if (totalSize === 0) {
      throw new Error('Arquivo de firmware vazio')
    }

    const sha = crypto.createHash('sha256').update(firmware).digest()
    let offset = 0
    let isFirstPacket = true

    while (offset < totalSize) {
      const chunk = firmware.slice(offset, offset + this.specs.mtu)
      const body = isFirstPacket
        ? { image: slot, off: 0, len: totalSize, sha, data: chunk }
        : { image: slot, off: offset, data: chunk }

      const response = await this.transceive(
        NmpOp.Write,
        NmpGroup.Image,
        NmpIdImage.Upload,
        body,
        isFirstPacket
      )

      if (response.body?.rc !== undefined && response.body.rc !== 0) {
        throw new Error(`Upload falhou com rc=${response.body.rc} no offset ${offset}`)
      }
      if (typeof response.body?.off !== 'number') {
        throw new Error('Resposta de upload sem campo off')
      }

      offset = response.body.off as number
      progressCallback(offset, totalSize)
      isFirstPacket = false

      // Permite a UI (barra de progresso) atualizar entre pacotes
      await new Promise<void>((resolve) => setTimeout(resolve, 0))

      if (offset >= totalSize) break
    }
  }
}
