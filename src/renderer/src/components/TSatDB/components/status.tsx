// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Status() {
  return (
    <div className="flex flex-row gap-6 flex-wrap items-end justify-center ">
      <div className="flex flex-col w-40 ">
        <label className="text-md ">Número de Serie</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'1236755'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md ">Versão do Hardware</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'1.00'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md ">Versão do Firmware</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'11.15 2024/09/12'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md ">Timer</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'2024/12/02 23:31:15'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md ">Habilitar Transmissão</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'Enabled'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md ">Próxima Transmissão Temporizada</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'2024/12/02 01:31:15'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm ">Próxima Transmissão Aleatória</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'N/A'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm ">Fail Safe</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'Ok'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm ">Tensão de Alimentação</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'12.4'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm ">Temperatura</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'30.7 C'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm ">Contagem do Buffer Módulo Temporizado</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'0 bytes'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm ">Contagem do Buffer Módulo Aleatório</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'0 bytes'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-sm ">Status da Próxima Transmissão</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'00:00'}
        />
      </div>

      <div className="flex flex-col w-40 "></div>
      <div className="flex flex-col w-40 "></div>
      <div className="flex flex-col w-40 "></div>
    </div>
  )
}
