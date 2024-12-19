export default function Gps() {
  return (
    <div className="flex flex-row gap-6 flex-wrap items-end justify-center mt-16">
      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Status GPS</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'On'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Latitude</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'00.00'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Longitude</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'00.00'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Altitude</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'00.00'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">Definir o intervalo de correção</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'00:00:00'}
        />
      </div>

      <div className="flex flex-col w-40 ">
        <label className="text-md mb-1">GPS Data / Time - Fix</label>
        <input
          className="border border-sky-500 rounded-md p-2 text-center h-7"
          type="text"
          value={'1996/12/02 23:31:15'}
        />
      </div>

      <div className="flex flex-col w-40 "></div>
      <div className="flex flex-col w-40 "></div>
      <div className="flex flex-col w-full ml-14 mr-14">
        <label className="font-bold bg-sky-500 text-white p-1">Log:</label>
        <textarea
          name=""
          id=""
          readOnly
          className="w-full border-[2px] border-zinc-200 resize-none overflow-y-scroll whitespace-pre-wrap outline-none text-black text-sm h-64"
        ></textarea>
      </div>
    </div>
  )
}
