import Button from '@renderer/components/button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import { t } from 'i18next'

export type TerminalLogEntry = { kind: 'sent' | 'response'; text: string }

function responseLineClass(line: string): string {
  const text = line.trim().toLowerCase()
  if (text === 'ok') return 'font-semibold text-emerald-700'
  if (text.includes('bad parameter') || text.includes('must be enabled') || text.includes('error')) {
    return 'font-semibold text-red-600'
  }
  return 'text-zinc-700'
}

function readableLine(line: string): string {
  return line.replace(/,(?!\s)/g, ', ')
}

function formatTsatTerminalLog(entries: TerminalLogEntry[]): string {
  return entries
    .flatMap((entry) => {
      if (entry.kind === 'sent') return [`TX=> ${entry.text}`]
      return entry.text.split('\n').map((line) => `RX=> ${readableLine(line)}`)
    })
    .join('\n')
}

type Props = {
  lines: TerminalLogEntry[]
  handleSendComandTerminal: (valuer: string) => void
  onClear: () => void
}

export function Terminal({ lines, handleSendComandTerminal, onClear }: Props): JSX.Element {
  const [inputValue, setInputValue] = useState<string>('')
  const logRef = useRef<HTMLDivElement | null>(null)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(event.target.value)
  }

  const handleSendComand = (): void => {
    handleSendComandTerminal(inputValue)
    setInputValue('')
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      handleSendComand()
    }
  }

  const handleSaveToFile = (): void => {
    const headerFile = t('Dados gerados do Transmissor TSatDB - ')
    const date = new Date().toLocaleString()
    const Data = headerFile + date + '\n \n' + formatTsatTerminalLog(lines)
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'Terminal-TSatDB.txt')
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="flex flex-col w-full mt-10 mb-4">
      <div className="flex flex-row gap-2 mt-6 mx-8 justify-end">
        <Button size={'small'} onClick={onClear}>
          {t('Limpar')}
        </Button>
        <Button size={'small'} onClick={handleSaveToFile}>
          {t('Salvar')}
        </Button>
      </div>
      <div className="mx-8 mt-2 h-72">
        <div
          ref={logRef}
          className="h-full w-full overflow-y-auto rounded-md border border-sky-500 bg-white p-2 font-mono text-sm"
        >
          {lines.map((entry, index) =>
            entry.kind === 'sent' ? (
              <div key={index} className="mt-2 font-semibold text-sky-700 first:mt-0">
                {'TX=> '}
                {entry.text}
              </div>
            ) : (
              <div key={index}>
                {entry.text.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className={responseLineClass(line)}>
                    {'RX=> '}
                    {readableLine(line)}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <div className="flex justify-end flex-row mt-4 mr-8 ml-8 gap-2">
        <input
          className="w-full border-[2px] rounded-md outline-sky-400 p-2"
          type="text"
          placeholder={t('Digite o comando')}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
        <Button size={'large'} className="h-10" filled onClick={handleSendComand}>
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
