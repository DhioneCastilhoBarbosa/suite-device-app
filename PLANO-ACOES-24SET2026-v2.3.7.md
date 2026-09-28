# Plano de ações — Suite Device 2.3.7 (24 set)

Documento de origem: `Detalhes_do_Suite_Device_2.3.7_24set` (PDF com prints).

Este arquivo é **só o plano**. **Não executar as etapas em sequência sem você validar a etapa anterior.** Em cada etapa o agente pergunta antes de avançar.

**Resolução-alvo do cliente:** notebook 14" = **1366×768**. Toda correção de layout deve ser validada nessa resolução (não só em Full HD).

---

## Como usar

1. Trabalhe **uma etapa por vez**.
2. Ao terminar a implementação, rode os testes da seção **Validar comigo**.
3. Só avance depois de você confirmar que está ok.
4. Layout 1366×768 vem **primeiro** (maior impacto no uso diário). i18n em seguida. Mudança de produto (HTTP Segurança) por último.

Legenda: `[ ]` pendente · `[x]` feito e validado

---

## Visão geral

| Ordem | Etapa | Tipo | Origem |
|------:|-------|------|--------|
| 1 | Layout base 1366×768 (janela + overflow + sidebar) | Usabilidade / crítico | Detalhe 1 (+ base do 2) |
| 2 | Quadro de leitura LimniDB-BORBULHA cortado | Usabilidade | Detalhe 2 |
| 3 | Porta COM presa ao clicar PARAR + botões bloqueados | Bug funcional | Detalhe 3 |
| 4 | TSatDB Configurações — textos em PT no EN/ES | i18n | Detalhe 4 |
| 5 | Descritivos das abas em espanhol (caixa alta/baixa) | i18n | Detalhe 5 |
| 6 | PluviDB-IoT Dados Instantâneos — linha em PT | i18n | Detalhe 6 |
| 7 | PluviDB-IoT Atualização de firmware — linhas em PT | i18n | Detalhe 7 |
| 8 | Botão “Baixar selecionado” no modal de relatórios (EN/ES) | i18n | Detalhes 8 e 9 |
| 9 | HTTP Segurança igual a FTP/MQTT | Mudança de produto | 1ª Mudança |

Progresso rápido:

- [ ] Etapa 1 — Layout base 1366×768
- [ ] Etapa 2 — LimniDB-BORBULHA leitura
- [ ] Etapa 3 — Liberar COM no PARAR
- [ ] Etapa 4 — TSatDB i18n
- [ ] Etapa 5 — Descritivos ES
- [ ] Etapa 6 — Instantâneos i18n
- [ ] Etapa 7 — Firmware update i18n
- [ ] Etapa 8 — Baixar selecionado
- [ ] Etapa 9 — HTTP Segurança

---

## Diagnóstico técnico (por que 1366×768 quebra)

Achados no código atual — **não são a correção ainda**, só o mapa:

1. **Janela Electron** (`src/main/index.ts`): `height: 800`, `minHeight: 800`. A tela do cliente tem **768 px de altura**. A janela já nasce maior que o monitor → conteúdo e chrome do SO competem; a app “corta”.
2. **CSS global** (`src/renderer/src/index.css`): `* { overflow: hidden; }` impede scroll em praticamente tudo. Em altura insuficiente, painéis se sobrepõem em vez de rolar.
3. **Sidebar** (`Menu.tsx`): largura fixa `w-52`, `max-h-screen`, `justify-between` com lista de dispositivos em cima e `Conector` embaixo. Em ~768 px de altura útil (menos header), lista + COM colidem / sobrepõem (Detalhe 1).
4. **LimniDB-BORBULHA** (`LinnimDbBorbulha.tsx` + `settings.tsx` + `measure.tsx`): Configurações empilha Settings + Leitura com `mt-28`, larguras fixas (`w-52`/`w-48`) e sem área rolável confiável → quadro de **Leitura** some na parte inferior (Detalhe 2).
5. **PARAR** (`loading.tsx` → `Conector.handleStop` → `cancelConnection` em `modbusRTU.tsx`): `cancelConnection` só seta `cancelScan = true` e **não fecha** o client RTU (`hardCloseClient`). A COM fica presa; tentativa seguinte pode abrir a tela com estado inconsistente e botões de Atualização/Medição bloqueados (Detalhe 3).
6. **“Baixar selecionado”** (`modalSaveReport.tsx`): usa `t('Baixar selecionado')`, mas **não há chave** em `en`/`es` → cai no PT (Detalhes 8 e 9).
7. **HTTP Segurança**: no `main` atual o botão HTTP ainda não aparece em `transmition.tsx` (só FTP/MQTT). O PDF 2.3.7 pede alinhar o campo **Segurança** do HTTP ao padrão visual/opções de FTP e MQTT. Na execução da etapa 9 confirmar se o HTTP já existe na branch/release 2.3.7 ou se precisa ser incluído junto.

---

## Etapa 1 — Layout base para 1366×768 (sidebar sem sobreposição)

**Objetivo:** em 1366×768, o painel lateral de dispositivos **não sobrepõe** o conteúdo nem o bloco da porta COM; a janela cabe na tela do cliente.

**Por que esta etapa primeiro:** o Detalhe 1 é o mais visível no uso diário; o Detalhe 2 (corte de leitura) depende do mesmo eixo altura/overflow. Corrigir a base evita retrabalho na etapa 2.

### Ações propostas

- [ ] Ajustar tamanho mínimo da janela para caber em 1366×768 (ex.: `minWidth` ≤ 1366, `minHeight` ≤ ~700–720, considerando barra do SO). Preferir abrir maximizado ou com altura baseada em `screen.getPrimaryDisplay().workAreaSize`.
- [ ] Revisar `* { overflow: hidden }` — restringir overflow só onde for necessário (body/root), permitindo scroll nas áreas de conteúdo e na sidebar.
- [ ] Tornar a sidebar (`Menu.tsx`) scrollável: lista de dispositivos com `overflow-y-auto` + `Conector` sempre visível/fixinado sem sobrepor a lista.
- [ ] Garantir que `Main` / `Preview` / `ContainerDevice` usem `min-h-0` / altura flexível para o conteúdo central rolar em vez de empurrar a sidebar.
- [ ] Validar visualmente em **1366×768** (DevTools device mode ou janela redimensionada).

### Arquivos sugeridos

- `src/main/index.ts`
- `src/renderer/src/index.css`
- `src/renderer/src/components/Main.tsx`
- `src/renderer/src/components/Menu.tsx`
- `src/renderer/src/components/containerDevice/containerDevice.tsx`
- `src/renderer/src/App.tsx` / `Header.tsx` (altura do header fixo)

### Validar comigo (não avance sem isto)

Em resolução **1366×768** (ou janela redimensionada para isso):

- [ ] Janela abre inteira na tela (sem corte pelo SO)
- [ ] Lista de dispositivos e bloco COM **não se sobrepõem**
- [ ] É possível rolar a lista se faltar altura
- [ ] Conteúdo central de um dispositivo qualquer não “invade” a sidebar
- [ ] Teste rápido em Full HD: nada regressou

**Pare aqui.** Me avise o resultado. Só depois a etapa 2.

---

## Etapa 2 — Quadro de leitura LimniDB-BORBULHA cortado

**Objetivo:** em Configurações do LimniDB-BORBULHA, o bloco **Leitura** (Pressão + Medir) fica totalmente visível em 1366×768.

### Ações propostas

- [ ] Revisar empilhamento Settings + Measure em `LinnimDbBorbulha.tsx` (menos `mt-28` rígido; padding/altura adaptativos).
- [ ] Permitir scroll vertical na área de configuração quando a altura for insuficiente.
- [ ] Reduzir/ajustar larguras fixas e gaps que empurram o quadro de leitura para fora da viewport.
- [ ] Conferir LimniDB-CAP / RADAR se compartilham o mesmo padrão (evitar o mesmo bug lá).

### Arquivos sugeridos

- `src/renderer/src/components/LinnimDB-Borbulha/LinnimDbBorbulha.tsx`
- `src/renderer/src/components/LinnimDB-Borbulha/components/settings.tsx`
- `src/renderer/src/components/LinnimDB-Borbulha/components/measure.tsx`

### Validar comigo

Em **1366×768**, LimniDB-BORBULHA → Configurações:

- [ ] Campos de config + quadro **Leitura** visíveis (ou acessíveis por scroll sem corte)
- [ ] Botões Baixar / Enviar usáveis
- [ ] Medir permanece funcional

**Pare aqui.** Me avise o resultado. Só depois a etapa 3.

---

## Etapa 3 — Porta COM presa ao PARAR + botões bloqueados

**Objetivo:** ao clicar **PARAR** durante “Procurando dispositivo”, a porta COM é liberada imediatamente; nova tentativa funciona; Atualização e Medição não ficam bloqueados.

### Ações propostas

- [ ] Em `cancelConnection` / `handleStop`: além de `cancelScan = true`, **fechar** o client Modbus (`hardCloseClient` / `CloseModBus`) e limpar flags (`busy`, `PortOpen`, modo offline/conectado).
- [ ] Garantir que o fluxo assíncrono de `connectClient` / `scanNextAddress` respeite o cancelamento e não reabra a porta depois do PARAR.
- [ ] Resetar estado de UI que desabilita botões de Atualização/Medição após cancelamento ou falha de reconhecimento.
- [ ] Evitar que, “depois de um tempo”, a tela de teste abra sozinha com botões travados (race do scan cancelado).

### Arquivos sugeridos

- `src/renderer/src/utils/modbusRTU.tsx`
- `src/renderer/src/components/conector/Conector.tsx`
- `src/renderer/src/components/loading/loading.tsx`
- Contextos de device/port se necessário (`DeviceContext.tsx`)

### Validar comigo

1. Selecionar COM → Conectar → no loading, clicar **PARAR**.
2. Conferir:
   - [ ] Porta COM liberada (outro software / nova tentativa no Suite Device consegue abrir)
   - [ ] Loading some; estado “conectado” não fica preso
3. Conectar de novo com sucesso:
   - [ ] Atualização e Medição habilitados quando o device responde
4. Caso “nenhum dispositivo”:
   - [ ] Após PARAR ou modal de “não encontrado”, COM livre e UI consistente

**Pare aqui.** Me avise o resultado. Só depois a etapa 4.

---

## Etapa 4 — TSatDB Configurações: textos em PT no EN/ES

**Objetivo:** todas as linhas do quadro Configurações do TSatDB respeitam o idioma da interface.

### Ações propostas

- [ ] Auditar strings hardcoded em PT nos componentes de configuração do TSatDB.
- [ ] Envolver com `t(...)` e adicionar chaves em `en` e `es`.
- [ ] Revisar labels/toasts irmãos na mesma aba.

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/**` (settings / RF / etc.)
- `src/locales/en/translation.json`
- `src/locales/es/translation.json`

### Validar comigo

- [ ] Idioma English: Configurações 100% EN
- [ ] Idioma Español: Configurações 100% ES
- [ ] Português intacto

**Pare aqui.**

---

## Etapa 5 — Descritivos das abas em espanhol (caixa)

**Objetivo:** nos descritivos de produto (visão geral / características / especificação) em **español**, o casing fica consistente com PT e EN (hoje ES mistura maiúsculas/minúsculas; PT/EN estão em maiúsculo).

### Ações propostas

- [ ] Localizar os textos de descrição por dispositivo (provavelmente `CardInformation` / blocos `VISÃO GERAL` etc.).
- [ ] Padronizar as traduções ES (uppercase como PT/EN **ou** aplicar `uppercase` via CSS em todos os idiomas — preferir uma única regra).
- [ ] Conferir todos os dispositivos da sidebar.

### Arquivos sugeridos

- Componentes `information` / `cardInfomation` por dispositivo
- `src/locales/es/translation.json`

### Validar comigo

- [ ] Em ES, descritivos com o mesmo padrão de caixa que PT/EN
- [ ] EN e PT sem regressão

**Pare aqui.**

---

## Etapa 6 — PluviDB-IoT Dados Instantâneos: linha em PT

**Objetivo:** nenhuma linha do quadro Dados Instantâneos fica em português quando o idioma é EN ou ES.

### Ações propostas

- [ ] Auditar labels em `intantData.tsx` (e fontes de `item.name`).
- [ ] Candidato forte: `Totalização a cada 60 segundos` e chaves de chuva/bateria — garantir entradas EN/ES.
- [ ] Se o estado inicial chama `t()` só no mount, garantir re-render ao trocar idioma (`i18n.language`).

### Arquivos sugeridos

- `src/renderer/src/components/PluviDB-Iot/components/intantData.tsx`
- locales EN/ES

### Validar comigo

- [ ] EN: zero PT na tabela de instantâneos
- [ ] ES: zero PT
- [ ] Troca de idioma a quente atualiza os rótulos

**Pare aqui.**

---

## Etapa 7 — PluviDB-IoT atualização de firmware: linhas em PT

**Objetivo:** tela de atualização de firmware 100% traduzida em EN/ES.

### Ações propostas

- [ ] Auditar `PluviDB-Iot/components/update.tsx` (e fluxos irmãos se compartilhados).
- [ ] Traduzir strings soltas; adicionar chaves faltantes.

### Arquivos sugeridos

- `src/renderer/src/components/PluviDB-Iot/components/update.tsx`
- locales EN/ES

### Validar comigo

- [ ] EN e ES sem PT na aba/fluxo de firmware
- [ ] PT intacto

**Pare aqui.**

---

## Etapa 8 — “Baixar selecionado” no Collect Reports / Recopilar Informes

**Objetivo:** no modal após Coletar relatórios, o botão deixa de aparecer em português no EN/ES.

### Ações propostas

- [ ] Adicionar `"Baixar selecionado"` (e variantes próximas: Baixar todos, Baixando...) em `en` e `es`.
- [ ] Revisar o modal inteiro (`modalSaveReport.tsx`) por outras strings sem tradução.

### Arquivos sugeridos

- `src/renderer/src/components/modal/modalSaveReport.tsx`
- `src/locales/en/translation.json`
- `src/locales/es/translation.json`

### Validar comigo

- [ ] EN → Collect Reports → botão traduzido
- [ ] ES → Recopilar Informes → botão traduzido
- [ ] Demais botões do modal também traduzidos

**Pare aqui.**

---

## Etapa 9 — Mudança: Segurança HTTP igual a FTP/MQTT

**Objetivo:** em PluviDB-IoT → Configuração → Transmissão → **HTTP**, o campo **Segurança** fica visualmente e semanticamente alinhado a FTP e MQTT (três protocolos consistentes).

### Pré-checagem antes de codar

- [ ] Confirmar no código da branch/release se o bloco HTTP já existe (no `main` atual só há FTP/MQTT em `transmition.tsx`). Se não existir, incluir HTTP + Segurança alinhada nesta etapa.
- [ ] Confirmar com você o mapa exato de opções (FTP hoje: ssl / tls / Nenhuma; MQTT: tls / Nenhuma). HTTP deve seguir o mesmo padrão de controles (radios), não um combobox diferente — conforme o PDF.

### Ações propostas

- [ ] Uniformizar UI do campo Segurança (radios + labels) entre HTTP, FTP e MQTT.
- [ ] Manter compatibilidade com os valores que o firmware espera (`null` / `tls` / `ssl` / etc.).
- [ ] Traduções PT/EN/ES dos novos rótulos, se houver.
- [ ] Não regressar gravar/ler `http=` / `ftp=` / `mqtt=`.

### Arquivos sugeridos

- `src/renderer/src/components/PluviDB-Iot/components/setting-conponents/transmition.tsx`
- `src/renderer/src/components/PluviDB-Iot/PluviDBIot.tsx` (comandos)
- locales

### Validar comigo

- [ ] HTTP / FTP / MQTT: Segurança com o mesmo padrão visual
- [ ] Ler e gravar config HTTP ok
- [ ] FTP e MQTT sem regressão
- [ ] EN/ES ok

**Pare aqui.** Última etapa deste documento.

---

## Fora de escopo deste plano

- Itens do plano antigo `PLANO-ACOES-26AGO2026.md` que **não** estão neste PDF 2.3.7 (toast COM, PCD nova, temperatura CAP, etc.), salvo se você pedir para fundir os planos.
- Publicar release / bump de versão.
- Redesign geral de marca ou de dispositivos não citados.

## Dúvidas em aberto (confirmar na execução)

1. **minHeight da janela:** reduzir para ~700 e abrir maximizado em notebooks, ou só permitir resize livre abaixo de 800?
2. **HTTP:** já está na build 2.3.7 do cliente e só falta alinhar Segurança, ou ainda precisa ser implementado do zero neste repo?
3. **Descritivos ES (etapa 5):** forçar `UPPERCASE` via CSS em todos os idiomas, ou só corrigir as strings ES no JSON?

---

*Quando for executar, comece pela **etapa 1** e confirme comigo antes da 2.*
