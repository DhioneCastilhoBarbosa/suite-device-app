import { UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'

export function ChangePassword(): JSX.Element {
  return (
    <div className="flex flex-col gap-2 mt-12">
      <div className="flex flex-row justify-normal items-center gap-3">
        <span>Nova senha:</span>
        <input type="password" className="border-[1px] border-gray-200 p-1 rounded-lg" />
      </div>
      <div className="flex flex-row  justify-normal items-center gap-2">
        <span>Confirmação:</span>
        <input type="password" className="border-[1px] border-gray-200 p-1 rounded-lg" />
      </div>

      <div className="flex justify-end mt-10 border-t-[1px] border-gray-200 pt-4">
        <Button>
          <UploadSimple size={24} />
          Enviar
        </Button>
      </div>
    </div>
  )
}
