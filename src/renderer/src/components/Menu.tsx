import Conector from './conector/Conector'

export default function Menu() {
  return (
    <div className="flex flex-col justify-between bg-[#1769A0] w-52 rounded-lg mt-16 mb-9">
      <div>
        <div className="flex items-center justify-center border-b-[2px] border-sky-500 pt-1 pb-3">
          <span className="text-white text-sm font-bold">Dispostivos</span>
        </div>

        <div className="flex items-center justify-center pt-4 text-white  font-bold">
          <ul className="  w-full ml-1 mr-3">
            <li className="">
              <button className="bg-[#1E9EF4] w-full h-8 flex items-center justify-start pl-4 rounded-b-lg rounded-tr-lg mb-2 hover:bg-sky-400">
                Terminal-SDI12
              </button>
            </li>

            <li>
              <button className="bg-[#1E9EF4] w-full h-8 flex items-center justify-start pl-4 rounded-b-lg rounded-tr-lg mb-2 hover:bg-sky-400">
                LinniDB-Borbulha
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <Conector />
      </div>
    </div>
  )
}
