# Plano de ações — Suite Device 2.3.3

Documento de origem: [docs/Detalhes-do-Suite-Device-26ago2026.pdf](docs/Detalhes-do-Suite-Device-26ago2026.pdf) (PDF com prints e esboços).

Este arquivo é só o plano. **Não executar as etapas em sequência sem você testar e validar a etapa anterior.** Marque os checkboxes conforme for concluindo.

---

## Como usar

1. Trabalhe **uma etapa por vez**.
2. Ao terminar a implementação da etapa, rode os testes da seção **Validar comigo**.
3. Só avance para a próxima etapa depois de você confirmar que está ok.
4. As **mudanças de produto** (firmware, HTTP, PCD) ficam por último de propósito: dependem de layout e i18n estáveis.

Legenda:

- `[ ]` pendente
- `[x]` feito e validado

---

## Visão geral

| Ordem | Etapa | Tipo | Origem no documento |
|------:|-------|------|---------------------|
| 1 | Tradução do toast sem porta COM | Correção | Detalhes 2, 4, 5, 6, 7 e 8 |
| 2 | Layout Terminal SDI-12 | Usabilidade | Detalhe 1 |
| 3 | Layout TSatDB | Usabilidade | Detalhe 3 |
| 4 | Layout Teclado SDI-12 | Usabilidade | Detalhe 5 |
| 5 | Layout PluviDB-IoT | Usabilidade | Detalhe 8 |
| 6 | Temperatura no LimniDB-CAP | Funcional | Detalhe 9 |
| 7 | Checkbox “Atualizar Firmware” | Mudança | Mudança 1 |
| 8 | Firmware LimniDB no mesmo fluxo do PluviDB-IoT | Mudança | Mudança 2 |
| 9 | Transmissão HTTP no PluviDB-IoT | Mudança | Mudança 3 |
| 10 | Novo menu PCD Pluviométrica | Mudança | Mudança 4 |

Progresso rápido:

- [ ] Etapa 1 — Toast i18n
- [ ] Etapa 2 — Terminal SDI-12
- [ ] Etapa 3 — TSatDB
- [ ] Etapa 4 — Teclado SDI-12
- [ ] Etapa 5 — PluviDB-IoT (layout)
- [ ] Etapa 6 — LimniDB-CAP temperatura
- [ ] Etapa 7 — Renomear checkbox
- [ ] Etapa 8 — Firmware LimniDB
- [ ] Etapa 9 — HTTP PluviDB-IoT
- [ ] Etapa 10 — PCD Pluviométrica

---

## Etapa 1 — Traduzir o toast ao conectar sem porta COM

**Objetivo:** a mensagem no canto superior direito deve aparecer no idioma da interface (EN e ES), em todos os dispositivos.

**Por que uma etapa só:** o toast é o mesmo (`Conector.tsx`). O documento repetiu o problema no Terminal, TSatDB, Teclado, LimniDB-BORBULHA, LimniDB-CAP e PluviDB-IoT. O detalhe 4 no texto copia o Terminal, mas as imagens são do TSatDB — o toast é o mesmo.

**Causa provável no código atual:**

- Toast hardcoded em português: `Porta não disponível. Reconecte o cabo e selecione novamente.`
- O placeholder da porta usa `t('Selecione')` como `value`, mas a lógica compara com `'Selecione'`. Em inglês o valor vira `"Select"`, o botão **Connect** fica clicável sem porta e dispara o toast em PT.

### Ações

- [ ] Envolver o toast (e outros toasts de serial no conector) com `t(...)`.
- [ ] Adicionar as chaves em `src/locales/en/translation.json` e `src/locales/es/translation.json`.
- [ ] Corrigir o placeholder da COM para um valor estável (ex.: `'Selecione'`), independente do idioma, para o botão não habilitar sem porta.
- [ ] Revisar toasts irmãos no mesmo fluxo (`Erro ao abrir a porta serial`, `Serial error`) para não deixar mais texto solto em PT.

### Arquivos sugeridos

- `src/renderer/src/components/conector/Conector.tsx`
- `src/locales/en/translation.json`
- `src/locales/es/translation.json`

### Validar comigo (não avance sem isto)

Idioma **English**, *Offline mode* desligado, porta = **Select**:

- [ ] Terminal SDI-12 → Connect → toast em inglês
- [ ] TSatDB → Connect → toast em inglês
- [ ] Teclado SDI-12 → Connect → toast em inglês
- [ ] LimniDB-BORBULHA → Connect → toast em inglês
- [ ] LimniDB-CAP → Connect → toast em inglês
- [ ] PluviDB-IoT → Connect → toast em inglês

Idioma **Español**, mesma condição:

- [ ] Os 6 menus acima → Conectar → toast em espanhol

Idioma **Português**:

- [ ] Toast continua correto em PT
- [ ] Com porta válida selecionada, Connect ainda funciona

**Pare aqui.** Me avise o resultado. Só depois seguimos para a etapa 2.

---

## Etapa 2 — Layout do Terminal SDI-12 (telas menores)

**Objetivo:** o painel branco avança um pouco para baixo do botão **Enviar**, e o retângulo de **Digite o comando** fica maior, como no esboço do documento.

### Ações

- [ ] Aumentar a área do campo de comando (altura/largura útil).
- [ ] Empurrar o fundo branco para ficar abaixo do botão Enviar (menos “buraco” entre o input e o rodapé).
- [ ] Conferir em janela estreita e em janela larga (não quebrar os atalhos `?!`, `a!`, etc.).

### Arquivos sugeridos

- `src/renderer/src/components/Terminal/Terminal.tsx`
- `src/renderer/src/components/containerDevice/containerDevice.tsx` (só se o recuo for compartilhado)

### Validar comigo

- [ ] Tela menor: campo de comando visível e maior; branco chega abaixo de Enviar
- [ ] Tela maior: sem sobreposição com copyright / sidebar
- [ ] Enviar comando (offline e, se possível, com conversor) ainda funciona
- [ ] Salvar / Limpar inalterados

**Pare aqui.** Me avise o resultado. Só depois a etapa 3.

---

## Etapa 3 — Layout do TSatDB

**Objetivo:** quadro de Informações / Status responsivo em tela pequena e grande; abas no padrão LimniDB-BORBULHA/CAP; espaço extra abaixo de **Atualizar**.

O documento marca:

- Folgas verticais entre as colunas do Status (próxima transmissão × buffer × status da última TX)
- Títulos das abas (Status, GPS, Configuração, …) fora do padrão LimniDB
- Pouco espaço abaixo do botão Atualizar (mesma lógica do Terminal)

### Ações

- [ ] Ajustar o grid do Status para não “espremer” nem deixar faixas vazias estranhas em tela pequena e grande.
- [ ] Alinhar estilo das abas ao LimniDB (peso, tamanho, underline ativo).
- [ ] Deixar espaço extra abaixo do botão **Atualizar** e aumentar a área útil do painel branco.

### Arquivos sugeridos

- `src/renderer/src/components/TSatDB/TSatDB.tsx` (abas)
- `src/renderer/src/components/TSatDB/components/status.tsx` (grid + botão)
- `src/renderer/src/components/cardInfomation/CardInformation.tsx` (se a tela desconectada também quebrar em `w-[800px]` fixo)

### Validar comigo

- [ ] Tela pequena: Status sem corte / scroll interno aceitável
- [ ] Tela grande: colunas alinhadas, sem o “vão” marcado em vermelho no PDF
- [ ] Abas com o mesmo visual do LimniDB-CAP/BORBULHA
- [ ] Espaço visível abaixo de Atualizar
- [ ] Atualizar (offline = N/A; com equipamento, dados preenchidos) continua ok

**Pare aqui.** Me avise o resultado. Só depois a etapa 4.

---

## Etapa 4 — Layout do Teclado SDI-12

**Objetivo:** títulos da aba **Configuração** e subtítulos no padrão LimniDB; botões inferiores com a **mesma altura**, sem cortar texto.

### Ações

- [ ] Padronizar título da aba e subtítulos (Configurações, Variáveis Principais, Variáveis Controle) com o visual LimniDB.
- [ ] Equalizar altura dos botões: Selecionar o Arquivo, Salvar, Limpar, Baixar informação, Enviar configuração (o documento sugere ajustar só a altura).

### Arquivos sugeridos

- `src/renderer/src/components/Teclado-SDI12/Teclado.tsx`
- `src/renderer/src/components/Teclado-SDI12/components/settings.tsx`
- `src/renderer/src/components/Teclado-SDI12/components/variableMain.tsx`
- `src/renderer/src/components/Teclado-SDI12/components/variableControl.tsx`
- `src/renderer/src/components/Teclado-SDI12/components/buttonSet.tsx`
- `src/renderer/src/components/button/Button.tsx` (só se o tamanho `medium` for a causa)

### Validar comigo

- [ ] Aba/subtítulos iguais ao LimniDB
- [ ] Os 5 botões com a mesma altura; textos completos
- [ ] Fluxos Salvar / Limpar / arquivo não quebraram

**Pare aqui.** Me avise o resultado. Só depois a etapa 5.

---

## Etapa 5 — Layout do PluviDB-IoT (abas e espaço do Atualizar)

**Objetivo:** abas (Status, Dados Inst., Configuração, Terminal) no padrão LimniDB; espaço extra abaixo de **Atualizar**.

HTTP e o clone PCD **não** entram nesta etapa.

### Ações

- [ ] Padronizar títulos das abas com LimniDB-BORBULHA/CAP.
- [ ] Espaço extra abaixo de Atualizar (e, onde já existir, Enviar) para aumentar a área do layout.

### Arquivos sugeridos

- `src/renderer/src/components/PluviDB-Iot/PluviDBIot.tsx`
- `src/renderer/src/components/PluviDB-Iot/components/status.tsx`

### Validar comigo

- [ ] Abas no mesmo padrão visual do LimniDB
- [ ] Espaço abaixo de Atualizar visível em Status
- [ ] Navegação Status / Dados Inst. / Configuração / Terminal ok

**Pare aqui.** Me avise o resultado. Só depois a etapa 6.

---

## Etapa 6 — Temperatura na leitura em tempo real do LimniDB-CAP

**Objetivo:** na medida em tempo real, mostrar **Pressão e Temperatura**, como no programinha antigo (DB Setup).

Hoje a tela de Configurações do LimniDB-CAP só tem Pressão + Medir (`measure.tsx` lê um único valor Modbus).

### Ações

- [ ] Incluir campo **Temperatura** ao lado de Pressão.
- [ ] Confirmar registrador Modbus da temperatura (espelhar o software antigo / datasheet). Não inventar endereço.
- [ ] Traduzir o rótulo em EN/ES.
- [ ] Não alterar o LimniDB-BORBULHA nesta etapa, a menos que a leitura compartilhe o mesmo componente e precise de cuidado para não misturar.

### Arquivos sugeridos

- `src/renderer/src/components/LinnimDB-Cap/components/measure.tsx`
- `src/renderer/src/utils/modbusRTU.tsx`
- locales EN/ES

### Validar comigo

- [ ] Offline: campos visíveis (Pressão e Temperatura)
- [ ] Com equipamento: Medir preenche os dois valores
- [ ] LimniDB-BORBULHA não regressou

**Pare aqui.** Me avise o resultado. A partir daqui começam as **mudanças** de produto.

---

## Etapa 7 — Mudança 1: checkbox “Enviar OS” → “Atualizar Firmware”

**Objetivo:** o checkbox visível no PDF (tela do produto, canto superior) deixa de se chamar **Enviar OS** e passa a **Atualizar Firmware**.

No código atual o login do PluviDB-IoT já usa `t('Atualizar firmware')`. Nesta etapa: achar qualquer rótulo antigo, unificar texto e posição.

### Ações

- [ ] Localizar UI restante de “Enviar OS” (produção 2.3.3 / tela desconectada do produto).
- [ ] Substituir o texto por **Atualizar Firmware** (PT) e traduzir EN/ES.
- [ ] Garantir que o checkbox continue sendo o gatilho de modo firmware (etapa 8 usa o mesmo nome).

### Validar comigo

- [ ] PT / EN / ES: nenhum “Enviar OS” visível
- [ ] Checkbox “Atualizar Firmware” visível no fluxo de conexão do PluviDB-IoT
- [ ] Marcar/desmarcar não quebra o login normal

**Pare aqui.** Me avise o resultado. Só depois a etapa 8.

---

## Etapa 8 — Mudança 2: firmware LimniDB-BORBULHA e LimniDB-CAP no padrão PluviDB-IoT

**Objetivo:** atualizar firmware desses dois dispositivos só com o checkbox **Atualizar Firmware** marcado.

Regra do documento:

- Checkbox **desmarcado** → conexão normal, aba **Atualização não aparece**.
- Checkbox **marcado** → mostra **somente** a aba Atualização.

Referência: PluviDB-IoT (`Login.tsx` + `isRecoveryOnly` em `PluviDBIot.tsx`). Hoje LimniDB sempre mostra Informações / Configurações / Atualização.

### Ações

- [ ] Colocar o checkbox **Atualizar Firmware** no fluxo de conexão dos dois LimniDB (antes de conectar).
- [ ] Conexão normal: esconder aba Atualização.
- [ ] Conexão com checkbox: só aba Atualização (`updateModbus.tsx` — arquivo `.dblos`, baud, etc.).
- [ ] Desconectar e reconectar sem o checkbox volta ao modo normal.
- [ ] Traduzir o checkbox.

### Arquivos sugeridos

- `src/renderer/src/components/LinnimDB-Borbulha/LinnimDbBorbulha.tsx`
- `src/renderer/src/components/LinnimDB-Cap/LinnimDbCap.tsx`
- `src/renderer/src/components/updateModbus/updateModbus.tsx`
- `src/renderer/src/components/conector/Conector.tsx` e/ou `DeviceContext` (estado do modo firmware)
- `src/renderer/src/components/PluviDB-Iot/PluviDBIot.tsx` (espelhar o padrão)

### Validar comigo

LimniDB-BORBULHA:

- [ ] Sem checkbox: Informações + Configurações; sem Atualização
- [ ] Com checkbox: só Atualização
- [ ] Fluxo de arquivo / baud não quebrou (se houver hardware)

LimniDB-CAP: os mesmos três pontos.

- [ ] PluviDB-IoT recovery não regressou

**Pare aqui.** Me avise o resultado. Só depois a etapa 9.

---

## Etapa 9 — Mudança 3: transmissão HTTP no PluviDB-IoT

**Objetivo:** em **PluviDB-IoT → Configuração → Transmissão**, incluir o tipo **HTTP** (hoje só FTP e MQTT), com o mesmo espaço extra abaixo de Atualizar / Enviar.

Fazer **antes** de copiar o módulo (etapa 10), para a PCD herdar o HTTP.

### Campos da UI (esboço do PDF)

| UI | Campo firmware | Tamanho | Conteúdo |
|----|----------------|---------|----------|
| Método | `meth` | 4 bytes | combobox **GET** / **POST** |
| Endereço | `url` | 80 bytes | caminho/domínio, ex. `sigo.adasa.df.gov.br/simcurb` |
| Usuário | `user` | 50 bytes | opcional |
| Senha | `pass` | 50 bytes | opcional |
| Porta | `port` | uint16 | padrão **80** HTTP / **443** HTTPS |
| Segurança | `sec` | 6 bytes | combobox **TLS**, **SSL**, **SEM** |

Mapa de segurança:

| Valor | Significado |
|-------|-------------|
| `null` | HTTP sem TLS (SEM) |
| `tls` | HTTPS com verificação de certificado (produção) |
| `ssl` | HTTPS com verificação (sinônimo de `tls`) |
| `tls_insecure` | HTTPS sem verificação (homologação) |

### Protocolo serial (mesmas regras dos comandos já existentes)

Ler:

```text
http=cfg?
```

Firmware **≤ 2.4.2** (sem autenticação — o software **não pode travar**):

```text
http=post;sigo.adasa.df.gov.br/simcurb;443;tls!
```

Firmware **≥ 2.4.3** (com usuário/senha):

```text
http=post;sigo.adasa.df.gov.br/simcurb;443;tls;simcurb;s40imcur2b63!
```

Escrever: seguir o padrão de `mqtt=` / `ftp=` / `prot=` já usado em `PluviDBIot.tsx`.

### Ações

- [ ] Botão **HTTP** junto de FTP e MQTT.
- [ ] Formulário com os 6 campos; limites de tamanho; porta padrão ao trocar segurança.
- [ ] Parse da resposta curta (4 partes) e da longa (6 partes). FW antigo: usuário/senha vazios, sem crash.
- [ ] Enviar/ler `http=cfg?` e `http=...!` no mesmo encadeamento da transmissão.
- [ ] Traduções PT/EN/ES.
- [ ] Espaço extra abaixo de Atualizar e Enviar.

### Arquivos sugeridos

- `src/renderer/src/components/PluviDB-Iot/components/setting-conponents/transmition.tsx`
- `src/renderer/src/components/PluviDB-Iot/PluviDBIot.tsx` (comandos `http=cfg?` / `http=...!`)
- locales

### Validar comigo

- [ ] UI: HTTP selecionável; campos iguais ao esboço
- [ ] FW ≤ 2.4.2: Atualizar preenche método/url/porta/segurança; app não trava
- [ ] FW ≥ 2.4.3: também usuário e senha
- [ ] Enviar grava e reler confirma
- [ ] MQTT e FTP não regressaram
- [ ] EN/ES nos novos rótulos

**Pare aqui.** Me avise o resultado. Só depois a etapa 10.

---

## Etapa 10 — Mudança 4: copiar o módulo como PCD Pluviométrica

**Objetivo:** depois do HTTP no PluviDB-IoT, clonar o módulo inteiro com o nome **PCD Pluviométrica**. Em **nenhum** lugar dessa cópia pode aparecer “PluviDB-IoT”.

O documento pede para varrer tudo e destaca estes (prints finais do PDF):

- Nome do arquivo salvo do Terminal: `Terminal-PluviDB-IoT_260826-185218.txt`
- Conteúdo do arquivo: `Dados gerado do PluviDB-IoT - 26/08/2026, 18:52:18`

### Ações

- [ ] Novo item no menu lateral: **PCD Pluviométrica** (PluviDB-IoT permanece).
- [ ] Clonar o módulo (local + remoto, se o remoto fizer sentido para PCD).
- [ ] Remover/substituir toda identificação “PluviDB-IoT” / “PluviDB-Iot” na cópia:

  - [ ] Botão do menu
  - [ ] `HeaderDevice` / tela de login
  - [ ] Textos de VISÃO GERAL / CARACTERÍSTICAS / ESPECIFICAÇÃO (se o produto for outro, ajustar copy)
  - [ ] Link do manual / imagem do produto
  - [ ] Header e nome do `.txt` do Terminal
  - [ ] Header e nome do relatório (`relatorio-PluviDB-IoT_...`)
  - [ ] Chaves i18n usadas só pela PCD
  - [ ] Toasts, placeholders, títulos de modal
  - [ ] Comentários visíveis ao usuário (não precisa reescrever comentários internos de código)

- [ ] Busca no código da cópia por `PluviDB` para garantir zero vazamento na UI.
- [ ] HTTP da etapa 9 já presente na PCD.
- [ ] Conexão serial / remoto isolados do PluviDB-IoT (não misturar estado).

### Arquivos sugeridos

- `src/renderer/src/components/Menu.tsx`
- `src/renderer/src/components/Preview.tsx`
- `src/renderer/src/components/conector/Conector.tsx`
- Nova pasta a partir de `src/renderer/src/components/PluviDB-Iot/`
- `src/renderer/src/components/PluviDB-Iot/components/terminal.tsx` (padrão a clonar)
- `src/renderer/src/components/PluviDB-Iot/components/status.tsx` (relatório)
- locales

### Validar comigo

PCD Pluviométrica:

- [ ] Aparece no menu; nome em lugar nenhum é PluviDB-IoT
- [ ] Login, abas, transmissão (incl. HTTP) funcionam
- [ ] Salvar Terminal: nome e primeira linha **sem** PluviDB-IoT
- [ ] Salvar relatório: idem
- [ ] EN e ES também sem o nome antigo

PluviDB-IoT (original):

- [ ] Continua no menu, com o nome PluviDB-IoT
- [ ] HTTP e demais fluxos intactos

**Pare aqui.** Esta é a última etapa do documento.

---

## Fora de escopo deste plano

- Publicar release / bump de versão (fazer depois das validações).
- Redesign geral da sidebar ou de outros dispositivos não citados.
- Alterar firmware dos equipamentos (só a UI e os comandos já definidos).

## Dúvidas em aberto (confirmar na hora de executar)

1. **PCD Pluviométrica:** só clone de UI/protocolo, ou textos de produto/manual diferentes? O PDF não traz copy nova, só pede para ocultar “PluviDB-IoT”.
2. **Registrador Modbus da temperatura** no LimniDB-CAP: precisa do mapa do programinha antigo antes da etapa 6.
3. **Checkbox LimniDB:** na tela desconectada do produto (como o print do Enviar OS) ou no painel de conexão da sidebar?

---

*Quando for executar, comece pela etapa 1 e me chame para validar antes da 2.*
