import VariableInput from './variableInput'

export default function VariableControl() {
  // Correção da tipagem no Array.from
  const inputs = Array.from({ length: 10 }, (_, index: number) => index + 1)

  return (
    <div className="flex flex-col">
      <header className="flex items-start justify-between mr-8 ml-8 mt-10 border-b-[1px] border-sky-500 ">
        <div className="flex gap-4">
          <label>Variáveis Controle</label>
        </div>
      </header>

      <div className="grid grid-cols-5 gap-4  mr-8 ml-8">
        {inputs.map((input: number, index: number) => (
          <VariableInput key={index} addres={input} />
        ))}
      </div>

      <div className="flex items-center justify-end mt-6 mr-10 gap-1">
        <label> Variáveis de controle em uso:</label>
        <input
          className=" text-center text-white w-10 bg-sky-500 border rounded-md"
          type="text"
          value={1}
        />
      </div>
    </div>
  )
}
