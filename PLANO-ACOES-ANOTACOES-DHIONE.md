# Plano de ações — Anotações Dhione

Documento de origem: anotações em PDF (`Aotacoes_Dhione_e871.pdf`).

Este arquivo é **somente plano + prompt**. **Não implementar nada neste documento.** Marque os checkboxes conforme for concluindo.

---

## Como usar

1. Trabalhe **uma etapa por vez**.
2. Ao terminar a etapa, rode a seção **Validar comigo**.
3. **Pare e pergunte se está tudo ok** antes de avançar.
4. Só inicie a próxima etapa depois da confirmação explícita.

Legenda: `[ ]` pendente · `[x]` feito e validado

---

## Visão geral

| Ordem | Etapa | Tipo | Origem |
|------:|-------|------|--------|
| 1 | Copyright 2026 | Correção rápida | Anotação 1 |
| 2 | Links do banner: Saiba mais / Más información / Learn more | i18n / UI | Anotação 2 |
| 3 | TXT: remover `begin--` / `–end` e a palavra PluviDB | Correção | Anotações 3–4 |
| 4 | GOES-16 → GOES-19 | Conteúdo | Anotação 5 |
| 5 | Acento: Nível de potência | i18n | Anotação 6 |
| 6 | Label GPS: só “Intervalo de correção” | UI / i18n | Anotação 7 |
| 7 | Limites RF: 26.00 até 38.50 | Bug / validação | Anotação 8 |
| 8 | Senha inválida/vazia não pode enviar comando | Bug | Anotação 9 |
| 9 | Virgulas sumiram (RF / parse) | Bug | Anotação 10 |
| 10 | Revisão geral TSatDB (módulo “meio bugado”) | Investigação | Anotação 11 |
| 11 | Novo bloco: Terminal Serial | Feature | Bloco novo 01 |
| 12 | Novo bloco: LimniDB-RADAR (clone LimniDB-CAP) | Feature | Bloco novo 02 |

Progresso rápido:

- [x] Etapa 1 — Copyright 2026
- [x] Etapa 2 — Banner Saiba mais
- [x] Etapa 3 — Limpeza TXT (begin/end + PluviDB)
- [x] Etapa 4 — GOES-19
- [x] Etapa 5 — Nível de potência
- [ ] Etapa 6 — Intervalo de correção
- [ ] Etapa 7 — Limites 26.00–38.50
- [ ] Etapa 8 — Bloquear envio sem senha válida
- [ ] Etapa 9 — Restaurar vírgulas
- [ ] Etapa 10 — Revisão TSatDB
- [ ] Etapa 11 — Terminal Serial
- [ ] Etapa 12 — LimniDB-RADAR

---

## Etapa 1 — Atualizar copyright para 2026

**Objetivo:** nenhum texto de copyright (e datas de UI relevantes) ainda em 2025.

### Ações

- [x] Busca geral no repo por `2025` em strings de UI / locales / footer (ignorar `package-lock`, hashes e datas de libs).
- [x] Atualizar `COPYRIGHT 2025...` → `COPYRIGHT 2026...` em:
  - `src/renderer/src/components/Footer.tsx`
  - `src/locales/en/translation.json`
  - `src/locales/es/translation.json`
  - (e PT se a chave estiver hardcoded / em locale PT)
- [x] Conferir README/badges só se o time quiser alinhar ano; prioridade é o rodapé do app.

### Validar comigo

- [x] Rodapé mostra 2026 em PT / EN / ES
- [x] Busca por `COPYRIGHT 2025` no `src/` retorna zero

**Pare aqui.** Pergunte: *“Etapa 1 ok para avançar?”*

---

## Etapa 2 — Padronizar links do banner

**Objetivo:** o botão sobre a imagem do produto (hoje `Baixar Manual` em `ImageDevice.tsx`) passar a:

| Idioma | Texto |
|--------|--------|
| PT | Saiba mais |
| ES | Más información |
| EN | Learn more |

### Ações

- [x] Trocar a chave/exibição em `src/renderer/src/components/imageDevice/ImageDevice.tsx`.
- [x] Atualizar locales EN/ES (e PT se necessário).
- [x] Garantir que o `href` do produto continua o mesmo (só muda o rótulo).
- [x] Verificar em todos os dispositivos que usam `ImageDevice` (LimniDB-*, TSatDB, Teclado, PluviDB-IoT, etc.).

### Validar comigo

- [x] PT: banner mostra **Saiba mais**
- [x] ES: **Más información**
- [x] EN: **Learn more**
- [x] Clique ainda abre a página do produto

**Pare aqui.** Pergunte: *“Etapa 2 ok para avançar?”*

---

## Etapa 3 — Limpar arquivo TXT (`begin--` / `–end` e palavra PluviDB)

**Objetivo:** nos exports `.txt`, remover marcadores `begin--` e `–end` (ou variantes `--end`) e retirar a palavra **PluviDB** do conteúdo/nome onde a anotação apontar.

### Ações

- [x] Localizar quem gera o TXT com esses marcadores (provável: terminais / relatório / config save — `saveAs`, headers de arquivo).
- [x] Remover prefixo/sufixo `begin--` e `–end` do conteúdo exportado.
- [x] Remover a palavra `PluviDB` do trecho indicado (confirmar no print: nome do arquivo, primeira linha, ou corpo).
- [x] Não renomear o módulo PluviDB-IoT inteiro nesta etapa — só o que o TXT/export estiver vazando indevidamente, salvo confirmação de escopo maior.

### Validar comigo

- [x] Arquivo salvo sem `begin--` / `–end`
- [x] Sem a palavra PluviDB no trecho corrigido
- [x] Conteúdo útil (histórico/comandos) permanece

**Pare aqui.** Pergunte: *“Etapa 3 ok para avançar?”*

---

## Etapa 4 — GOES-16 → GOES-19

**Objetivo:** o satélite GOES-16 saiu; atualizar para **GOES-19**.

### Ações

- [x] Trocar `GOES-16 EAST 75W` (e similares) em UI e locales.
- [x] Arquivo principal: `src/renderer/src/components/TSatDB/components/antennapointing.tsx`
- [x] Chaves em `src/locales/en/translation.json` e `src/locales/es/translation.json`
- [x] Busca por `GOES-16` / `GOES16` no `src/`

### Validar comigo

- [x] Apontamento de antena / textos mostram GOES-19
- [x] EN/ES alinhados
- [x] Zero ocorrência de GOES-16 na UI

**Pare aqui.** Pergunte: *“Etapa 4 ok para avançar?”*

---

## Etapa 5 — Acentos: Nível de potência

**Objetivo:** corrigir o rótulo **Nível de potência** (acentos e grafia).

### Ações

- [x] Hoje aparece `Nivel de Potencia RF` (sem acentos no PT).
- [x] Padronizar para **Nível de potência** (ou **Nível de potência RF**, se mantiver o RF).
- [x] Ajustar EN/ES de forma consistente (`RF power level` / `Nivel de potencia RF` — ES já pode estar ok).
- [x] Arquivo: `src/renderer/src/components/TSatDB/components/RFAdvanced.tsx` + locales.

### Validar comigo

- [x] PT com acentos corretos
- [x] EN/ES sem regressão

**Pare aqui.** Pergunte: *“Etapa 5 ok para avançar?”*

---

## Etapa 6 — Apagar “Definir o”; deixar só “Intervalo de correção”

**Objetivo:** no GPS do TSatDB, o label azul deixa de ser “Definir o intervalo de correção” e fica só **Intervalo de correção**.

### Ações

- [x] Atualizar chave/uso em `src/renderer/src/components/TSatDB/components/gps.tsx`
- [x] Atualizar locales EN/ES (`Set correction interval` → `Correction interval`, etc.)

### Validar comigo

- [ ] Label = **Intervalo de correção** (sem “Definir o”)
- [ ] EN/ES equivalentes curtos

**Pare aqui.** Pergunte: *“Etapa 6 ok para avançar?”*

---

## Etapa 7 — Limites corretos: 26.00 até 38.50

**Objetivo:** nos campos de potência RF (100 / 300 / 1200 bps), min/max e labels passam de 32–38 para **26.00–38.50**.

### Ações

- [ ] Em `RFAdvanced.tsx`: `min={26}` `max={38.5}` (ou validação numérica equivalente).
- [ ] Atualizar textos `Min` / `Max` exibidos ao lado.
- [ ] Validar no blur/`handleBlur` para clamp ou rejeitar fora da faixa.
- [ ] Defaults (ex.: `37.00`) podem permanecer se ainda forem válidos.

### Validar comigo

- [ ] Labels mostram Min 26.00 / Max 38.50
- [ ] Valor &lt; 26 ou &gt; 38.50 não é aceito (ou é corrigido de forma clara)
- [ ] Valor dentro da faixa envia normalmente (com senha válida — etapa 8)

**Pare aqui.** Pergunte: *“Etapa 7 ok para avançar?”*

---

## Etapa 8 — Senha inválida/vazia não envia comando

**Objetivo:** com senha vazia ou diferente de `techmode alpha`, **nenhum** comando serial de potência RF pode sair (confirmado via Serial Port Monitor).

### Causa provável no código atual

Em `RFAdvanced.tsx`, `handleSendSetting` chama `validate()` (setState assíncrono) e em seguida lê `isvalidatePassword` — estado **stale**. Além disso a lógica de `validatePassword` / `isvalidatePassword` está confusa (true = inválido).

### Ações

- [ ] Validar a senha **de forma síncrona** antes de montar/enviar o array.
- [ ] Senha vazia → erro + **return** (não chama `handleSendSettings`).
- [ ] Senha ≠ `techmode alpha` → “Senha inválida” + **return**.
- [ ] Só então enviar `[TX100BPS, TX300BPS, TX1200BPS, Password]`.
- [ ] Testar com sniff no Serial Port Monitor.

### Validar comigo

- [ ] Senha vazia: UI mostra erro; **zero** bytes/comando na serial
- [ ] Senha errada: idem
- [ ] Senha correta: comando sai
- [ ] Não regressar Atualizar (leitura)

**Pare aqui.** Pergunte: *“Etapa 8 ok para avançar?”*

---

## Etapa 9 — “Sumiu com as vírgulas”

**Objetivo:** restaurar as vírgulas que sumiram na leitura/exibição dos níveis de potência (parse de `PWRLVL=` / split por `,`).

### Ações

- [ ] Revisar `loadVariables` em `RFAdvanced.tsx` e o caminho que preenche `receiverTxPowerLevel` em `TSatDB.tsx`.
- [ ] Garantir que a resposta serial com valores separados por vírgula continue sendo parseada e, se a UI/export precisar mostrar vírgulas, não stripá-las indevidamente.
- [ ] Cuidado com `toFixed(2).replace(',', '.')` no blur: não destruir o formato esperado pelo equipamento na ida/volta.
- [ ] Reproduzir com o mesmo sniff/log que mostrou o bug.

### Validar comigo

- [ ] Atualizar preenche 100/300/1200 corretamente a partir da resposta com vírgulas
- [ ] Enviar (senha ok) monta o payload no formato que o firmware espera
- [ ] Reler confirma os três valores

**Pare aqui.** Pergunte: *“Etapa 9 ok para avançar?”*

---

## Etapa 10 — Revisão geral do módulo TSatDB

**Objetivo:** a anotação diz que o TSat “está meio bugado” e a lógica ainda não estava clara. Esta etapa é **investigação + correções pontuais**, não redesign.

### Ações

- [ ] Mapear fluxos: Status, GPS, Configuração, RF Advanced, Apontamento, Terminal, Teste de transmissão.
- [ ] Listar bugs reproduzíveis restantes (além das etapas 4–9).
- [ ] Corrigir só o que for claro e validável; anotar dúvidas de protocolo para o time/hardware.
- [ ] Não inventar comandos serial sem referência.

### Validar comigo

- [ ] Lista do que foi corrigido vs. o que ficou pendente de hardware
- [ ] Smoke test: conectar, Atualizar Status, abrir RF, GPS, Terminal

**Pare aqui.** Pergunte: *“Etapa 10 ok para avançar?”*

---

## Etapa 11 — Bloco novo 01: Terminal Serial

**Objetivo:** novo módulo **Terminal Serial** (uso geral, “basicão”), com:

- escolha de **baudrate**
- **limpar** a tela
- **salvar histórico em TXT** (padrão já existente em terminais de outros produtos)

### Ações

- [ ] Novo item no menu lateral + rota/`Preview`.
- [ ] UI simples: porta COM (conector existente), baudrate, área de log, input de envio, Limpar, Salvar TXT.
- [ ] Reutilizar padrões de `Terminal` / `TSatDB/components/terminal.tsx` / `PluviDB-Iot/.../terminal.tsx` (sem amarrar nome de produto no arquivo).
- [ ] Baudrates comuns (ex.: 9600, 19200, 38400, 57600, 115200 — confirmar lista com o time).
- [ ] i18n PT/EN/ES.
- [ ] Isolar estado serial para não conflitar com outros módulos.

### Validar comigo

- [ ] Aparece no menu
- [ ] Troca de baudrate + Connect
- [ ] Enviar texto aparece no histórico
- [ ] Limpar zera a tela
- [ ] Salvar TXT com histórico e timestamp, sem marcadores `begin--`/`–end`

**Pare aqui.** Pergunte: *“Etapa 11 ok para avançar?”*

---

## Etapa 12 — Bloco novo 02: LimniDB-RADAR

**Objetivo:** novo produto **LimniDB-RADAR** = cópia do **LimniDB-CAP**, com página inicial já prevista e leituras extras na página do produto (cada leitura = mesma chamada Modbus, outros endereços). Dá para implementar sem hardware.

### Ações

- [ ] Clonar pasta/fluxo `LinnimDB-Cap` → `LimniDB-RADAR` (ou grafia alinhada ao projeto).
- [ ] Menu + `Preview` + `DeviceContext` / nomes.
- [ ] Página inicial: textos/imagem/link do produto (usar as informações já disponíveis; placeholder se faltar asset).
- [ ] Página conectada: espelhar CAP; adicionar leituras extras como repetições Modbus com endereços novos (**não inventar** — usar a lista de registradores fornecida / a confirmar).
- [ ] Manter isolamento de estado vs LimniDB-CAP / Borbulha.
- [ ] i18n das strings novas.

### Validar comigo

- [ ] Menu: LimniDB-RADAR e LimniDB-CAP coexistem
- [ ] Offline: home + abas ok
- [ ] Offline/mock: campos de leitura extras visíveis
- [ ] CAP não regressou

**Dúvida em aberto:** lista exata dos registradores Modbus extras do RADAR — bloquear envio de valores inventados até receber o mapa.

**Pare aqui.** Esta é a última etapa do plano. Confirme: *“Etapa 12 ok — plano concluído?”*

---

## Fora de escopo

- Servidor de atualização / auto-update no domínio Dualbase (removido deste plano a pedido).
- Redesign geral da sidebar.
- Alterar firmware dos equipamentos.
- O plano antigo `PLANO-ACOES-26AGO2026.md` (toast i18n, HTTP PluviDB, PCD, etc.) — **não misturar** nesta execução, salvo pedido explícito.

## Dúvidas em aberto

1. **Etapa 3 — PluviDB no TXT:** só no export de um módulo específico ou varredura ampla?
2. **Etapa 11 — baudrates:** lista oficial desejada?
3. **Etapa 12 — registradores Modbus** do LimniDB-RADAR.

---

# Prompt para executar amanhã

Copie e cole o bloco abaixo no chat do agente (Cursor) quando for implementar. Ele obriga confirmação entre etapas.

```text
Você vai EXECUTAR o plano em PLANO-ACOES-ANOTACOES-DHIONE.md (origem: anotações Dhione).

REGRAS OBRIGATÓRIAS:
1. Implemente STRICTAMENTE uma etapa por vez, na ordem 1 → 12.
2. Ao concluir cada etapa: mostre o que mudou, como testar, e PERGUNTE explicitamente:
   “Etapa N concluída. Está tudo ok para eu avançar para a etapa N+1?”
3. NÃO comece a próxima etapa até eu responder que está ok (sim / pode / ok / avance).
4. Se eu pedir ajuste na etapa atual, corrija só ela e pergunte de novo.
5. Não misture o plano antigo PLANO-ACOES-26AGO2026.md, a menos que eu peça.
6. Não invente endereços Modbus ou comandos serial — se faltar dado, pare e pergunte.
7. Não inclua servidor de update / auto-update (fora de escopo).
8. Commit/push por etapa (ou por grupo só se eu autorizar).
9. Antes de codar a Etapa 1, confirme que leu o arquivo do plano e liste só o objetivo da Etapa 1.

Comece agora pela Etapa 1 (Copyright 2026). Ao terminar, pare e pergunte se está ok.
```

### Mini-prompts por etapa (opcional)

Se preferir colar uma etapa por dia:

**Etapa 1**
```text
Execute só a Etapa 1 de PLANO-ACOES-ANOTACOES-DHIONE.md. Ao terminar, pergunte se está ok antes de qualquer outra etapa.
```

**Etapa 2+** (troque N)
```text
A etapa N-1 foi validada. Execute só a Etapa N de PLANO-ACOES-ANOTACOES-DHIONE.md. Ao terminar, pergunte se está ok para a próxima.
```

---

*Quando for executar, comece pela etapa 1 e confirme comigo antes da 2.*
