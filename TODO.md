# Melhorias — atualização automática

## Concluído

- [x] **Remover HTML das notificações de atualização** — diálogo com texto fixo (versão + pergunta se deseja instalar).
- [x] **Verificar atualização somente após abrir o aplicativo** — removido `checkForUpdates` no arranque imediato; verificação ~2,5 s após a janela estar visível (produção). Manual em Sobre continua disponível.
- [x] **Exibir porcentagem durante o download** — janela modal com `%` e MB transferidos (`download-progress`).
- [x] **Mensagem durante a instalação / reinício** — diálogo antes de `quitAndInstall` explicando tempo de espera e para não reabrir a app.
- [x] **Evitar erro da porta 3000** — `requestSingleInstanceLock`, fecho do servidor HTTP antes de instalar, mensagem clara se a porta estiver em uso (`EADDRINUSE`).

## Referência técnica

- `src/main/index.ts` — eventos `autoUpdater`, instância única, servidor local
- `electron-builder.yml` + `scripts/publish-win.cjs` — build/publicação NSIS
- `scripts/patch-nsis-windows.cjs` — contorno `spawn EPERM` no Windows
