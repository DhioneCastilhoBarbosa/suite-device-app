import flagBrazil from '../../assets/Brasil.svg'

export default function SelectLanguage() {
  return (
    <div className="flex items-center border-[1px] border-[#336B9E] rounded-lg p-[4px] h-8">
      <img className="h-6" src={flagBrazil} alt="bandeira do Brasil" />
      <select className="p-[4px] w-auto bg-inherit outline-0">
        <option value="Portugues-BR">Portugues</option>
      </select>
    </div>
  )
}
