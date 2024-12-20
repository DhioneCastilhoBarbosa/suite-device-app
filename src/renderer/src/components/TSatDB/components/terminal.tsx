import Button from '@renderer/components/button/Button'

export function Terminal() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row gap-2 mt-6 mx-8 justify-end">
        <Button size={'small'}>Limpar</Button>
        <Button size={'small'}>Salvar</Button>
      </div>
      <div className=" flex w-full h-72">
        <textarea
          name=""
          id=""
          readOnly
          className="w-full mx-8 mt-2 border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap outline-none text-black text-sm"
        ></textarea>
      </div>

      <div className="flex justify-end flex-row mt-4 mr-8 ml-8 gap-2">
        <input
          className="w-full border-[2px] rounded-md outline-sky-400 p-2"
          type="text"
          placeholder="Digite o comando"
        />
        <Button size={'large'} className="h-10" filled>
          Enviar
        </Button>
      </div>
    </div>
  )
}
