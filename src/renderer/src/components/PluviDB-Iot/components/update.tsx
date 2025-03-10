import Button from '@renderer/components/button/Button'

declare global {
  interface Window {
    api: {
      runUpdater: () => Promise<any> // Defina o tipo correto de retorno, se souber
    }
  }
}

export function Update(): JSX.Element {
  const handleRunUpdater = async (): Promise<void> => {
    try {
      const result = await window.api.runUpdater()
      console.log('Resultado do updater:', result)
    } catch (error) {
      console.error('Erro ao executar o updater:', error)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center gap-3 h-48">
      <h1 className="text-lg">Clique no botão abaixo para acessar a ferramenta de atualização.</h1>

      <Button onClick={handleRunUpdater}>Executar Atualizador</Button>
    </div>
  )
}
