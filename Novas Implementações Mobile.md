# Focus 2k — Auditoria e Planejamento de Melhorias Mobile e Acessibilidade

## 1. Objetivo

Analise o repositório atual do Focus 2k:

https://github.com/NicolasSNichnig/ProjetoFocus2k/tree/main

O objetivo é planejar melhorias para dispositivos móveis e adicionar recursos de acessibilidade, preservando completamente a identidade visual, as funcionalidades, a arquitetura e o comportamento atual do projeto.

**IMPORTANTE: Esta primeira etapa é EXCLUSIVAMENTE DE ANÁLISE E PLANEJAMENTO. NÃO MODIFIQUE NENHUM ARQUIVO.**

Não implemente nada nesta etapa. Primeiro, precisamos entender como o projeto está estruturado e quais alterações seriam necessárias.

---

## 2. Regra fundamental: preservar o estado atual do projeto

O projeto já possui funcionalidades, componentes, estilos, integrações e comportamentos implementados.

Todas as melhorias devem ser planejadas considerando o código existente como referência.

### Restrições obrigatórias

- Não modificar arquivos.
- Não criar, excluir ou renomear arquivos.
- Não alterar o banco de dados ou dados dos usuários.
- Não modificar endpoints, APIs ou autenticação.
- Não alterar regras de negócio.
- Não substituir bibliotecas ou frameworks.
- Não realizar refatorações que não sejam indispensáveis.
- Não modificar a identidade visual existente.
- Não remover funcionalidades para facilitar a adaptação mobile.
- Não alterar a branch atual.
- Não executar commits, pushes, merges ou rebases.
- Não executar `git reset`, `git clean`, `git checkout` ou `git stash`.
- Não instalar dependências.
- Não executar migrações ou operações que alterem dados.

Antes da análise, consulte:

- Branch atual.
- Estado do Git (`git status`).
- Alterações locais não commitadas.
- Alterações já staged.
- Estrutura atual dos arquivos.

Caso existam alterações locais, preserve-as integralmente. Não tente corrigi-las, descartá-las ou reorganizá-las.

A análise deve considerar o estado real do repositório, não versões antigas do projeto ou documentos desatualizados.

---

# 3. Melhorias mobile desejadas

## 3.1. Gestos (Swipe) para mudar o estado das tarefas

Quero implementar navegação por gestos horizontais nos cartões de tarefas.

Os estados existentes são:

- A Fazer.
- Em Andamento.
- Concluído.

### Comportamento desejado

- Swipe para a esquerda: avançar a tarefa para o próximo estado.
- Swipe para a direita: retornar a tarefa para o estado anterior.
- A tarefa deve avançar ou retroceder apenas um estado por gesto.
- A mudança deve utilizar a mesma lógica existente de atualização de status.
- A alteração precisa ser persistida utilizando o mecanismo atual do projeto.
- A interface deve refletir imediatamente o novo estado.
- Deve existir uma forma de desfazer uma mudança acidental, caso isso seja compatível com a arquitetura existente.

### Cuidados importantes

Os gestos não podem:

- Disparar acidentalmente ao rolar verticalmente a página.
- Interferir em botões, campos de texto ou outros elementos interativos.
- Impedir a seleção de texto.
- Interferir no drag-and-drop existente.
- Disparar duas alterações para um único gesto.
- Fazer uma tarefa desaparecer sem que a atualização tenha sido confirmada.

O reconhecimento do gesto deve considerar distância mínima e direção predominante do movimento.

O swipe deve ser um recurso adicional, nunca o único método de alteração de estado.

Os botões tradicionais de mudança de estado devem continuar disponíveis.

Também deve ser avaliada a possibilidade de ativar ou desativar os gestos nas configurações de acessibilidade.

---

## 3.2. Abrir e fechar a sidebar utilizando Swipe

Quero adicionar suporte a gestos para controlar a sidebar em dispositivos móveis.

### Comportamento desejado

Quando a sidebar estiver fechada:

- Um swipe da esquerda para a direita, iniciado próximo à borda esquerda da tela, deve abrir a sidebar.

Quando estiver aberta:

- Um swipe da direita para a esquerda deve fechá-la.
- Também deve ser possível fechá-la pelo botão existente.
- O clique fora da sidebar deve continuar funcionando.
- A tecla Escape deve fechá-la quando aplicável.

### Restrições

- Não interferir na navegação nativa do navegador.
- Não interferir nos gestos dos cartões de tarefas.
- Não interferir na rolagem da página.
- Não modificar a estrutura de navegação existente.
- Preservar as animações e o estilo visual atual, adaptando apenas o comportamento necessário.

A sidebar deve continuar funcionando normalmente no desktop.

---

## 3.3. Controle de tamanho das fontes

Quero implementar duas formas complementares de adaptação tipográfica.

### A. Adaptação automática

O tamanho das fontes deve se adaptar ao espaço disponível na tela.

Avaliar o uso de unidades responsivas, como `rem`, `clamp()` e media queries.

O sistema deve considerar:

- Largura disponível.
- Resolução.
- Dispositivos móveis.
- Tablets.
- Desktop.

Entretanto, a adaptação automática não deve diminuir excessivamente as fontes para fazer o conteúdo caber na tela.

A legibilidade deve ser priorizada.

### B. Personalização pelo usuário

Adicionar nas configurações uma opção de acessibilidade para aumentar ou diminuir o tamanho das fontes.

Sugestão de opções:

- 100% — Padrão.
- 110%.
- 125%.
- 150%.
- 175%.
- 200%.

O usuário deve conseguir visualizar a mudança imediatamente.

### Requisitos

- A preferência deve permanecer após recarregar a página.
- Utilizar o sistema de persistência de preferências que já existir no projeto.
- A preferência manual deve prevalecer sobre a adaptação automática.
- Não quebrar cartões, menus, tabelas, modais ou formulários.
- Não impedir o funcionamento do zoom nativo do navegador.
- O tamanho de 200% deve ser testado sem perda de conteúdo ou funcionalidade.

---

## 3.4. Tema branco para acessibilidade

Quero adicionar um tema claro, com fundo branco, voltado principalmente à acessibilidade e legibilidade.

IMPORTANTE: Não substituir nem modificar o tema atual.

O tema existente precisa continuar funcionando exatamente como funciona hoje.

O novo tema deve ser uma opção adicional.

### Características desejadas

- Fundo predominantemente branco.
- Textos em cores escuras.
- Bom contraste entre textos e fundos.
- Elementos interativos facilmente identificáveis.
- Bordas e divisórias visíveis.
- Estados das tarefas claramente distinguíveis.
- Indicadores visuais que não dependam exclusivamente de cores.

Preservar, sempre que possível, as cores de identidade e os elementos de reconhecimento do Focus 2k.

Não criar um design completamente diferente.

A intenção é adaptar a paleta existente para uma versão clara e acessível.

### Persistência

- O usuário pode escolher o tema nas configurações.
- A escolha deve permanecer após recarregar a aplicação.
- A troca de tema não pode modificar outras configurações.
- O tema atual continua sendo a configuração padrão para usuários que ainda não escolheram outro.

---

## 3.5. Aumentar os botões de mudança de estado no mobile

Os controles utilizados para alterar o estado das tarefas precisam ser mais fáceis de pressionar em telas sensíveis ao toque.

### Requisitos

- Aumentar a área clicável.
- Evitar botões muito próximos.
- Melhorar o espaçamento entre controles.
- Preservar ícones e identidade visual.
- Manter os botões visualmente proporcionais aos cartões.
- Garantir que não ocupem espaço excessivo.

Como referência, considerar áreas de interação de 44 a 48 pixels CSS para os controles principais em dispositivos móveis.

O tamanho visual do ícone pode continuar semelhante ao atual. O importante é aumentar a área de interação.

A mudança deve ser aplicada apenas quando necessária para mobile, preservando o desktop.

---

# 4. Outras melhorias de acessibilidade a serem avaliadas

Além dos recursos solicitados, quero que você analise quais outras opções podem ser adicionadas ao Focus 2k.

Não implemente essas opções automaticamente.

Primeiro, identifique quais são úteis, quais exigem alterações pequenas e quais poderiam demandar mudanças maiores.

Considere as seguintes possibilidades:

### 4.1. Redução de animações

Adicionar uma opção para reduzir ou desativar animações e transições.

Considerar também a preferência nativa:

`prefers-reduced-motion`

Isso deve abranger animações de modais, sidebar, transições e efeitos visuais desnecessários.

### 4.2. Alto contraste

Avaliar um modo de contraste elevado, diferente do tema branco convencional.

O objetivo é oferecer maior distinção entre textos, fundos, bordas e controles.

### 4.3. Indicadores de foco

Garantir que os elementos interativos tenham indicadores de foco visíveis ao navegar pelo teclado.

Não remover o `outline` sem fornecer uma alternativa visual adequada.

### 4.4. Navegação por teclado

Verificar se as principais funcionalidades podem ser utilizadas sem mouse ou tela sensível ao toque.

Considerar:

- Tab e Shift + Tab.
- Enter e Espaço.
- Escape para fechar modais e menus.
- Navegação lógica entre componentes.
- Foco acessível em menus e modais.

### 4.5. Leitores de tela

Avaliar melhorias com atributos semânticos e ARIA.

Considerar:

- Botões com nomes acessíveis.
- Descrições para ícones.
- Identificação dos estados das tarefas.
- Notificações acessíveis de mudança de estado.
- Identificação correta de campos e formulários.
- Organização semântica dos componentes.

Uma alteração de status deve ser anunciada sem obrigar o leitor de tela a reler todo o quadro Kanban.

### 4.6. Identificação de estados sem depender de cores

Verificar se o usuário consegue diferenciar A Fazer, Em Andamento e Concluído sem depender apenas das cores.

Utilizar textos, ícones ou outros indicadores complementares quando necessário.

### 4.7. Espaçamento e legibilidade

Avaliar opções para:

- Aumentar o espaçamento entre linhas.
- Melhorar a legibilidade de textos.
- Evitar blocos de texto excessivamente comprimidos.
- Manter o conteúdo utilizável com fontes ampliadas.

### 4.8. Alternativas aos gestos e movimentos de arrastar

Todas as funcionalidades que utilizem gestos ou drag-and-drop devem possuir alternativas acessíveis por controles convencionais.

O usuário não deve ser obrigado a realizar um movimento específico para utilizar o sistema.

### 4.9. Preferências do sistema operacional

Avaliar suporte progressivo a:

- `prefers-reduced-motion`.
- `prefers-contrast`.
- `forced-colors`.
- Preferências de contraste e aparência do navegador, quando compatíveis.

Não introduzir comportamentos automáticos que substituam silenciosamente as preferências escolhidas pelo usuário.

---

# 5. Preservação visual e funcional

Esta é uma das partes mais importantes do projeto.

O Focus 2k já possui uma identidade visual própria.

Todas as alterações precisam respeitar essa identidade.

### Não alterar

- Paleta original do tema atual.
- Tipografia original, exceto pelo escalonamento de acessibilidade.
- Estilo dos cartões.
- Bordas.
- Arredondamentos.
- Ícones.
- Sombras.
- Identidade dos componentes.
- Organização visual do desktop.
- Funcionalidades já existentes.

### O que pode mudar

- Posicionamento dos elementos em telas pequenas.
- Tamanho de áreas clicáveis.
- Dimensões necessárias para melhorar a interação por toque.
- Comportamento da sidebar em mobile.
- Organização do Kanban em mobile.
- Escalas tipográficas.
- Paleta do novo tema claro.
- Recursos adicionais de acessibilidade.

Não redesenhe o produto.

Não simplifique funcionalidades.

Não crie uma versão mobile independente.

A aplicação deve continuar utilizando a mesma base de componentes, lógica e dados.

---

# 6. Compatibilidade e critérios de teste

Quero que você prepare uma estratégia de testes que considere as seguintes resoluções:

| Resolução | Dispositivo |
|---|---|
| 320px | Celular compacto |
| 360px | Celular pequeno |
| 375px | Celular comum |
| 390px | Celular comum |
| 430px | Celular grande |
| 768px | Tablet vertical |
| 1024px | Tablet horizontal |
| 1366px | Desktop |
| 1920px | Desktop amplo |

Também considerar:

- Orientação vertical e horizontal.
- Navegadores mobile.
- Teclado virtual aberto.
- Fontes em 200%.
- Navegação por teclado.
- Leitores de tela.
- Preferências de redução de movimento.
- Diferentes temas.

### Testes funcionais obrigatórios

1. Alterar tarefas pelos botões existentes.
2. Alterar tarefas por swipe.
3. Voltar uma tarefa ao estado anterior.
4. Verificar persistência do novo estado.
5. Verificar se o drag-and-drop continua funcionando.
6. Abrir e fechar a sidebar pelos diferentes métodos.
7. Verificar se os gestos não provocam ações acidentais.
8. Alterar o tamanho das fontes.
9. Recarregar a página e verificar a persistência das preferências.
10. Alternar entre os temas.
11. Testar modais, formulários, calendário e chat.
12. Verificar se todas as funcionalidades existentes continuam disponíveis.

Não utilizar dados reais dos usuários para testes que possam alterar informações persistentes.

---

# 7. Referências de acessibilidade

Utilizar como referência as diretrizes WCAG 2.2:

https://www.w3.org/Translations/WCAG22-pt-BR/

Dar atenção especial a:

- Contraste mínimo.
- Redimensionamento de texto.
- Foco visível.
- Alternativas para movimentos de arrastar.
- Tamanho e espaçamento de alvos interativos.
- Compatibilidade com diferentes mecanismos de entrada.

O objetivo é melhorar a acessibilidade de maneira mensurável, não apenas adicionar opções visuais.

---

# 8. O que preciso receber nesta primeira etapa

Antes de qualquer implementação, quero um relatório técnico com as seguintes informações:

## A. Diagnóstico atual

- Como funciona atualmente o Kanban.
- Como são atualizados os estados das tarefas.
- Como funciona o drag-and-drop.
- Como a sidebar é controlada.
- Como os temas estão organizados.
- Como as fontes são configuradas.
- Onde são armazenadas as preferências.
- Quais recursos de acessibilidade já existem.
- Quais limitações atuais afetam dispositivos móveis.

## B. Arquivos envolvidos

Identifique os arquivos reais que precisarão ser modificados.

Para cada arquivo, explique:

- Sua responsabilidade atual.
- Qual alteração seria necessária.
- Por que essa alteração é necessária.
- Quais funcionalidades existentes podem ser afetadas.

Não presuma nomes de arquivos. Examine a estrutura real do repositório.

## C. Plano de implementação

Organize as melhorias em etapas pequenas e independentes.

Sugestão de organização:

1. Auditoria e preparação da estrutura responsiva.
2. Sidebar e navegação por gestos.
3. Gestos para alteração de status das tarefas.
4. Botões maiores e melhorias de interação por toque.
5. Tipografia adaptativa e controles de tamanho.
6. Tema branco e opções de contraste.
7. Recursos adicionais de acessibilidade.
8. Testes de regressão e compatibilidade.

Você pode reorganizar as etapas caso identifique dependências técnicas que justifiquem outra sequência.

## D. Análise de riscos

Identifique possíveis conflitos entre:

- Swipe e rolagem vertical.
- Swipe e drag-and-drop.
- Sidebar e navegação nativa do navegador.
- Ampliação de fontes e layout.
- Tema branco e cores de status.
- Modais e teclado virtual.
- Preferências de acessibilidade e configurações existentes.

Apresente soluções antes de recomendar qualquer alteração.

## E. Critérios de aceitação

Para cada etapa, indique como podemos comprovar que:

- A funcionalidade foi implementada corretamente.
- Não houve perda de funcionalidades.
- A aparência original foi preservada.
- O desktop não sofreu regressões.
- A experiência mobile foi melhorada.
- Os dados e preferências continuam consistentes.

## F. Classificação das melhorias

Separe as recomendações em três categorias:

**Essenciais:** melhorias solicitadas diretamente e necessárias para a experiência mobile e acessibilidade.

**Recomendadas:** melhorias que trazem benefícios relevantes e podem ser implementadas com baixo ou médio risco.

**Opcionais:** recursos adicionais que podem ser desenvolvidos posteriormente.

---

# 9. Condição final: aguardar aprovação

Ao concluir o diagnóstico e apresentar o planejamento:

**PARE E AGUARDE MINHA AUTORIZAÇÃO.**

Não comece a implementar as melhorias.

Não altere arquivos.

Não crie commits.

Não modifique o estado do Git.

Não avance automaticamente para a próxima fase.

Quero revisar o diagnóstico, decidir quais melhorias serão aprovadas e então solicitar a implementação gradualmente.

A prioridade absoluta é melhorar a experiência mobile e a acessibilidade sem prejudicar o Focus 2k que já existe.

**Preserve o projeto atual. Melhore sua experiência, não reconstrua seu produto.**