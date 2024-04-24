

"use strict";

//==============================================================
// create an empty modbus client
const ModbusRTU   = window.require ("modbus-serial");
const client      = new ModbusRTU();

let mbsStatus   = "Initializing...";    // holds a status of Modbus

// Modbus 'state' constants
const MBS_STATE_INIT          = "State init";
const MBS_STATE_IDLE          = "State idle";
const MBS_STATE_NEXT          = "State next";
const MBS_STATE_GOOD_READ     = "State good (read)";
const MBS_STATE_FAIL_READ     = "State fail (read)";
const MBS_STATE_GOOD_CONNECT  = "State good (port)";
const MBS_STATE_FAIL_CONNECT  = "State fail (port)";

// Modbus configuration values
const mbsId       = 1;
const mbsScan     = 1000;
const mbsTimeout  = 6000;
let mbsState    = MBS_STATE_INIT;

// Upon SerialPort error
client.on("error", function(error) {
    console.log("SerialPort Error: ", error);
});

interface ModBusConectProps{
  SerialName: String,
  BaudRate: number,
}

//==============================================================
export function connectClient({SerialName,BaudRate}:ModBusConectProps)
{
    // set requests parameters
    client.setID      (mbsId);
    client.setTimeout (mbsTimeout);

    // try to connect
    client.connectRTUBuffered (SerialName, { baudRate: BaudRate, parity: "One", dataBits: 8, stopBits: 1 })
        .then(function()
        {
            mbsState  = MBS_STATE_GOOD_CONNECT;
            mbsStatus = "Connected, wait for reading...";
            console.log(mbsStatus);
        })
        .catch(function(e)
        {
            mbsState  = MBS_STATE_FAIL_CONNECT;
            mbsStatus = e.message;
            console.log(e);
        });
};


//==============================================================
 export function readModbusData(address:number, register: number, Int16: boolean)
{
  return new Promise((resolve,reject)=>{
    // try to read data
    client.readHoldingRegisters (address, register)
        .then(function(data)
        {
            mbsState   = MBS_STATE_GOOD_READ;
            mbsStatus  = "success";
            //console.log(data.buffer);

            let Data = data.buffer
            let asciiData = '';

            // Convert each byte to ASCII character
            for (let i = 0; i < Data.length; i++) {
                asciiData += String.fromCharCode(Data[i]);
            }

            if(Int16===true){
              let Int16Data = Data.readInt16BE()
              console.log(Int16Data)
              resolve (Int16Data)
            }else{
              console.log(asciiData)
              resolve(asciiData)
            }

        })
        .catch(function(e)
        {
            mbsState  = MBS_STATE_FAIL_READ;
            mbsStatus = e.message;
           // console.log(e);
            reject(e)
        });
  })
};


 export function CloseModBus(){
  client.close(function(err) {
    if (err) {
        console.error('Erro ao fechar a conexão:', err);
    } else {
        console.log('Conexão fechada com sucesso.');
    }
});
}
//==============================================================


