async function desestruturarTarefaComIA(taskId) {
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (!tarefa) return;

  cardSendoDesestruturado = tarefa;
  setSafeText('chatContextBadge', `Modo: ${tarefa.titulo.slice(0, 18)}...`);

  document.querySelectorAll('[id^="task_"]').forEach(el => el.classList.remove('card-highlight-active'));
  const cardEl = document.getElementById(`task_${taskId}`);
  if (cardEl) cardEl.classList.add('card-highlight-active');

  if (typeof alternarDrawerChat === 'function') {
    alternarDrawerChat(true);
  } else {
    const drawer = document.getElementById('drawerChatIA');
    if (drawer) {
      drawer.classList.remove('hidden');
      drawer.style.width = '24rem';
      drawerChatAberto = true;
    }
  }

  adicionarMensagemUsuario(`Desestruturar tarefa: "${tarefa.titulo}"`);

  const typingIndicator = document.getElementById('chatTypingIndicator');
  const typingText = document.getElementById('chatTypingText');
  if (typingIndicator) typingIndicator.classList.remove('hidden');
  if (typingText) typingText.textContent = 'Decompondo tarefa cognitivamente...';
  rolarChatParaFinal();

  mostrarToastFeedback("Gerando decomposição cognitiva...");

  let etapas = [];
  try {
    const res = await apiFetch(`${API_URL}/tarefas/ia/decompor?_t=${Date.now()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || ""
      })
    });

    let data = {};
    if (res.ok) {
      const responseText = await res.text();
      try {
        data = JSON.parse(responseText);
      } catch (jsonErr) {
        console.warn("Resposta da API de decomposição não é JSON válido:", responseText);
      }
    } else {
      console.warn("API de decomposição retornou status não OK:", res.status);
    }

    if (data && data.passos && data.passos.length > 0) {
      const textosExistentes = (tarefa.subtarefas || []).map(s => s.texto.toLowerCase().trim());

      const passosRecebidos = data.passos;
      etapas = passosRecebidos
        .filter(texto => {
          const textoNorm = texto.toLowerCase().trim();
          return !textosExistentes.includes(textoNorm);
        })
        .map((texto, idx) => ({
          texto: texto,
          tempo: `${(idx + 1) * 10} min`,
          prioridade: idx === 0 ? 'alta' : 'media',
          marcado: true
        }));

      if (etapas.length === 0 && passosRecebidos.length > 0) {
        etapas = [
          { texto: "Todos os passos sugeridos pela IA já existem nesta tarefa.", tempo: "0 min", prioridade: "alta", marcado: false }
        ];
      }
    }
  } catch (e) {
    console.error("Erro ao chamar API de decomposição:", e);
  }

  if (etapas.length === 0) {
    etapas = [
      { texto: `Analisar escopo e planejar '${tarefa.titulo.slice(0, 20)}'`, tempo: "10 min", prioridade: "alta", marcado: true },
      { texto: "Executar a etapa prática central", tempo: "20 min", prioridade: "alta", marcado: true },
      { texto: "Revisar resultados e concluir", tempo: "10 min", prioridade: "media", marcado: true }
    ];
  }

  if (typingIndicator) typingIndicator.classList.add('hidden');
  const proposalId = 'proposal_' + Date.now();
  renderizarPropostaDecomposicaoIA(proposalId, tarefa, etapas);
  rolarChatParaFinal();
  mostrarToastFeedback("Decomposição gerada! Clique em 'Injetar Subtarefas'.");
}

function renderizarPropostaDecomposicaoIA(proposalId, tarefa, etapas) {
  const container = document.getElementById('chatMessagesContainer');

  let itensCheckboxHtml = '';
  etapas.forEach((etapa, idx) => {
    let badgeCor = etapa.prioridade === 'alta'
      ? 'border-rose-500 text-rose-300'
      : (etapa.prioridade === 'media' ? 'border-amber-400 text-amber-300' : 'border-[#3a3a42] text-[#fffff2]');

    itensCheckboxHtml += `
      <label class="flex items-start gap-2.5 p-2 rounded-lg bg-[#080808] border border-[#26262b] hover:border-[#fffff2] transition cursor-pointer select-none">
        <input type="checkbox" id="${proposalId}_chk_${idx}" ${etapa.marcado ? 'checked' : ''} class="mt-0.5 w-3.5 h-3.5 rounded border-[#26262b] bg-[#161619] text-[#fffff2] focus:ring-[#fffff2] cursor-pointer">
        <div class="flex-1 min-w-0">
          <span class="text-xs text-[#fffff2] font-medium leading-tight block">${etapa.texto}</span>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[9px] font-mono px-1 py-0.2 rounded border ${badgeCor}">${etapa.prioridade.toUpperCase()}</span>
            <span class="text-[9px] font-mono text-[#9d9da6]"> ${etapa.tempo}</span>
          </div>
        </div>
      </label>
    `;
  });

  const messageCardHtml = `
    <div class="flex items-start gap-2.5">
      <div class="w-6 h-6 rounded-md bg-[#fffff2] text-[#080808] flex items-center justify-center flex-shrink-0 font-bold text-xs">
        <span class="material-symbols-outlined text-[15px]">account_tree</span>
      </div>
      <div class="bg-[#161619] border border-[#3a3a42] rounded-xl rounded-tl-none text-[#fffff2] w-full max-w-[90%] p-3 shadow-lg space-y-2.5">
        <div class="flex items-center justify-between border-b border-[#26262b] pb-2">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#fffff2]"></span>
            <h4 class="font-bold text-xs text-[#fffff2]">Subtarefas Propostas</h4>
          </div>
          <span class="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1f1f24] text-[#fffff2] border border-[#26262b]">IA</span>
        </div>

        <p class="text-[11px] text-[#9d9da6] leading-relaxed">
          Decompus <b>"${tarefa.titulo}"</b> em ${etapas.length} etapas estratégicas:
        </p>

        <div id="${proposalId}_list" class="space-y-1.5" data-task-id="${tarefa.id}">
          ${itensCheckboxHtml}
        </div>

        <button
          onclick="injetarSubtarefasNoKanban('${proposalId}', '${tarefa.id}')"
          class="w-full py-1.5 px-3 bg-[#fffff2] hover:bg-white active:scale-95 text-[#080808] font-bold text-xs rounded-lg border border-[#fffff2] flex items-center justify-center gap-1.5 transition shadow"
        >
          <span class="material-symbols-outlined text-[16px]">playlist_add</span>
          <span>Injetar Subtarefas no Kanban</span>
        </button>
      </div>
    </div>
  `;

  if (container) container.insertAdjacentHTML('beforeend', messageCardHtml);
}

async function injetarSubtarefasNoKanban(proposalId, taskId) {
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (!tarefa) return;

  const listContainer = document.getElementById(`${proposalId}_list`);
  if (!listContainer) return;

  const checkboxes = listContainer.querySelectorAll('input[type="checkbox"]');
  let injetadasCount = 0;

  for (let idx = 0; idx < checkboxes.length; idx++) {
    const chk = checkboxes[idx];
    if (chk.checked) {
      const labelSpan = chk.closest('label').querySelector('span.text-xs');
      const texto = labelSpan ? labelSpan.textContent.trim() : `Nova etapa #${idx + 1}`;

      if (tarefa.realId) {
        try {
          const res = await apiFetch(`${API_URL}/tarefas/${tarefa.realId}/passos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texto: texto, ordem: idx + 1 })
          });
          if (res.ok) {
            const novoPasso = await res.json();
            tarefa.subtarefas.push({
              id: novoPasso.id,
              texto: novoPasso.texto,
              feita: novoPasso.concluido
            });
            injetadasCount++;
          }
        } catch (err) {
          console.error("Erro ao salvar passo na API:", err);
        }
      } else {
        tarefa.subtarefas.push({
          id: `sub_ia_${Date.now()}_${idx}`,
          texto: texto,
          feita: false
        });
        injetadasCount++;
      }
    }
  }

  if (injetadasCount === 0) {
    mostrarToastFeedback('Selecione ao menos 1 subtarefa para injetar.');
    return;
  }

  listarTarefas();

  setTimeout(() => {
    const acc = document.getElementById(`accordion-${taskId}`);
    const arrow = document.getElementById(`arrow-${taskId}`);
    const label = document.getElementById(`label-acc-${taskId}`);
    if (acc) {
      acc.classList.add('expanded');
      if (arrow) arrow.classList.add('rotate-180');
      if (label) label.textContent = 'Recolher passos';
    }
  }, 100);

  adicionarMensagemIA(`<b>${injetadasCount} novas subtarefas</b> foram injetadas no card <i>"${tarefa.titulo}"</i> no seu Kanban.`);
  rolarChatParaFinal();

  mostrarToastFeedback(`${injetadasCount} subtarefas injetadas em "${tarefa.titulo.slice(0, 18)}..."`);
}

async function enviarMensagemChat() {
  const input = document.getElementById('chatInputText');
  const texto = (input.value || '').trim();
  if (!texto) return;

  adicionarMensagemUsuario(texto);
  input.value = '';

  const typingIndicator = document.getElementById('chatTypingIndicator');
  const typingText = document.getElementById('chatTypingText');
  if (typingIndicator) typingIndicator.classList.remove('hidden');
  if (typingText) typingText.textContent = 'Processando diretriz...';
  rolarChatParaFinal();

  try {
    let endpoint = `${API_URL}/tarefas/chat/geral`;
    let payload = { pergunta: texto };

    if (cardSendoDesestruturado && cardSendoDesestruturado.realId) {
      endpoint = `${API_URL}/tarefas/${cardSendoDesestruturado.realId}/chat`;
    }

    const res = await apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (typingIndicator) typingIndicator.classList.add('hidden');

    if (res.ok && data.resposta) {
      adicionarMensagemIA(data.resposta);
      if (data.dados_tarefa) {
        let subtarefasCarregadas = [];
        try {
          const resPassos = await apiFetch(`${API_URL}/tarefas/${data.dados_tarefa.id}/passos`);
          if (resPassos.ok) {
            const passos = await resPassos.json();
            subtarefasCarregadas = passos.map(p => ({
              id: p.id,
              texto: p.texto,
              feita: p.concluido
            }));
          }
        } catch (e) {}

        tarefasDB.push({
          id: String(data.dados_tarefa.id),
          realId: data.dados_tarefa.id,
          titulo: data.dados_tarefa.titulo,
          descricao: data.dados_tarefa.descricao,
          prioridade: data.dados_tarefa.prioridade,
          status: data.dados_tarefa.status || 'pendente',
          tipo: data.dados_tarefa.tipo,
          subtarefas: subtarefasCarregadas
        });
        listarTarefas();
        mostrarToastFeedback("Tarefa criada pela IA no Kanban!");
      }
    } else {
      responderMensagemLivre(texto);
    }
  } catch (err) {
    if (typingIndicator) typingIndicator.classList.add('hidden');
    responderMensagemLivre(texto);
  }
  rolarChatParaFinal();
}

function responderMensagemLivre(texto) {
  const t = texto.toLowerCase();
  let resposta = '';

  if (t.includes('pomodoro') || t.includes('tempo') || t.includes('foco')) {
    resposta = `O método ideal recomendado é o ciclo 50/10: 50 minutos de alta concentração sem distrações e 10 minutos de pausa reflexiva. No fim do dia, faça 15 min de consolidação.`;
  } else if (t.includes('prova') || t.includes('exame') || t.includes('estudo')) {
    resposta = `Para provas densas, aplique <b>Interleaving</b> (estudo intercalado) com resolução ativa de exercícios passados antes de reler anotações passivas. Use o botão 'Desestruturar com IA' em um card para ver o plano!`;
  } else {
    resposta = `Compreendido: <i>"${texto}"</i>. Com base na metodologia de foco, sugiro quebrar essa meta em três frentes: fundamentação conceitual, exercício prático e verificação metacognitiva.`;
  }

  adicionarMensagemIA(resposta);
}

function adicionarMensagemUsuario(texto) {
  const container = document.getElementById('chatMessagesContainer');
  const html = `
    <div class="flex items-start justify-end gap-2.5">
      <div class="bg-[#1f1f24] border border-[#3a3a42] p-2.5 rounded-xl rounded-tr-none text-[#fffff2] max-w-[85%]">
        <p class="leading-relaxed select-text">${texto}</p>
      </div>
      <div class="w-6 h-6 rounded-md bg-[#26262b] border border-[#3a3a42] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#fffff2]">
        ST
      </div>
    </div>
  `;
  if (container) container.insertAdjacentHTML('beforeend', html);
}

function adicionarMensagemIA(htmlConteudo) {
  const container = document.getElementById('chatMessagesContainer');
  const html = `
    <div class="flex items-start gap-2.5">
      <div class="w-6 h-6 rounded-md bg-[#1f1f24] border border-[#3a3a42] flex items-center justify-center flex-shrink-0 text-[#fffff2]">
        <span class="material-symbols-outlined text-[14px]">smart_toy</span>
      </div>
      <div class="bg-[#161619] border border-[#26262b] p-2.5 rounded-xl rounded-tl-none text-[#fffff2] max-w-[85%] space-y-1">
        <div class="leading-relaxed select-text text-xs text-[#fffff2]">${htmlConteudo}</div>
      </div>
    </div>
  `;
  if (container) container.insertAdjacentHTML('beforeend', html);
}

function limparHistoricoChat() {
  cardSendoDesestruturado = null;
  const container = document.getElementById('chatMessagesContainer');
  if (container) {
    container.innerHTML = `
      <div class="flex items-start gap-2.5">
        <div class="w-6 h-6 rounded-md bg-[#1f1f24] border border-[#3a3a42] flex items-center justify-center flex-shrink-0 text-[#fffff2]">
          <span class="material-symbols-outlined text-[14px]">auto_awesome</span>
        </div>
        <div class="bg-[#161619] border border-[#26262b] p-2.5 rounded-xl rounded-tl-none text-[#fffff2] max-w-[85%] space-y-1.5">
          <p class="leading-relaxed">
            Histórico reiniciado. O assistente está pronto para novas análises e decomposições de estudo.
          </p>
        </div>
      </div>
    `;
  }
  setSafeText('chatContextBadge', 'Modo: Geral');
  document.querySelectorAll('[id^="task_"]').forEach(el => el.classList.remove('card-highlight-active'));
  mostrarToastFeedback("Histórico limpo.");
}

function rolarChatParaFinal() {
  const container = document.getElementById('chatMessagesContainer');
  if (container) container.scrollTop = container.scrollHeight;
}
