import Button from '@renderer/components/button/Button'

export function TransmissionTest() {
  return (
    <div className=" flex flex-col w-full justify-center items-center mt-20">
      <div className=" flex w-full ">
        <label className="bg-sky-500 text-white w-full text-center font-bold text-xl rounded-t-md">
          Teste de transmissão
        </label>
      </div>
      <div className="flex flex-col w-full gap-4 border-[1px] border-sky-500 p-8 items-start rounded-b-md">
        <div className="flex flex-col gap-2">
          <label> ID da plataforma</label>
          <input
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-52"
            type="text"
            value={'ahju456789v0002567'}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label> Número do canal da transmissão</label>
          <input
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
            type="number"
            value={33}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label> ID da plataforma</label>
          <input
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-96"
            type="text"
            value={'ahju456789v0002567'}
          />
        </div>
      </div>
      <div className="mt-4">
        <Button size={'large'} className="h-10" filled>
          Enviar
        </Button>
      </div>
    </div>
  )
}
