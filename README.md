
# Suite Device

**Suite Device** é um software que permite configurar diversos sensores ambientais e transmissores de dados remotos. Ele realiza a comunicação física com os dispositivos, utilizando os seguintes protocolos:

- **SDI-12**
- **Modbus**
- **Serial**

## Principais tecnologias utilizadas

<div style="display: flex; align-items: center; gap: 20px;">

<img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" width="50"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="TypeScript" width="50"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Electron_Software_Framework_Logo.svg" alt="Electron.js" width="50"/>
<img src="https://cdn.jsdelivr.net/gh/webpack/media@master/logo/icon-square-big.png" alt="Electron Forge" width="50"/>

</div>

## Build

Para construir o aplicativo, siga as etapas abaixo:

1. **Instalar dependências**
   Execute o comando abaixo para instalar as dependências necessárias:
   ```bash
   npm install
   ```

2. **Executar o projeto em modo de desenvolvimento**
   Use o comando abaixo para iniciar o aplicativo em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

3. **Compilar o aplicativo para produção**
   Para gerar a build de produção, utilize o comando:
   ```bash
   npm run make
   ```

4. **Distribuir o aplicativo (Forge / Squirrel, sem auto-update)**
   O `npm run make` gera instaladores na pasta `out` (por exemplo `Suite-Device.exe` + `RELEASES`). Esse fluxo **não** gera `latest.yml` e **não** serve para o `electron-updater`.

5. **Publicar com atualização automática (Windows)**
   O verificador de atualizações usa `electron-updater`, que exige release no GitHub com artefatos do **electron-builder** (NSIS + `latest.yml` + `.blockmap`), não os ficheiros Squirrel do Forge.

   Configure `GH_TOKEN` no `.env` (escopo `repo`) e publique:
   ```bash
   npm run publish
   ```

   No release devem aparecer ficheiros como `latest.yml` e `suite-device-app Setup X.Y.Z.exe`. Distribua o instalador NSIS aos utilizadores (instalação em `%LocalAppData%\Programs\...`, não a pasta `Suite-Device` do Squirrel).

   Para publicar apenas o Forge (Linux/macOS ou instalador Squirrel legado): `npm run publish-forge`.

Essas etapas garantem que o aplicativo **Suite Device** esteja pronto para ser executado, distribuído e publicado em ambientes de desenvolvimento e produção.
