# Próximas melhorias — atualização automática

## Prioridade

- [ ] **Verificar atualização somente após abrir o aplicativo**  
  Hoje o `checkForUpdates` também roda no arranque (`app.on('ready')`). Remover ou adiar essa verificação automática e manter apenas o fluxo manual (menu/botão) ou um prompt discreto depois da janela estar visível.

- [ ] **Exibir porcentagem durante o download da nova versão**  
  Usar o evento `download-progress` do `electron-updater` (`percent`, `transferred`, `total`) e mostrar barra ou texto na UI (toast, modal ou barra no header) enquanto `autoUpdater.downloadUpdate()` estiver em curso.

- [ ] **Mensagem durante a instalação / reinício**  
  Após `quitAndInstall`, a app fecha e o instalador NSIS demora — o utilizador não sabe o que está a acontecer. Mostrar diálogo antes de fechar (“A instalar a versão X… não abra a app até concluir”) e/ou splash/atalho que explique a espera.

- [ ] **Evitar erro da porta 3000 ao abrir durante a atualização**  
  O servidor Express na porta `3000` mantém o processo ativo e bloqueia o instalador; se o utilizador abrir a app a meio da instalação, aparece conflito. Garantir `shutdownAppForUpdate()` fecha o HTTP server; considerar lock file, verificação de instância única ou mensagem clara se a porta já estiver em uso.

## Referência técnica

- `src/main/index.ts` — eventos `autoUpdater` (`update-available`, `download-progress`, `update-downloaded`, `error`)
- `electron-builder.yml` + `scripts/publish-win.cjs` — build/publicação NSIS
- `scripts/patch-nsis-windows.cjs` — contorno `spawn EPERM` no Windows
