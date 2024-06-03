

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
let mbsId      = 1;
let mbsIdScan  = 1;
const mbsScan  = 1000;
const mbsTimeout  = 6000;
let mbsState    = MBS_STATE_INIT;

// Upon SerialPort error
client.on("error", function(error) {
    console.log("SerialPort Error: ", error);
});

export function IdModBus(address){
  client.setID(address);
}

interface ModBusConectProps{
  SerialName: String,
  BaudRate: number,
}

//==============================================================
/*export function connectClient({SerialName,BaudRate}:ModBusConectProps)
{
    // set requests parameters

    client.setTimeout (mbsTimeout);

    // try to connect
    client.connectRTUBuffered (SerialName, { baudRate: BaudRate, parity: "One", dataBits: 8, stopBits: 1 })
        .then(function()
        {
            mbsState  = MBS_STATE_GOOD_CONNECT;
            mbsStatus = "Connected, wait for reading...";
            console.log(mbsStatus);
            scanNextAddress();
        })
        .catch(function(e)
        {
            mbsState  = MBS_STATE_FAIL_CONNECT;
            mbsStatus = e.message;
            console.log(e);
        });


};*/


// src/modbus.ts
let cancelScan = false;

export const scanNextAddress = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    const scan = (mbsId: number) => {
      if (cancelScan) {
        resolve(false);
        return;
      }
      client.setID(mbsId); // Definir o endereço Modbus que estamos verificando

      client.readHoldingRegisters(0, 1)
        .then(data => {
          if (cancelScan) {
            resolve(false);
            return;
          }
          console.log(`Dispositivo encontrado no endereço ${mbsId}:`, data.data);
          // Faça algo com os dados, se necessário
          client.setID(mbsId);
          mbsId = 1;
          console.log("Varredura parada, dispositivo encontrado.");
          resolve(true); // Dispositivo encontrado
        })
        .catch(err => {
          if (cancelScan) {
            resolve(false);
            return;
          }
          console.error(`Nenhum dispositivo encontrado no endereço ${mbsId}`);

          // Verifique o próximo endereço
          mbsId++;
          if (mbsId <= 247) { // 247 é o endereço máximo permitido em Modbus
            scan(mbsId);
          } else {
            console.log("Varredura completa.");
            resolve(false); // Varredura completa, nenhum dispositivo encontrado
          }
        });
    };
    scan(1); // Comece com o endereço 1
  });
};

export async function connectClient({ SerialName, BaudRate }: ModBusConectProps): Promise<boolean> {
  cancelScan = false; // Resetar o sinal de cancelamento
  client.setTimeout(mbsTimeout);

  try {
    await client.connectRTUBuffered(SerialName, { baudRate: BaudRate, parity: "One", dataBits: 8, stopBits: 1 });
    mbsState = MBS_STATE_GOOD_CONNECT;
    mbsStatus = "Connected, wait for reading...";
    console.log(mbsStatus);

    const deviceFound = await scanNextAddress();
    return deviceFound;

  } catch (e) {
    mbsState = MBS_STATE_FAIL_CONNECT;
    mbsStatus = e.message;
    console.log(e);
    return false;
  }
}

export const cancelConnection = () => {
  cancelScan = true;
};


/*export const scanNextAddress = () => {
  client.setID(mbsId); // Definir o endereço Modbus que estamos verificando

  client.readHoldingRegisters(0, 1)
      .then(data => {
          console.log(`Dispositivo encontrado no endereço ${mbsId}:`, data.data);
          // Faça algo com os dados, se necessário
            client.setID      (mbsId);
            mbsId = 1
          // Parar a varredura ao encontrar um dispositivo
          console.log("Varredura parada, dispositivo encontrado.");
          // client.close(); // Descomente se desejar fechar a conexão aqui
      })
      .catch(err => {
          console.error(`Nenhum dispositivo encontrado no endereço ${mbsId}`);

          // Verifique o próximo endereço
          mbsId++;
          if (mbsId <= 247) { // 247 é o endereço máximo permitido em Modbus
              scanNextAddress();
          } else {
              console.log("Varredura completa.");
              // client.close(); // Fechar a conexão Modbus quando a varredura estiver completa
          }
      });
};*/




//==============================================================
 export function readModbusData(address:number, register: number, Int16: boolean, Float32LE: boolean)
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

            }else if(Float32LE===true){

              let floatValue = Data.readFloatBE(0); // Converte o buffer em um float de 32 bits em little-endian
              console.log( floatValue);
              resolve(floatValue)
            }
            else{
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

function floatToRegisters(float) {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatBE(float, 0);
  return [buffer.readUInt16BE(0), buffer.readUInt16BE(2)];
}

export const WriteModbus = async (register, value, type = 'int') => {
  try {

      if (type === 'float') {
          const registers = floatToRegisters(value);
          await client.writeRegisters(register, registers);
          console.log(`Valor float ${value} gravado nos endereços ${register} e ${register + 1}`);
      } else {
          await client.writeRegister(register, value);
          console.log(`Valor inteiro ${value} gravado no endereço ${register}`);
      }

  } catch (error) {
      console.error('Erro ao gravar no Modbus:', error);
  }
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

