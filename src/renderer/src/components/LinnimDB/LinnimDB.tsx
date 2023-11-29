import { TerminalWindow } from '@phosphor-icons/react'
export default function LinnimDB() {
  return (
    <div className="w-full mt-16 mb-9 ml-4 mr-[1px]  bg-[#EDF4FB] rounded-lg">
      <header className="w-full flex items-center justify-start bg-[#1769A0] rounded-t-lg h-11">
        <div className=" flex w-9 items-center justify-center bg-white ml-2 mt-4 mb-4 rounded-b-lg rounded-e-lg text-[#1769A0] ">
          <TerminalWindow size={30} />
        </div>
        <h2 className="text-white  font-semibold pl-2">LinnimDB</h2>
      </header>
    </div>
  )
}
