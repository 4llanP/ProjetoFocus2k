# Plano de implementação — Responsividade mobile do Focus 2k

## Objetivo

Adaptar o Focus 2k para celulares e tablets, preservando a identidade visual, os componentes, as funcionalidades e as regras de negócio já existentes.

A versão mobile deve parecer o mesmo Focus 2k, reorganizado para telas menores — não um redesign e não uma segunda aplicação.

**Estratégia:** implementar em etapas pequenas, validar cada etapa antes de avançar e manter o desktop como referência de comportamento.

---

## 1. Regras obrigatórias para todo o trabalho

Estas regras valem para todas as fases e têm prioridade sobre qualquer outra instrução deste documento.

### Preservar

- A paleta de cores, tipografia, ícones, bordas, sombras, arredondamentos, espaçamentos característicos e temas existentes.
- A identidade visual e a hierarquia dos componentes.
- Todas as funcionalidades atuais, incluindo autenticação, navegação, filtros, Kanban, calendário, chat com IA, modais, notificações, tarefas, subtarefas e configurações.
- Os endpoints, contratos de API, formato dos dados, persistência, banco de dados e regras de negócio.
- O comportamento atual em desktop.
- As bibliotecas e tecnologias já utilizadas pelo projeto.

### Não fazer

- Não redesenhar a interface nem criar uma nova identidade visual para mobile.
- Não criar um segundo dashboard ou uma implementação mobile independente.
- Não remover funcionalidades para fazer o layout caber na tela.
- Não substituir componentes ou bibliotecas sem necessidade técnica comprovada.
- Não alterar autenticação, API, backend, banco de dados ou estrutura de dados como parte deste trabalho.
- Não reescrever módulos inteiros quando uma alteração localizada for suficiente.
- Não modificar regras de negócio para resolver problemas de apresentação.
- Não aplicar regras globais de CSS que possam alterar componentes não relacionados.
- Não declarar uma fase concluída sem verificar seus critérios de aceitação.

### Forma de trabalho

1. Antes de editar um arquivo, leia sua implementação atual e identifique quem utiliza os componentes e seletores envolvidos.
2. Reaproveite funções, componentes, eventos e estados existentes sempre que possível.
3. Prefira ajustes de layout por CSS e alterações pontuais de interface.
4. Isole as regras responsivas em `ui/css/responsive.css`, caso essa organização seja compatível com a configuração atual do projeto.
5. Não duplique a lógica de negócio entre desktop e mobile. Quando houver diferenças de interação, reutilize a mesma operação interna.
6. Faça uma fase por vez. Não comece a próxima até concluir e validar a fase atual.
7. Se encontrar uma incompatibilidade entre este documento e a arquitetura real, não invente uma solução: explique a diferença e escolha a alternativa de menor impacto.
8. Ao terminar cada fase, informe arquivos alterados, o que mudou, testes executados, resultados e limitações restantes.

---

## 2. Diagnóstico inicial e referência do desktop

Antes de modificar o código, faça uma leitura do projeto para confirmar a estrutura atual e estabelecer uma referência do desktop.

### Pontos que precisam ser inspecionados

- `ui/dashboard.html`: estrutura do dashboard, sidebar, Kanban, calendário, chat e modais.
- `ui/css/main.css`: estilos globais, dimensões, alturas, overflow, temas e regras com `!important`.
- `ui/js/app.js`: navegação, controles da sidebar, modais, filtros e interações gerais.
- `ui/js/kanban.js`: renderização de colunas, cartões, tarefas, subtarefas e drag-and-drop.
- `ui/js/calendar.js`: renderização e navegação do calendário.
- `ui/js/chat.js` ou o módulo equivalente: painel e interações do chat, caso esteja separado.
- `ui/tela_login.html`: tela de autenticação e seus estilos responsivos.
- Arquivos de configuração de CSS, framework ou build, para descobrir como os estilos são carregados.

Os caminhos acima são referências iniciais. Confirme os nomes e a estrutura existentes antes de editar; não crie arquivos ou módulos duplicados se o projeto já possuir equivalentes.

### Pontos de atenção identificados na análise inicial

Verifique se estes casos ainda existem e quais elementos afetam:

- Uma área do Kanban com `min-w-[840px]`, que pode forçar rolagem horizontal em telas estreitas.
- Colunas com altura baseada em `calc(100vh - 170px)`.
- Sidebar com largura equivalente a `w-64`.
- Chat com largura equivalente a `w-96` e controle de largura por JavaScript.
- Contêineres com `overflow-hidden` e altura fixa, que podem ocultar conteúdo em telas pequenas.
- Drag-and-drop baseado em `dataTransfer`, que não deve ser a única forma de mover tarefas em dispositivos de toque.
- Regras com `!important` em `main.css`, que podem afetar a ordem e a especificidade dos novos estilos.

Não altere esses pontos automaticamente. Primeiro confirme o impacto real e preserve o comportamento desktop.

### Entrega desta etapa

Apresente um diagnóstico curto com:

1. Estrutura real dos arquivos envolvidos.
2. Elementos que causam overflow horizontal ou vertical.
3. Componentes que possuem dimensões fixas.
4. Como sidebar, chat, Kanban, calendário e modais são controlados por JavaScript.
5. Como os estilos são carregados e compilados.
6. Uma referência verificável do comportamento desktop, por screenshots ou testes existentes, caso o ambiente permita.

Não implemente ainda as mudanças das fases seguintes.

---

# Fases de implementação

## Fase 1 — Fundação responsiva e proteção do desktop

### Objetivo

Preparar a estrutura para receber as adaptações mobile sem alterar o layout atual em telas desktop.

### Instruções

- Confirme os breakpoints já utilizados pelo projeto e a configuração do framework CSS, se houver.
- Use como pontos iniciais de teste as larguras de 768px e 1024px, mas ajuste os breakpoints conforme o comportamento real dos componentes.
- Crie `ui/css/responsive.css` somente se isso for compatível com a organização atual.
- Carregue o arquivo responsivo depois dos estilos-base, sem alterar a ordem de estilos necessária ao funcionamento do projeto.
- Coloque as novas regras dentro de media queries sempre que forem específicas para mobile ou tablet.
- Evite seletores globais amplos. Prefira classes específicas dos componentes.
- Corrija restrições de largura, altura e overflow somente nos elementos que realmente impedem a adaptação.
- Preserve as dimensões e o posicionamento atuais em desktop.
- Não use `overflow-x: hidden` no `body` como forma de esconder problemas de layout. Identifique e corrija a origem do overflow.
- Considere `100dvh` e áreas seguras (`env(safe-area-inset-*)`) apenas onde forem necessários e compatíveis com os navegadores suportados.

### Critérios de aceitação

- O CSS responsivo é carregado corretamente.
- O desktop permanece visual e funcionalmente igual ao estado anterior.
- A página não apresenta overflow horizontal involuntário nas larguras mobile testadas.
- Nenhum conteúdo importante fica inacessível por causa de altura fixa ou `overflow-hidden`.
- Os estilos existentes continuam funcionando, inclusive os temas.

### Prompt para enviar à IA de programação

> Implemente somente a Fase 1 do documento `README_RESPONSIVIDADE_MOBILE.md`. Primeiro inspecione a arquitetura e confirme os arquivos e breakpoints reais. Prepare a base responsiva, isolando as regras mobile em `responsive.css` se isso for compatível com o projeto. Não implemente ainda sidebar, Kanban, calendário ou chat mobile. Preserve rigorosamente a aparência e o funcionamento do desktop, temas e funcionalidades. Não esconda overflow horizontal sem corrigir sua causa. Ao terminar, liste arquivos alterados, decisões técnicas e testes realizados. Pare ao concluir esta fase.

---

## Fase 2 — Sidebar e navegação mobile

### Objetivo

Adaptar a sidebar para telas pequenas sem perder opções, filtros ou navegação.

### Comportamento esperado

- Em desktop, a sidebar mantém o comportamento atual.
- Em telas pequenas, a sidebar deixa de ocupar permanentemente a largura do conteúdo.
- A navegação passa a abrir a sidebar como painel sobre o conteúdo, usando o botão de menu existente quando disponível.
- O painel deve respeitar a largura da tela e não cobrir controles essenciais sem oferecer uma forma de fechar.
- Deve ser possível fechar a sidebar pelo botão de fechamento, por um clique fora do painel e pela tecla `Escape`.
- Ao abrir a sidebar, o foco e a interação devem continuar acessíveis; se houver implementação de foco no projeto, preserve-a e adapte-a.
- A rolagem da sidebar deve funcionar quando seu conteúdo for maior que a altura disponível.
- Os itens, ícones, rótulos, filtros e estados selecionados devem continuar iguais aos atuais.
- Ao selecionar uma opção de navegação, mantenha o comportamento atual do aplicativo e feche o painel mobile quando isso fizer sentido.

### Restrições

- Não remover opções da sidebar.
- Não trocar ícones, textos ou cores.
- Não duplicar a sidebar nem manter duas fontes de estado independentes.
- Não quebrar o estado de filtros ou navegação ao abrir e fechar o painel.

### Critérios de aceitação

- A sidebar não reduz indevidamente a área principal em telas mobile.
- Abrir, fechar e navegar funciona por toque e teclado.
- Cliques nos itens continuam executando as ações atuais.
- Em desktop, a sidebar se comporta como antes.

### Prompt para enviar à IA de programação

> Implemente somente a Fase 2 do documento `README_RESPONSIVIDADE_MOBILE.md`. Adapte a sidebar existente para mobile como painel sobre o conteúdo, reutilizando o controle e os estados existentes sempre que possível. Preserve todos os itens, filtros, ícones, textos e ações. Inclua fechamento pelo controle visível, clique fora e tecla Escape, sem prejudicar acessibilidade ou navegação. Desktop deve permanecer inalterado. Não avance para o Kanban. Execute os testes da fase e pare.

---

## Fase 3 — Kanban adaptativo

### Objetivo

Fazer o Kanban caber em telas estreitas sem reduzir excessivamente os cartões nem eliminar informações.

### Comportamento esperado

- Em desktop, as colunas continuam lado a lado, como atualmente.
- Em mobile, apresentar uma coluna por vez, com controles para alternar entre os status existentes: A Fazer, Em Andamento e Concluído (ou os nomes reais encontrados no código).
- Os controles de seleção devem preservar a identidade visual atual. Não introduzir uma nova linguagem visual.
- O usuário deve conseguir identificar claramente qual coluna está selecionada.
- A troca de coluna deve atualizar a visualização sem apagar, recriar indevidamente ou duplicar tarefas.
- A rolagem vertical dos cartões deve funcionar normalmente.
- O cabeçalho, ações e informações de cada cartão devem permanecer disponíveis.
- Se a implementação atual tiver outros status ou colunas configuráveis, respeite os dados reais em vez de codificar apenas três nomes fixos.
- Não imponha uma largura mínima de desktop ao quadro em telas mobile.

### Restrições

- Não alterar a estrutura dos dados nem o ciclo de vida das tarefas.
- Não modificar filtros, ordenação, busca ou regras de status.
- Não trocar o design dos cartões.
- Não remover colunas ou informações para economizar espaço.

### Critérios de aceitação

- Todas as colunas e tarefas continuam acessíveis em mobile.
- A troca de coluna não altera os dados.
- Os cartões mantêm as ações e informações existentes.
- Desktop continua exibindo todas as colunas lado a lado.
- Não existe rolagem horizontal involuntária da página para acessar uma coluna.

### Prompt para enviar à IA de programação

> Implemente somente a Fase 3 do documento `README_RESPONSIVIDADE_MOBILE.md`. Faça o Kanban exibir uma coluna por vez no mobile, com controles para alternar entre as colunas/status reais do sistema. Preserve o layout atual de múltiplas colunas no desktop e mantenha integralmente os cartões, tarefas, subtarefas, filtros, ordenação, busca e ações. Não use uma largura mínima de desktop em telas pequenas. Não altere dados ou regras de negócio. Verifique que alternar colunas não perde nem duplica informações. Não implemente ainda as interações por toque da Fase 4. Pare ao concluir e validar esta fase.

---

## Fase 4 — Interações de tarefas por toque

### Objetivo

Garantir que as operações do Kanban funcionem em celulares, inclusive quando a interação atual depender de arrastar e soltar.

### Instruções

- Primeiro identifique como o drag-and-drop atual funciona e quais funções são executadas ao iniciar, mover e soltar uma tarefa.
- Preserve o drag-and-drop atual no desktop.
- Não dependa exclusivamente de `dataTransfer` para dispositivos de toque.
- Ofereça no mobile uma forma explícita e acessível de alterar o status da tarefa, como uma ação ou seletor dentro das opções já existentes do cartão.
- Faça a alternativa mobile chamar a mesma função de atualização de status utilizada pelo fluxo atual, sempre que possível.
- Preserve confirmação, validação, persistência e atualização visual existentes.
- Verifique também criação, edição, exclusão, conclusão, subtarefas e menus de contexto.
- Garanta que botões e áreas clicáveis tenham tamanho adequado para toque sem mudar sua aparência de forma desnecessária.
- Evite que um toque em um botão de ação seja interpretado como início de arraste ou seleção do cartão.

### Restrições

- Não substituir o sistema inteiro de drag-and-drop sem justificativa.
- Não duplicar lógica de atualização de tarefas.
- Não mudar permissões, validações ou regras de status.
- Não remover suporte ao mouse.

### Critérios de aceitação

- É possível alterar o status de uma tarefa pelo celular sem depender de arrastar e soltar.
- O desktop continua permitindo a interação atual por mouse.
- Todas as alterações persistem corretamente.
- Ações dos cartões continuam funcionando por toque.
- Não há disparos acidentais de ações ao tocar em áreas próximas.

### Prompt para enviar à IA de programação

> Implemente somente a Fase 4 do documento `README_RESPONSIVIDADE_MOBILE.md`. Inspecione o drag-and-drop atual antes de alterar qualquer coisa. Preserve-o no desktop e crie uma alternativa mobile por toque para mudar o status das tarefas. Reutilize a mesma lógica de negócio e persistência existente; não duplique a implementação. Teste também as ações dos cartões, subtarefas, criação, edição e exclusão. Não modifique regras de negócio ou dados. Não avance para o calendário. Pare ao concluir e validar esta fase.

---

## Fase 5 — Calendário de metas

### Objetivo

Adaptar o calendário para telas menores sem remover dias, informações ou controles.

### Instruções

- Preserve a organização em sete dias da semana, salvo se a implementação atual tiver uma regra específica que precise ser mantida.
- Ajuste responsivamente o tamanho das células, tipografia e espaços internos sem comprometer a legibilidade.
- Preserve os controles de navegação entre períodos.
- Mantenha os indicadores de tarefas e metas. Quando o espaço for insuficiente, use uma forma compacta já coerente com o design atual e permita consultar os detalhes completos.
- Verifique títulos de dias, datas, estados selecionados, dias de outros meses e indicadores.
- Garanta que textos longos ou muitos indicadores não aumentem uma célula de maneira que quebre a grade.
- Preserve a abertura de detalhes e todas as ações ligadas às datas.

### Restrições

- Não alterar datas, cálculos, fuso horário ou regras de recorrência.
- Não remover indicadores ou eventos.
- Não substituir o calendário por uma lista simplificada sem necessidade comprovada.
- Não alterar a aparência desktop.

### Critérios de aceitação

- A grade permanece utilizável em telas mobile.
- Todos os dias e controles continuam acessíveis.
- Indicadores e detalhes correspondem aos mesmos dados de antes.
- Navegação entre períodos continua funcionando.
- Desktop permanece igual.

### Prompt para enviar à IA de programação

> Implemente somente a Fase 5 do documento `README_RESPONSIVIDADE_MOBILE.md`. Adapte o calendário para mobile preservando a grade de sete dias, navegação, datas, indicadores, detalhes e ações existentes. Ajuste dimensões e distribuição do conteúdo, sem remover informações ou alterar cálculos, datas, recorrência ou fuso horário. Mantenha o calendário atual no desktop. Verifique células com muitos indicadores e textos longos. Não avance para chat, modais ou login. Pare ao concluir e validar esta fase.

---

## Fase 6 — Chat de IA, modais e login

### Objetivo

Ajustar os painéis complementares e os formulários para uso em celular, preservando recursos e identidade visual.

### Chat de IA

- Em desktop, mantenha o painel e sua largura atuais.
- Em mobile, apresente o chat em um painel que utilize a largura disponível sem ficar espremido ao lado do conteúdo.
- Preserve histórico, contexto da conversa, envio de mensagens, estados de carregamento, mensagens de erro e controles existentes.
- Garanta que a lista de mensagens possa ser rolada e que a área de digitação permaneça acessível.
- Considere o teclado virtual: o campo de mensagem e o botão de envio não podem ficar escondidos quando o teclado aparecer.
- Evite que a abertura do chat gere rolagem horizontal na página.

### Modais e formulários

- Limite a largura dos modais à área disponível, mantendo margens laterais em celulares.
- Permita rolagem vertical do conteúdo quando ele for maior que a tela.
- Mantenha cabeçalho, conteúdo e ações acessíveis.
- Garanta que o botão de fechar e os botões de confirmação não fiquem fora da área visível.
- Considere `100dvh` e áreas seguras quando necessário.
- Teste formulários com teclado virtual aberto, campos longos e mensagens de validação.
- Preserve validações, máscaras, estados e ações atuais.

### Login

- Revise a tela de login, que já pode conter classes responsivas.
- Corrija apenas problemas comprovados em larguras menores.
- Preserve o formulário, autenticação, mensagens, identidade visual e estados de carregamento.

### Critérios de aceitação

- Chat pode ser aberto, utilizado e fechado em mobile.
- Histórico e contexto não são perdidos ao alternar a visualização.
- O teclado virtual não esconde o campo de envio.
- Modais com conteúdo longo podem ser rolados e fechados.
- Formulários continuam validando e enviando os mesmos dados.
- Login funciona em larguras pequenas.
- Desktop permanece igual.

### Prompt para enviar à IA de programação

> Implemente somente a Fase 6 do documento `README_RESPONSIVIDADE_MOBILE.md`. Adapte chat, modais, formulários e login para telas pequenas. Preserve histórico e contexto do chat, envio de mensagens, validações, autenticação, estados e todas as ações existentes. Trate corretamente rolagem interna, altura disponível e teclado virtual. Mantenha os painéis atuais no desktop. Não altere API, backend ou regras de negócio. Não avance para a revisão final. Pare ao concluir e validar esta fase.

---

## Fase 7 — Regressão, compatibilidade e refinamento final

### Objetivo

Verificar o conjunto completo e corrigir regressões sem aproveitar a etapa para fazer redesign ou adicionar funcionalidades.

### Resoluções mínimas de teste

| Largura | Cenário |
|---:|---|
| 320px | Celular pequeno |
| 375px | Celular compacto |
| 390px | Celular comum |
| 430px | Celular grande |
| 768px | Tablet em orientação vertical / breakpoint |
| 1024px | Tablet em orientação horizontal / transição para desktop |
| 1366px | Desktop comum |
| 1920px | Desktop amplo |

Teste também orientação paisagem em celular, quando o ambiente permitir.

### Checklist funcional

- [ ] Login e logout.
- [ ] Navegação entre áreas do sistema.
- [ ] Abertura e fechamento da sidebar.
- [ ] Seleção de filtros e estados da navegação.
- [ ] Visualização de todas as colunas Kanban.
- [ ] Criação, edição, exclusão e conclusão de tarefas.
- [ ] Criação e interação com subtarefas.
- [ ] Mudança de status por toque no mobile.
- [ ] Drag-and-drop por mouse no desktop.
- [ ] Busca, filtros e ordenação.
- [ ] Navegação do calendário.
- [ ] Abertura e leitura dos detalhes das datas.
- [ ] Abertura, envio e fechamento do chat de IA.
- [ ] Preservação do histórico/contexto do chat.
- [ ] Abertura, rolagem e fechamento dos modais.
- [ ] Validação e envio de formulários.
- [ ] Temas e demais preferências visuais.

### Checklist visual e técnico

- [ ] Sem rolagem horizontal involuntária em mobile.
- [ ] Sem conteúdo importante cortado por alturas fixas ou `overflow-hidden`.
- [ ] Sem sobreposição de botões, campos, menus ou modais.
- [ ] Sem elementos inacessíveis atrás da sidebar ou do teclado virtual.
- [ ] Sem alterações involuntárias de cores, fontes, bordas, sombras ou ícones.
- [ ] Sem erros novos no console do navegador.
- [ ] Sem requisições ou alterações indevidas na API.
- [ ] Desktop preservado nas resoluções de referência.
- [ ] Sem duplicação de eventos, cartões, mensagens ou requisições.

### Critérios de aceitação

A implementação só deve ser considerada concluída quando as funcionalidades essenciais forem verificadas em mobile e desktop. Problemas não testados devem ser listados como pendências, e não descritos como resolvidos.

### Prompt para enviar à IA de programação

> Execute somente a Fase 7 do documento `README_RESPONSIVIDADE_MOBILE.md`. Faça uma revisão de regressão da implementação responsiva em todas as resoluções listadas. Verifique os fluxos funcionais e visuais do checklist. Corrija apenas problemas causados pelas alterações de responsividade, sem redesign, novas funcionalidades ou alterações de regras de negócio. Compare o desktop com a referência anterior. Não declare testes como aprovados se não foram executados. Ao terminar, apresente uma tabela com cada teste, resolução, resultado e eventuais pendências.

---

## 3. Breakpoints de referência

Os valores abaixo são pontos iniciais, não regras absolutas. A implementação deve considerar o espaço realmente necessário para cada componente.

| Faixa de largura | Comportamento esperado |
|---|---|
| Abaixo de 768px | Layout mobile: sidebar em painel, Kanban com uma coluna por vez e painéis adaptados à largura disponível. |
| 768px a 1023px | Layout intermediário: verificar sidebar, calendário, Kanban e chat conforme o espaço efetivo. |
| 1024px ou mais | Preservar o layout desktop atual, salvo ajustes comprovadamente necessários para tablets. |

Não introduza um breakpoint apenas porque ele aparece nesta tabela. Primeiro teste o componente e aplique a menor quantidade de regras necessária.

---

## 4. Estrutura de arquivos sugerida

A estrutura real do projeto deve ser confirmada antes de criar qualquer arquivo. Se for compatível, a organização desejada é:

```text
ui/
├── dashboard.html
├── tela_login.html
├── css/
│   ├── main.css
│   └── responsive.css
└── js/
    ├── app.js
    ├── kanban.js
    ├── calendar.js
    ├── chat.js
    └── ... módulos existentes
```

`responsive.css` deve concentrar ajustes de apresentação por tamanho de tela. A lógica específica de interação deve ficar no módulo JavaScript responsável pelo componente, reutilizando funções e estados existentes. Não crie `chat.js`, `kanban.js` ou qualquer outro módulo se o projeto já organizar essa lógica de outra forma.

---

## 5. Modelo de relatório obrigatório ao concluir cada fase

Peça à IA de programação para responder usando este formato:

```text
FASE CONCLUÍDA: [número e nome]

1. Arquivos analisados:
- ...

2. Arquivos alterados:
- ...

3. Alterações realizadas:
- ...

4. Funcionalidades preservadas e verificadas:
- ...

5. Testes executados:
- Resolução/dispositivo:
- Ação testada:
- Resultado:

6. Problemas encontrados:
- ...

7. Pendências ou riscos:
- ...

8. Confirmação:
- Desktop preservado? Sim/Não/Não testado.
- Identidade visual preservada? Sim/Não/Parcial.
- Regras de negócio e API inalteradas? Sim/Não.
```

A IA deve distinguir claramente entre **implementado**, **testado** e **não testado**. Não aceitar uma afirmação genérica de que “está responsivo” sem evidências dos testes.

---

## 6. Ordem de execução

Execute nesta ordem, sem juntar fases:

1. Diagnóstico inicial e referência do desktop.
2. Fase 1 — Fundação responsiva e proteção do desktop.
3. Fase 2 — Sidebar e navegação mobile.
4. Fase 3 — Kanban adaptativo.
5. Fase 4 — Interações de tarefas por toque.
6. Fase 5 — Calendário de metas.
7. Fase 6 — Chat de IA, modais e login.
8. Fase 7 — Regressão, compatibilidade e refinamento final.

**Regra de encerramento:** ao concluir cada fase, pare e entregue o relatório. Só prossiga para a próxima quando a fase anterior tiver sido revisada. Se algum teste falhar, corrija a falha antes de avançar.

**Resultado esperado:** o Focus 2k deve continuar reconhecível e funcional como é hoje, mas utilizável em celulares e tablets, com adaptações de organização e interação estritamente necessárias para telas menores.
