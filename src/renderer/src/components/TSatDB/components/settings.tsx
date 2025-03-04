import { useEffect, useState } from 'react'
import ButtonSet from './buttonSet'
import { saveAs } from 'file-saver'
import { selectFile } from '@renderer/utils/fileUtils'

type Props = {
  receiverSettings: string | undefined
  receiverTxPowerLevel: string | undefined
  handleUpdateSettings: () => void
  handleSendSettings: (settings: string[]) => void
  handlesRecoverSettingsFactory: () => void
  handleFileInformations: (newValue: string) => void
  handleClearFailSafe: () => void
  // clear: boolean | undefined
  // onClearReset: (newValue: boolean) => void
  // changeVariableMain: (value: string) => void
}

export default function Settings({
  receiverSettings,
  receiverTxPowerLevel,
  handleUpdateSettings,
  handleSendSettings,
  handlesRecoverSettingsFactory,
  handleFileInformations,
  handleClearFailSafe
}: Props): JSX.Element {
  const [dataSettings, setDataSettings] = useState<string[]>([])
  const [dataSaveSettings, setDataSaveSettings] = useState<string[]>([])

  // variables for the tx temporized
  const [NESID, setNESID] = useState<string>('0000')
  const [TCH, setTCH] = useState<string>('33')
  const [TBR, setTBR] = useState<string>('300')
  const [TIN, setTIN] = useState<string>('00:01:00:00')
  const [FTT, setFTT] = useState<string>('00:47:50')
  const [TWL, setTWL] = useState<string>('5')
  const [CMSG, setCMSG] = useState<string>('Y')
  const [TDF, setTDF] = useState<string>('P')
  const [EBM, setEBM] = useState<string>('Y')
  const [TPR, setTPR] = useState<string>('S')
  // variables for the tx aleatory
  const [RCH, setRCH] = useState<string>('0')
  const [RBR, setRBR] = useState<string>('300')
  const [RIN, setRIN] = useState<string>('20')
  const [RPC, setRPC] = useState<string>('50')
  const [RRC, setRRC] = useState<string>('0')
  const [RDF, setRDF] = useState<string>('A')
  const [RMC, setRMC] = useState<string>('Y')
  const [IRC, setIRC] = useState<string>('?')

  const handleSelectFile = (): void => {
    const handleFileContentLoad = (content: string): void => {
      //setFileContent(content)
      handleFileInformations(content)
      //console.log('fileContent', content)
    }
    selectFile(handleFileContentLoad, 'txt')
  }

  const handleInputChange = (id: string, value: string): void => {
    switch (id) {
      case 'NESID':
        setNESID(value)
        break
      case 'TCH':
        setTCH(value)
        break
      case 'TBR':
        setTBR(value)
        break
      case 'TIN':
        setTIN(value)
        break
      case 'FTT':
        setFTT(value)
        break
      case 'TWL':
        setTWL(value)
        break
      case 'CMSG':
        setCMSG(value)
        break
      case 'TDF':
        setTDF(value)
        break
      case 'EBM':
        setEBM(value)
        break
      case 'TPR':
        setTPR(value)
        break
      case 'RCH':
        setRCH(value)
        break
      case 'RBR':
        setRBR(value)
        break
      case 'RIN':
        setRIN(value)
        break
      case 'RPC':
        setRPC(value)
        break
      case 'RRC':
        setRRC(value)
        break
      case 'RDF':
        setRDF(value)
        break
      case 'RMC':
        setRMC(value)
        break
      case 'IRC':
        setIRC(value)
        break
      default:
        break
    }
  }

  function handleUpdate(): void {
    handleUpdateSettings()
    loadVariables(receiverSettings ?? '')
  }

  function handleFailSafe(): void {
    handleClearFailSafe()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleClearVariable(): void {
    setNESID('')
    setTCH('')
    setTBR('')
    setTIN('')
    setFTT('')
    setTWL('')
    setCMSG('')
    setTDF('')
    setEBM('')
    setTPR('')
    setRCH('')
    setRBR('')
    setRIN('')
    setRPC('')
    setRRC('')
    setRDF('')
    setRMC('')
    setIRC('')
  }

  function handleSendSetting(): void {
    const settingsArray = [
      NESID,
      TCH,
      TBR,
      TIN,
      FTT,
      TWL,
      CMSG,
      EBM,
      TPR,
      TDF,
      RCH,
      RBR,
      RIN,
      RPC,
      RRC,
      RDF,
      RMC,
      IRC
    ]
    handleSendSettings(settingsArray)
  }

  function handleSaveVaribles(): void {
    const delimiter = '\r\n'
    const settingsArray = [
      'NESID=' + NESID + delimiter,
      'TCH=' + TCH + delimiter,
      'TBR=' + TBR + delimiter,
      'TIN=' + TIN + delimiter,
      'FTT=' + FTT + delimiter,
      'TWL=' + TWL + delimiter,
      'CMSG=' + CMSG + delimiter,
      'EBM=' + EBM + delimiter,
      'TPR=' + TPR + delimiter,
      'TDF=' + TDF + delimiter,
      'RCH=' + RCH + delimiter,
      'RBR=' + RBR + delimiter,
      'RIN=' + RIN + delimiter,
      'RPC=' + RPC + delimiter,
      'RRC=' + RRC + delimiter,
      'RDF=' + RDF + delimiter,
      'RMC=' + RMC + delimiter,
      'IRC=' + IRC + delimiter
    ]
    setDataSaveSettings(settingsArray)
  }

  const handleSaveToFile = (): void => {
    const headerFile = 'Dados de configuração do Trasmissor TSatDB - '
    const date = new Date().toLocaleString()
    const Data = headerFile + date + '\r\n' + dataSaveSettings.join('').replace(/,/g, '')
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'Configuracao-TSatDB.txt')
  }

  function loadVariables(settings: string): void {
    if (settings) {
      const loadedDataSettings = settings.split('\r\n').map((item) => item.trim())
      //console.log(loadedDataSettings)
      setDataSettings(loadedDataSettings)
    }
  }

  function UpdateVarible(): void {
    setNESID(dataSettings[1] ? dataSettings[1].replace('NESID=', '') : 'N/A')
    setTCH(dataSettings[2] ? dataSettings[2].replace('TCH=', '') : '0')
    setTBR(dataSettings[3] ? dataSettings[3].replace('TBR=', '') : '100')
    setTIN(dataSettings[4] ? dataSettings[4].replace('TIN=', '') : 'N/A')
    setFTT(dataSettings[5] ? dataSettings[5].replace('FTT=', '') : 'N/A')
    setTWL(dataSettings[6] ? dataSettings[6].replace('TWL=', '') : '0')
    setCMSG(dataSettings[7] ? dataSettings[7].replace('CMSG=', '') : 'Sim')
    setEBM(dataSettings[8] ? dataSettings[8].replace('EBM=', '') : 'Sim')
    setTPR(dataSettings[9] ? dataSettings[9].replace('TPR=', '') : 'Y')
    setTDF(dataSettings[10] ? dataSettings[10].replace('TDF=', '') : 'ASCII')
    setRCH(dataSettings[11] ? dataSettings[11].replace('RCH=', '') : '0')
    setRBR(dataSettings[12] ? dataSettings[12].replace('RBR=', '') : '100')
    setRIN(dataSettings[13] ? dataSettings[13].replace('RIN=', '') : 'N/A')
    setRPC(dataSettings[14] ? dataSettings[14].replace('RPC=', '') : '0')
    setRRC(dataSettings[15] ? dataSettings[15].replace('RRC=', '') : '0')
    setRDF(dataSettings[16] ? dataSettings[16].replace('RDF=', '') : 'ASCII')
    setRMC(dataSettings[17] ? dataSettings[17].replace('RMC=', '') : 'Sim')
    setIRC(dataSettings[18] ? dataSettings[18].replace('IRC=', '') : 'N/A')
  }

  useEffect(() => {
    loadVariables(receiverSettings ?? '')
  }, [receiverSettings, receiverTxPowerLevel])

  useEffect(() => {
    UpdateVarible()
  }, [dataSettings])

  useEffect(() => {
    handleSaveVaribles()
  }, [NESID, TCH, TBR, TIN, FTT, TWL, CMSG, EBM, TPR, TDF, RCH, RBR, RIN, RPC, RRC, RDF, RMC, IRC])

  useEffect(() => {
    handleUpdateSettings()
  }, [])

  return (
    <div className="flex flex-col gap-6 mt-6 w-full pr-2 h-auto ">
      <div className="flex gap-8 border-[1px] border-sky-500 rounded-md p-5">
        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-bold"> ID da plataforma</label>
          <input
            id="NESID"
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-52"
            type="text"
            value={NESID}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2 ">
          <label className="text-gray-700 font-bold">
            {' '}
            Substituição de caractere proíbido(IRC)
          </label>
          <input
            id="IRC"
            className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
            type="text"
            value={IRC}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-8">
        <div className=" w-full flex flex-col">
          <label className="w-full mb-1 font-semibold">Transmissão Temporizada</label>
          <div className="flex flex-col gap-4 border-[1px] border-sky-500 rounded-md p-5">
            <div className="flex flex-col gap-2">
              <label> Número do canal da transmissão</label>
              <input
                id="TCH"
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="number"
                value={TCH}
                onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label> Taxa de bit para transmissão</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  id="TBR"
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                  value={TBR}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                >
                  <option value="100">100</option>
                  <option value="300">300</option>
                  <option value="1200">1200</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Intervalo de transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  id="TIN"
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="text"
                  value={TIN}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                />
                <label> dd:hh:mm:ss</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Primeiro horário de transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  id="FTT"
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="text"
                  value={FTT}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                />
                <label> hh:mm:ss</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Tamanho da janela de transmissão</label>
              <input
                id="TWL"
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="number"
                value={TWL}
                onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label> Centralização de mensagem em trasmissões</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  id="CMSG"
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                  value={CMSG}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                >
                  <option value="Y">Sim</option>
                  <option value="N">Não</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Formato de dados das trasmissões</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  id="TDF"
                  className="border border-gray-500 rounded-md h-7 text-center w-32"
                  value={TDF}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                >
                  <option value="A">ASCII</option>
                  <option value="P">PSEUD-Binário</option>
                  <option value="B">Binário</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Mensagem de buffer vazio</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  id="EBM"
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                  value={EBM}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                >
                  <option value="Y">Sim</option>
                  <option value="N">Não</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className=" w-full flex flex-col">
          <label className=" w-full mb-1 font-semibold">Transmissão Aleatória</label>
          <div className=" h-full flex flex-col gap-4 border-[1px] border-sky-500 rounded-md p-5 ">
            <div className="flex flex-col gap-2">
              <label> Número do canal da transmissão</label>
              <input
                id="RCH"
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="number"
                value={RCH}
                onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label> Taxa de bit para transmissão</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  id="RBR"
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                  value={RBR}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                >
                  <option value="100">100</option>
                  <option value="300">300</option>
                  <option value="1200">1200</option>
                </select>
                <label>bps</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Intervalo de transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  id="RIN"
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="text"
                  value={RIN}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                />
                <label>minutos</label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Porcentagem da transmissão</label>
              <div className="flex flex-row gap-2 items-center">
                <input
                  id="RPC"
                  className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                  type="number"
                  value={RPC}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Repetiçao da transmissão</label>
              <input
                id="RRC"
                className="border border-gray-500 rounded-md p-2 text-center h-7 w-28"
                type="number"
                value={RRC}
                onChange={(e) => handleInputChange(e.target.id, e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label> Formato de dados das trasmissões</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  id="RDF"
                  className="border border-gray-500 rounded-md h-7 text-center  w-32"
                  value={RDF}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                >
                  <option value="A">ASCII</option>
                  <option value="P">PSEUD-Binário</option>
                  <option value="B">Binário</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label> Contagem de Mensagem</label>

              <div className="flex flex-row gap-2 items-center">
                <select
                  id="RMC"
                  className="border border-gray-500 rounded-md h-7 text-center  w-28"
                  value={RMC}
                  onChange={(e) => handleInputChange(e.target.id, e.target.value)}
                >
                  <option value="Y">Sim</option>
                  <option value="N">Não</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ButtonSet
        handleDownInformation={handleUpdate}
        handleSendInformation={handleSendSetting}
        handleSaveInformation={handleSaveToFile}
        handleRetornSettingsFactory={handlesRecoverSettingsFactory}
        handleFileInformations={handleSelectFile}
        ClearFailSafe={handleFailSafe}
      />
    </div>
  )
}
