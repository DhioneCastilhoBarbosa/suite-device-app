export default function Settings() {
  return (
    <div className="flex flex-col gap-6 mt-10 w-full ">
      <div className=" w-full flex flex-col">
        <label className="w-full border-b-[1px] border-sky-500 mb-4 font-semibold">
          Nivel de Potencia RF
        </label>
        <div className="flex gap-4">
          <div className=" flex flex-row justify-center items-center border border-sky-500 w-auto p-4 rounded-md gap-2  bg-sky-500 ">
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7 w-28"
              type="text"
              value={'37.00'}
            />
            <label className="font-semibold w-36 text-white"> 100bps</label>
            <div className="flex flex-col w-full ">
              <label className="font-normal text-white"> Min: 32</label>
              <label className="font-normal text-white">Max: 38</label>
            </div>
          </div>

          <div className=" flex flex-row justify-center items-center border border-sky-500 w-auto p-4 rounded-md gap-2  bg-sky-500">
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7 w-28"
              type="text"
              value={'37.00'}
            />
            <label className="font-semibold w-36 text-white"> 300 bps</label>
            <div className="flex flex-col w-full ">
              <label className="font-normal text-white"> Min: 32</label>
              <label className="font-normal text-white">Max: 38</label>
            </div>
          </div>

          <div className=" flex flex-row justify-center items-center border border-sky-500 w-auto p-4 rounded-md gap-2  bg-sky-500">
            <input
              className="border border-sky-500 rounded-md p-2 text-center h-7 w-28"
              type="text"
              value={'37.00'}
            />
            <label className="font-semibold w-36 text-white"> 1200 bps</label>
            <div className="flex flex-col w-full ">
              <label className="font-normal text-white"> Min: 32</label>
              <label className="font-normal text-white">Max: 38</label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className=" w-full flex flex-col">
          <label className="w-full mb-1 font-semibold">Transmissão Temporizada</label>
          <div className="flex flex-col gap-4 border-[1px] border-sky-500 p-2 rounded-md p-5">
            <div className="flex flex-col gap-2">
              <label> ID da plataforma</label>
              <input
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="text"
                value={'ahju456789v0'}
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
              <label> Taxa de bit para transmissão</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="100">100 bps</option>
                  <option value="300">300 bps</option>
                  <option value="1200">1200 bps</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Intervalo de transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="text"
                  value={'00:01:00:00'}
                />
                <label> dd:hh:mm:ss</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Primeiro horário de transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="text"
                  value={'00:01:00'}
                />
                <label> hh:mm:ss</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Tamanho da janela de transmissão</label>
              <input
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="number"
                value={5}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label> Centralização de mensagem em trasmissões</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Formato de dados das trasmissões</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="ASCII">ASCII</option>
                  <option value="PSEUD">PSEUD</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Mensagem de buffer vazio</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
                <label>bps</label>
              </div>
            </div>
          </div>
        </div>

        <div className=" w-full flex flex-col">
          <label className="w-full  mb-1 font-semibold">Transmissão Aleatoria</label>
          <div className="flex flex-col gap-4 border-[1px] border-sky-500 p-2 rounded-md p-5">
            <div className="flex flex-col gap-2">
              <label> ID da plataforma</label>
              <input
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="text"
                value={'ahju456789v0'}
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
              <label> Taxa de bit para transmissão</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="100">100 bps</option>
                  <option value="300">300 bps</option>
                  <option value="1200">1200 bps</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Intervalo de transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="text"
                  value={'00:01:00:00'}
                />
                <label> dd:hh:mm:ss</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Primeiro horário de transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="text"
                  value={'00:01:00'}
                />
                <label> hh:mm:ss</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Tamanho da janela de transmissão</label>
              <input
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="number"
                value={5}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label> Centralização de mensagem em trasmissões</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Formato de dados das trasmissões</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="ASCII">ASCII</option>
                  <option value="PSEUD">PSEUD</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Mensagem de buffer vazio</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  name=""
                  id=""
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
                <label>bps</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
