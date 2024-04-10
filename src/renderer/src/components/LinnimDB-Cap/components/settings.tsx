export default function Settings(){
  return(
    <div className="flex flex-col items-center justify-center m-auto">
      <div className="grid grid-cols-2  gap-4">

        <div className="flex flex-col w-56 ">
          <label>Unidade</label>
          <select name="unidade" id="unidade" className="w-48 rounded-md h-6">
            <option value="">mCA</option>
            <option value="">Pa</option>
            <option value="">Bar</option>
          </select>
        </div>

        <div className="flex flex-col w-52">
          <label>Endereço MODBUS</label>
          <input
          type="number"
          className='border border-zinc-400 w-48 rounded-md h-6 outline-none text-center'
          min={0}
          />
        </div>

      </div>
      <div>botoes</div>
      <div>leitura</div>
    </div>

  )
}
