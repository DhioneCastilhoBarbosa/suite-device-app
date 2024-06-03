import Button from "../button/Button"

interface ModalProps{
  show: boolean
  onClose:()=>void
  onUpdate:()=>void
}
export function ModalUpdate({show,onClose, onUpdate}:ModalProps){

  if(!show){
    return null
  }
  return(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-xl font-bold mb-4">Atenção!</h2>
        <p >Ao atualizar todas as configurações serão perdidas.</p>
        <p className="mb-6">Deseja prosseguir com a atualização?</p>
        <div className="flex justify-between mx-8">
          <Button
          size={"small"}
          filled={true}
          onClick={onUpdate}
          >
            Sim
          </Button>
          <Button
          size={"small"}
          filled={true}
          onClick={onClose}
          >
            Não
          </Button>
        </div>
      </div>
    </div>
  )
}
