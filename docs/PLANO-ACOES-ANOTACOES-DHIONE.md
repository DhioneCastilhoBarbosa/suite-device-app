# Plano de ações — Anotações Dhione

Documento de origem: anotações PDF (`Aotacoes_Dhione`).

Este arquivo é **apenas o plano**. Não implementar nada sem o prompt de execução e a confirmação etapa a etapa.

---

## Como usar

1. Trabalhe **uma etapa por vez**.
2. Ao terminar a etapa, rode os itens de **Validar comigo**.
3. Só avance depois de confirmar que está ok.
4. Itens ambíguos ou dependentes de hardware ficam no final (etapas 11–13).

Legenda:

- `[ ]` pendente
- `[x]` feito e validado

---

## Visão geral

| Ordem | Etapa | Tipo | Anotação |
|------:|-------|------|----------|
| 1 | Copyright 2026 | Correção rápida | Atualizar datas 2025 → 2026 |
| 2 | Links do banner | Padronização i18n | Saiba mais / Más información / Learn more |
| 3 | Limpeza do TXT | Correção | Retirar `begin--` e `--end` |
| 4 | Remover palavra PluviDB | Naming / copy | Onde a anotação pedir (UI/exports) |
| 5 | GOES-16 → GOES-19 | Correção | Só atualizar o número |
| 6 | Acentos “Nível de potência” | i18n / copy | Corrigir acentuação |
| 7 | Label GPS “Intervalo de correção” | UI | Apagar “Definir o” |
| 8 | Limites RF 26.00–38.50 | Correção | Trocar limites atuais |
| 9 | Senha inválida não envia comando | Bug | Bloquear TX com senha vazia/inválida |
| 10 | Virgulas sumindo no TXT/terminal | Bug | Parar de strippar `,` |
| 11 | Bloco novo — Terminal Serial | Feature | Baudrate + limpar + salvar histórico |
| 12 | Bloco novo — LimniDB-RADAR | Feature | Clone do LimniDB-CAP + Modbus extra |
| 13 | TSAT + servidor de update | Investigação | Bug TSAT + domínio próprio de update |

Progresso rápido:

- [ ] Etapa 1 — Copyright 2026
- [ ] Etapa 2 — Banner “Saiba mais”
- [ ] Etapa 3 — TXT sem begin/end
- [ ] Etapa 4 — Remover PluviDB (escopo combinado)
- [ ] Etapa 5 — GOES-19
- [ ] Etapa 6 — Acentos potência
- [ ] Etapa 7 — Intervalo de correção
- [ ] Etapa 8 — Limites RF
- [ ] Etapa 9 — Gate de senha serial
- [ ] Etapa 10 — Vírgulas no TXT
- [ ] Etapa 11 — Terminal Serial geral
- [ ] Etapa 12 — LimniDB-RADAR
- [ ] Etapa 13 — TSAT + update server (investigar / documentar)

---

## Etapa 1 — Atualizar copyright para 2026

**Objetivo:** nenhuma string de copyright / ano de UI ainda mostrar 2025 onde deveria ser 2026.

### Ações

- [ ] Busca geral por `2025` (UI, locales, About, Footer, textos de export).
- [ ] Atualizar o que for **copyright / ano exibido ao usuário** para `2026`.
- [ ] Não alterar datas históricas de commits, changelogs antigos ou nomes de arquivo de evidência, a menos que façam parte da UI.

### Arquivos sugeridos

- `src/renderer/src/components/Footer.tsx`
- `src/locales/en/translation.json`
- `src/locales/es/translation.json`
- (e qualquer outro hit de busca por `2025` na UI)

### Validar comigo

- [ ] Footer / About mostram **2026**
- [ ] EN e ES também com 2026
- [ ] Busca residual: nenhum copyright 2025 restante na UI

**Pare aqui.** Confirmar ok antes da etapa 2.

---

## Etapa 2 — Padronizar links do banner

**Objetivo:** o CTA do banner/manual usar exatamente:

| Idioma | Texto |
|--------|-------|
| PT | Saiba mais |
| ES | Más información |
| EN | Learn more |

Hoje o CTA parece ser `Baixar Manual` → URL do produto (`ImageDevice.tsx`).

### Ações

- [ ] Trocar o rótulo do CTA do banner para a tríade acima (PT/EN/ES).
- [ ] Manter o link apontando para a página do produto (comportamento atual), só padronizar o texto.
- [ ] Conferir todos os dispositivos que usam `ImageDevice` / banner.

### Arquivos sugeridos

- `src/renderer/src/components/imageDevice/ImageDevice.tsx`
- `src/locales/en/translation.json`
- `src/locales/es/translation.json`
- Páginas de produto: LimniDB-CAP/BORBULHA, TSatDB, PluviDB-IoT, Teclado, etc.

### Validar comigo

- [ ] PT: **Saiba mais**
- [ ] ES: **Más información**
- [ ] EN: **Learn more**
- [ ] Clique ainda abre a URL correta do produto

**Pare aqui.** Confirmar ok antes da etapa 3.

---

## Etapa 3 — Retirar `begin--` e `--end` do arquivo TXT

**Objetivo:** exports `.txt` sem marcadores `begin--` / `--end` (ou variantes `–end`).

No código atual esses marcadores **podem não existir mais**; a etapa é confirmar e limpar se ainda aparecerem em algum fluxo de export (Terminal, TSat, Pluvi, remoto, etc.).

### Ações

- [ ] Buscar `begin--`, `--end`, `–end`, `begin`/`end` em exports.
- [ ] Remover marcadores onde ainda existirem.
- [ ] Garantir que o TXT continue legível (header + conteúdo).

### Arquivos sugeridos

- Terminais e saves: `Terminal/Terminal.tsx`, `TSatDB/components/terminal.tsx`, `PluviDB-Iot/components/terminal.tsx`, `PluviDBIotRemote.tsx`, handlers em `src/main/`

### Validar comigo

- [ ] Salvar TXT em pelo menos Terminal e um módulo de produto
- [ ] Arquivo **sem** `begin--` / `--end`
- [ ] Conteúdo útil preservado

**Pare aqui.** Confirmar ok antes da etapa 4.

---

## Etapa 4 — Retirar a palavra PluviDB

**Objetivo:** cumprir a anotação “Retirar a palavra PluviDB” no escopo combinado.

> **Atenção:** o módulo oficial **PluviDB-IoT** ainda existe no app. Antes de executar, confirmar se a anotação se refere a:
>
> A) só textos/exports de um fluxo específico (ex.: clone PCD / relatório), ou  
> B) renomear/ocultar “PluviDB” em telas novas, ou  
> C) algo pontual visto no print do PDF.
>
> Sem essa confirmação, **não** renomear o produto PluviDB-IoT inteiro.

### Ações (após confirmar escopo)

- [ ] Listar ocorrências visíveis ao usuário (menu, headers, nomes de `.txt`, relatórios, toasts).
- [ ] Remover/substituir apenas no escopo combinado.
- [ ] Não quebrar rotas internas / pasta `PluviDB-Iot` sem necessidade.

### Validar comigo

- [ ] Escopo A/B/C confirmado por escrito
- [ ] Busca na UI do escopo: zero “PluviDB” indesejado
- [ ] PluviDB-IoT original (se permanecer) intacto

**Pare aqui.** Confirmar ok antes da etapa 5.

---

## Etapa 5 — GOES-16 → GOES-19

**Objetivo:** onde aparece GOES-16, atualizar para GOES-19.

### Ações

- [ ] Trocar label em apontamento de antena / locales (`GOES-16 EAST 75W` → equivalente GOES-19).
- [ ] Revisar textos de especificação TSat que citem GOES-16.

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/components/antennapointing.tsx`
- locales EN/ES
- `TSatDB/TSatDB.tsx` (se a copy de marketing citar o satélite)

### Validar comigo

- [ ] UI mostra GOES-19
- [ ] EN/ES atualizados
- [ ] Nenhuma referência de UI restante a GOES-16 (salvo docs históricos fora do app)

**Pare aqui.** Confirmar ok antes da etapa 6.

---

## Etapa 6 — Acentos: “Nível de potência”

**Objetivo:** português correto com acentos (ex.: **Nível de potência**), alinhado ao que a UI mostra hoje como algo perto de `Nivel de Potencia RF`.

### Ações

- [ ] Corrigir chave/string PT (e revisar ES se necessário).
- [ ] Manter EN (`RF Power Level` ou equivalente) coerente.
- [ ] Conferir outros rótulos de potência RF no TSat sem acento.

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/components/RFAdvanced.tsx`
- `src/locales/en/translation.json`
- `src/locales/es/translation.json`

### Validar comigo

- [ ] PT: “Nível de potência” (ou “Nível de potência RF”, se o “RF” fizer parte do rótulo)
- [ ] EN/ES ok
- [ ] Tela RF Advanced sem regressão visual

**Pare aqui.** Confirmar ok antes da etapa 7.

---

## Etapa 7 — Apagar “Definir o”; deixar “Intervalo de correção”

**Objetivo:** no GPS do TSat, o rótulo azul/errado some; fica só **Intervalo de correção**.

Hoje: `Definir o intervalo de correção`.

### Ações

- [ ] Alterar string para `Intervalo de correção` (PT) e equivalentes EN/ES sem o “Definir o / Set / Definir el” se a anotação pedir só o nome do campo.
- [ ] Manter o valor/campo como está (hoje read-only `00:00:00`), salvo outra anotação.

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/components/gps.tsx`
- locales

### Validar comigo

- [ ] Label = **Intervalo de correção** (sem “Definir o”)
- [ ] EN/ES alinhados
- [ ] Layout GPS ok

**Pare aqui.** Confirmar ok antes da etapa 8.

---

## Etapa 8 — Limites corretos: 26.00 até 38.50

**Objetivo:** faixa de potência RF = **mín 26.00** e **máx 38.50**.

Hoje no código: min 32 / max 38 (defaults ~37.00).

### Ações

- [ ] Atualizar validação min/max para `26.00` e `38.50`.
- [ ] Atualizar labels Min/Max na UI.
- [ ] Revisar default se ficar fora da nova faixa.
- [ ] Garantir formatação com duas casas decimais.

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/components/RFAdvanced.tsx`

### Validar comigo

- [ ] UI mostra Min **26.00** e Max **38.50**
- [ ] Valor &lt; 26.00 ou &gt; 38.50 é rejeitado
- [ ] Valor dentro da faixa ainda envia (quando senha válida — etapa 9)

**Pare aqui.** Confirmar ok antes da etapa 9.

---

## Etapa 9 — Senha inválida/vazia não pode enviar comando

**Objetivo:** com senha vazia ou inválida, **nenhum** comando serial de potência/RF pode sair na porta (bug confirmado no Serial Port Monitor).

### Ações

- [ ] Revisar gate em `RFAdvanced.tsx` e o fluxo `handleSendTxSettings` em `TSatDB.tsx`.
- [ ] Bloquear envio se senha vazia ou diferente da esperada.
- [ ] Feedback claro ao usuário (toast/mensagem), sem TX.
- [ ] Se possível, adicionar guarda também no ponto único que chama `sendCommandTSatDB` para esse fluxo.

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/components/RFAdvanced.tsx`
- `src/renderer/src/components/TSatDB/TSatDB.tsx`
- `src/renderer/src/utils/serial.tsx` (só se o gate precisar subir de camada)

### Validar comigo

- [ ] Senha vazia → **zero** bytes de comando na serial (sniff / log)
- [ ] Senha errada → idem
- [ ] Senha correta → comando segue
- [ ] UI avisa o usuário

**Pare aqui.** Confirmar ok antes da etapa 10.

---

## Etapa 10 — Vírgulas sumindo

**Objetivo:** linhas/dados com vírgula preservam `,` na tela e no TXT salvo.

Causa provável: `.join('').replace(/,/g, '')` em terminais/exports TSat/Pluvi.

### Ações

- [ ] Remover ou corrigir o strip de vírgulas nos displays/saves afetados.
- [ ] Testar save TXT e visualização ao vivo.
- [ ] Não quebrar parsers que realmente esperam CSV sem campo vazio (Teclado tem lógica própria — não misturar).

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/components/terminal.tsx`
- `src/renderer/src/components/TSatDB/components/settings.tsx`
- `src/renderer/src/components/PluviDB-Iot/components/terminal.tsx`

### Validar comigo

- [ ] Linha com vírgulas aparece completa no terminal
- [ ] TXT salvo mantém as vírgulas
- [ ] TSat settings save ok
- [ ] Pluvi terminal save ok

**Pare aqui.** Confirmar ok antes da etapa 11.

---

## Etapa 11 — Bloco novo 01: Terminal Serial (uso geral)

**Objetivo:** terminal serial básico, independente de produto específico, com:

1. Escolha de **baudrate**
2. **Limpar** tela
3. **Salvar histórico** em TXT (padrão já usado em outros produtos)

### Ações

- [ ] Definir onde entra no menu (ex.: “Terminal Serial” ao lado do Terminal SDI-12).
- [ ] UI: seletor de porta + baudrate (lista usual: 1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200 — confirmar lista com o time).
- [ ] Área de log + limpar + salvar TXT.
- [ ] Abrir/fechar porta com o baud escolhido (hoje o baud do conector é fixo por produto).
- [ ] i18n PT/EN/ES.

### Arquivos sugeridos

- Novo componente sob `src/renderer/src/components/`
- `Menu.tsx`, `Preview.tsx`, `Conector.tsx` / serial utils
- Referência de save/clear: `Terminal/Terminal.tsx`, terminais TSat/Pluvi

### Validar comigo

- [ ] Menu abre o Terminal Serial
- [ ] Baudrate selecionável e aplicado na conexão
- [ ] Limpar zera a tela
- [ ] Salvar gera TXT utilizável
- [ ] Não quebra Terminal SDI-12 nem terminais embutidos

**Pare aqui.** Confirmar ok antes da etapa 12.

---

## Etapa 12 — Bloco novo 02: LimniDB-RADAR

**Objetivo:** novo produto espelhando **LimniDB-CAP**.

- Página inicial: já há informações (usar o material disponível).
- Página específica: leituras extras = **mesma chamada Modbus**, outros endereços (repetição do padrão CAP).
- Dá para implementar sem hardware, desde que os endereços estejam documentados.

### Ações

- [ ] Clonar estrutura de `LinnimDB-Cap/` → `LimniDB-RADAR` (nome de pasta/componente alinhado ao time).
- [ ] Menu + rota + conector/baud iguais ao CAP, salvo diferença documentada.
- [ ] Página desconectada: VISÃO GERAL / CARACTERÍSTICAS / ESPECIFICAÇÃO + banner com “Saiba mais”.
- [ ] Leituras extras: replicar padrão Modbus do CAP com novos endereços (lista a confirmar).
- [ ] i18n PT/EN/ES; **não** reutilizar textos “CAP” na UI do RADAR.

### Arquivos sugeridos

- Referência: `src/renderer/src/components/LinnimDB-Cap/`
- `Menu.tsx`, `Preview.tsx`, `Conector.tsx`
- `utils/modbusRTU.tsx`
- locales

### Pré-requisito antes de codar

- [ ] Lista de endereços Modbus do RADAR
- [ ] Copy/imagens da página inicial
- [ ] URL do manual / “Saiba mais”

### Validar comigo

- [ ] Item **LimniDB-RADAR** no menu
- [ ] Página inicial com conteúdo RADAR (não CAP)
- [ ] Offline: abas/leituras renderizam
- [ ] Com mapa Modbus: cada leitura extra chama o endereço certo (log/mock)
- [ ] LimniDB-CAP não regressou

**Pare aqui.** Confirmar ok antes da etapa 13.

---

## Etapa 13 — TSAT “bugado” + servidor de atualização no domínio

**Objetivo:** não “chutar” correção grande no TSat nem infra de update sem diagnóstico. Esta etapa é **investigação + proposta**, implementação só depois de alinhamento.

### 13A — Módulo TSAT

- [ ] Reproduzir sintomas com checklist (Status, GPS, RF, Terminal, TX test).
- [ ] Separar bugs já cobertos (etapas 5–10) do que ainda sobra.
- [ ] Documentar lógica atual de comandos (`TSatDB.tsx` + `serial.tsx`) e pontos frágeis.
- [ ] Só então abrir subtarefas de correção.

### 13B — Servidor de atualização no domínio próprio

Hoje o update usa provider GitHub (`electron-builder.yml`, `resources/app-update.yml`, fallback em `main/index.ts`). `dev-app-update.yml` aponta para `example.com`.

Entregar um **mini-runbook**, não necessariamente a infra em produção:

- [ ] O que publicar (NSIS + `latest.yml` / blocos do electron-updater)
- [ ] Onde hospedar no domínio (HTTPS obrigatório)
- [ ] Como apontar `app-update.yml` / publish config para esse host
- [ ] Como testar com build de homologação
- [ ] Rollback se o feed falhar

### Validar comigo

- [ ] Lista do que ainda está bugado no TSAT (após 5–10)
- [ ] Runbook de update no domínio revisado pelo time
- [ ] Decisão: implementar correções TSAT / trocar feed de update numa próxima leva

**Pare aqui.** Fim do plano desta leva.

---

## Fora de escopo (por enquanto)

- Executar o plano antigo `PLANO-ACOES-26AGO2026.md` (outro PDF / outro conjunto de tarefas).
- Publicar release / bump de versão sem validação.
- Alterar firmware dos equipamentos.

## Dúvidas em aberto

1. **“Retirar a palavra PluviDB”** — escopo A/B/C (etapa 4)?
2. **LimniDB-RADAR** — lista oficial de registradores Modbus e copy da home?
3. **Terminal Serial** — lista final de baudrates e posição no menu?
4. **GOES-19** — manter “EAST 75W” ou atualizar posição/rótulo completo?
5. **Update no domínio** — qual host/path oficial (ex. `https://updates.seudominio/...`)?

---

## Prompt pronto para colar amanhã

Copie o bloco abaixo inteiro numa nova conversa com o agente. Ele força **uma etapa por vez** e pergunta se está ok antes da próxima.

```text
Você vai EXECUTAR o plano em docs/PLANO-ACOES-ANOTACOES-DHIONE.md neste repositório (Suite Device).

REGRAS OBRIGATÓRIAS:
1. NÃO implemente mais de uma etapa por vez.
2. Comece na primeira etapa ainda marcada [ ] no documento (ou na que eu indicar).
3. Antes de codar a etapa, diga em 3–6 linhas: objetivo, arquivos que deve tocar, e o que NÃO vai fazer.
4. Implemente só essa etapa. Commit claro ao terminar a etapa.
5. Ao final, liste o checklist “Validar comigo” da etapa e PERGUNTE:
   “Etapa N concluída no código. Está tudo ok para eu seguir para a etapa N+1? Responda OK ou descreva o ajuste.”
6. NÃO comece a etapa seguinte até eu responder OK (ou indicar correções).
7. Se houver dúvida de escopo (especialmente etapa 4 — PluviDB, etapa 12 — endereços Modbus RADAR, etapa 13 — infra), PARE e pergunte; não invente.
8. Não misture tarefas do PLANO-ACOES-26AGO2026.md, a menos que eu peça.
9. Depois do meu OK, atualize o checkbox da etapa concluída no .md e só então avance.

Ordem das etapas:
1 Copyright 2026
2 Banner Saiba mais / Más información / Learn more
3 Remover begin-- e --end do TXT
4 Remover palavra PluviDB (confirmar escopo antes)
5 GOES-16 → GOES-19
6 Acentos Nível de potência
7 Label Intervalo de correção (sem “Definir o”)
8 Limites RF 26.00–38.50
9 Senha inválida/vazia não envia comando serial
10 Preservar vírgulas no terminal/TXT
11 Novo Terminal Serial (baudrate, limpar, salvar histórico)
12 Novo LimniDB-RADAR (clone CAP + Modbus extra)
13 Investigar TSAT restante + runbook de update no domínio

Comece agora pela etapa 1. Não faça a etapa 2 nesta resposta.
```

### Como conduzir amanhã (do seu lado)

1. Cole o prompt.
2. Teste o que a etapa pediu.
3. Responda `OK` ou liste o que falta.
4. Só depois peça / confirme a próxima etapa.

Atalhos úteis:

```text
OK — pode ir para a etapa N+1
```

```text
Não está ok: <o que falhou>. Corrija só isso, sem avançar de etapa.
```

```text
Pule a etapa N; vá para a etapa M.
```

```text
Na etapa 4 o escopo é: <A/B/C ou descrição>.
```
