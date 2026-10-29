/**
 * @file kanban.js
 * @description Kanban board loading, rendering, subtask management, accordion toggling, and drag & drop handlers.
 */

async function carregarTarefasDaAPI() {
  try {
    const res = await apiFetch(`${API_URL}/tarefas`);
    const data = await res.json();
    if (res.ok) {
      const rawTarefas = data.dados || data;
      tarefasDB = await Promise.all(rawTarefas.map(async t => {
        let subtarefas = [];
        try {
          const resPassos = await apiFetch(`${API_URL}/tarefas/${t.id}/passos`);
          if (resPassos.ok) {
            const passos = await resPassos.json();
            subtarefas = passos.map(p => ({
              id: p.id,
              texto: p.texto,
              feita: p.concluido
            }));
          }
        } catch (e) {}

        let dbStatus = (t.status || '').toLowerCase().trim();
        let statusMapeado = 'pendente';
        if (dbStatus === 'em_andamento' || dbStatus === 'andamento' || dbStatus === 'fazendo') {
          statusMapeado = 'em_andamento';
        } else if (dbStatus === 'concluido' || dbStatus === 'concluida' || t.concluida) {
          statusMapeado = 'concluido';
        } else if (dbStatus === 'pendente' || dbStatus === 'a_fazer') {
          statusMapeado = 'pendente';
        }

        return {
          id: String(t.id),
          realId: t.id,
          tipo: t.tipo || t.categoria || 'tarefas_diarias',
          categoria: t.tipo || t.categoria || 'tarefas_diarias',
          titulo: t.titulo,
          descricao: t.descricao || '',
          prioridade: t.prioridade || 'media',
          status: statusMapeado,
          prazo: t.prazo || null,
          subtarefas: subtarefas
        };
      }));
      listarTarefas();
      if (typeof renderizarCalendario === 'function') {
        renderizarCalendario();
      }
    }
  } catch (err) {
    console.error("Erro ao carregar tarefas da API:", err);
  }
}

function listarTarefas() {
  const colPendente = document.getElementById('col-pendente');
  const colAndamento = document.getElementById('col-em_andamento');
  const colConcluido = document.getElementById('col-concluido');

  if (!colPendente || !colAndamento || !colConcluido) return;

  colPendente.innerHTML = '';
  colAndamento.innerHTML = '';
  colConcluido.innerHTML = '';

  let countP = 0, countA = 0, countC = 0, countDia = 0, countEdu = 0;

  // Calculate global counts for categories from all tasks in database
  tarefasDB.forEach(t => {
    const cat = t.tipo || t.categoria;
    if (cat === 'tarefas_diarias' || cat === 'diaria') countDia++;
    if (cat === 'tarefas_educacionais' || cat === 'educacional') countEdu++;

    if (t.status === 'pendente') countP++;
    else if (t.status === 'em_andamento') countA++;
    else if (t.status === 'concluido') countC++;
  });

  const filtradas = tarefasDB.filter(t => {
    const cat = t.tipo || t.categoria || 'tarefas_diarias';
    const matchCat = filtroCategoriaAtiva === 'todas' || cat === filtroCategoriaAtiva;
    const matchBusca = !termoBuscaAtivo || t.titulo.toLowerCase().includes(termoBuscaAtivo.toLowerCase()) || (t.descricao && t.descricao.toLowerCase().includes(termoBuscaAtivo.toLowerCase()));
    return matchCat && matchBusca;
  });

  filtradas.forEach(t => {
    const htmlCard = renderizarCardHTML(t);
    if (t.status === 'pendente') colPendente.insertAdjacentHTML('beforeend', htmlCard);
    else if (t.status === 'em_andamento') colAndamento.insertAdjacentHTML('beforeend', htmlCard);
    else if (t.status === 'concluido') colConcluido.insertAdjacentHTML('beforeend', htmlCard);
  });

  setSafeText('count-pendente', countP);
  setSafeText('count-em_andamento', countA);
  setSafeText('count-concluido', countC);
  setSafeText('badge-count-pendente', countP);
  setSafeText('badge-count-em_andamento', countA);
  setSafeText('badge-count-concluido', countC);
  setSafeText('count-todas', tarefasDB.length);
  setSafeText('count-dia', countDia);
  setSafeText('count-edu', countEdu);
}

function renderizarCardHTML(t) {
  const totalSubs = t.subtarefas.length;
  const subsFeitas = t.subtarefas.filter(s => s.feita).length;
  const progressoPct = totalSubs > 0 ? Math.round((subsFeitas / totalSubs) * 100) : 0;

  const prioridadeClasses = {
    alta: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    media: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    baixa: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  }[t.prioridade] || 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  const prioridadeLabel = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[t.prioridade] || 'Média';
  const isEdu = (t.tipo === 'tarefas_educacionais' || t.categoria === 'tarefas_educacionais' || t.tipo === 'educacional');
  const tipoLabel = isEdu ? 'Tarefas Únicas' : 'Tarefas Diárias';
  const tipoClasses = isEdu ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';

  let subtarefasHTML = '';
  if (totalSubs > 0) {
    t.subtarefas.forEach(sub => {
      subtarefasHTML += `
        <li class="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#161619] transition group">
          <label class="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
            <input type="checkbox" ${sub.feita ? 'checked' : ''} onchange="alternarSubtarefa(event, '${t.id}', '${sub.id}')" class="w-3.5 h-3.5 rounded border-[#3a3a42] bg-[#0c0c0e] accent-[#fffff2] cursor-pointer">
            <span class="text-xs truncate ${sub.feita ? 'line-through text-[#75757d]' : 'text-[#fffff2]'}">${sub.texto}</span>
          </label>
        </li>
      `;
    });
  }

  return `
    <div id="task_${t.id}" draggable="true" ondragstart="iniciarArrasto(event, '${t.id}')" class="bg-[#111113] border border-[#26262b] hover:border-[#3a3a42] rounded-xl p-4 transition-all shadow-sm relative group select-none">
      <div class="flex items-start justify-between gap-2 mb-2">
        <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${tipoClasses}">${tipoLabel}</span>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${prioridadeClasses}">${prioridadeLabel}</span>
          <button onclick="abrirModalEditarTarefa('${t.id}')" title="Editar tarefa" class="text-[#75757d] hover:text-[#fffff2] p-0.5 transition cursor-pointer">
            <span class="material-symbols-outlined text-[14px]">edit</span>
          </button>
          <button onclick="deletarTarefaAPI('${t.id}')" title="Excluir tarefa" class="text-[#75757d] hover:text-rose-400 p-0.5 transition cursor-pointer">
            <span class="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      </div>
      <h3 class="text-sm font-bold text-[#fffff2] mb-1 leading-snug select-text">${t.titulo}</h3>
      ${t.descricao ? `<p class="text-xs text-[#9d9da6] mb-3 line-clamp-2 select-text">${t.descricao}</p>` : ''}

      ${totalSubs > 0 ? `
        <div class="mt-2 pt-2 border-t border-[#26262b]">
          <div class="flex items-center justify-between text-[11px] font-mono text-[#9d9da6] mb-1">
            <span>Progresso (${subsFeitas}/${totalSubs})</span>
            <span>${progressoPct}%</span>
          </div>
          <div class="w-full bg-[#161619] h-1.5 rounded-full overflow-hidden border border-[#26262b]">
            <div class="bg-[#fffff2] h-full transition-all duration-300" style="width: ${progressoPct}%"></div>
          </div>
        </div>
      ` : ''}

      <div class="mt-3 pt-2.5 border-t border-[#26262b] flex items-center ${totalSubs === 0 ? 'justify-start' : 'justify-end'}">
        ${totalSubs === 0 ? `
          <button onclick="desestruturarTarefaComIA('${t.id}')" class="px-2 py-1 bg-[#161619] hover:bg-[#1f1f24] text-[#fffff2] text-[11px] font-medium rounded border border-[#26262b] hover:border-[#fffff2] transition flex items-center gap-1 cursor-pointer">
            <span class="material-symbols-outlined text-[13px]">auto_awesome</span>
            <span>Desestruturar IA</span>
          </button>
        ` : `
          <button onclick="alternarAccordion('${t.id}')" class="text-[11px] text-[#9d9da6] hover:text-[#fffff2] flex items-center gap-1 font-mono transition">
            <span id="label-acc-${t.id}">Ver passos</span>
            <span id="arrow-${t.id}" class="material-symbols-outlined text-[14px] transition-transform">expand_more</span>
          </button>
        `}
      </div>

      ${totalSubs > 0 ? `
        <div id="accordion-${t.id}" class="accordion-content mt-2">
          <ul class="space-y-1 bg-[#0c0c0e] p-2 rounded-lg border border-[#26262b]">
            ${subtarefasHTML}
          </ul>
        </div>
      ` : ''}

      <div class="mt-2.5 pt-2 border-t border-[#26262b] flex items-center justify-end gap-1.5 text-[9px] font-mono">
        <span class="text-[#9d9da6] mr-auto">Mover:</span>
        ${t.status !== 'pendente' ? `<button onclick="arrastarTarefa('${t.id}', 'pendente')" class="px-2 py-0.5 rounded bg-[#161619] text-[#fffff2] hover:bg-[#fffff2] hover:text-[#080808] transition">A Fazer</button>` : ''}
        ${t.status !== 'em_andamento' ? `<button onclick="arrastarTarefa('${t.id}', 'em_andamento')" class="px-2 py-0.5 rounded bg-[#161619] text-[#fffff2] hover:bg-[#fffff2] hover:text-[#080808] transition">Andamento</button>` : ''}
        ${t.status !== 'concluido' ? `<button onclick="arrastarTarefa('${t.id}', 'concluido')" class="px-2 py-0.5 rounded bg-[#161619] text-[#fffff2] hover:bg-[#fffff2] hover:text-[#080808] transition">Concluir</button>` : ''}
      </div>
    </div>
  `;
}

function alternarAccordion(cardId) {
  const accordion = document.getElementById(`accordion-${cardId}`);
  const arrow = document.getElementById(`arrow-${cardId}`);
  const label = document.getElementById(`label-acc-${cardId}`);
  if (!accordion) return;

  if (accordion.classList.contains('expanded')) {
    accordion.classList.remove('expanded');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (label) label.textContent = 'Ver passos';
  } else {
    accordion.classList.add('expanded');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    if (label) label.textContent = 'Recolher passos';
  }
}

async function alternarSubtarefa(event, taskId, subId) {
  event.stopPropagation();
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (!tarefa) return;

  const subtarefa = tarefa.subtarefas.find(s => s.id == subId);
  if (subtarefa) {
    subtarefa.feita = event.target.checked;
    const totalSubs = tarefa.subtarefas.length;
    const subsFeitas = tarefa.subtarefas.filter(s => s.feita).length;

    if (subsFeitas === totalSubs && tarefa.status !== 'concluido') {
      mostrarToastFeedback(`Todas as etapas de "${tarefa.titulo.slice(0, 20)}..." cumpridas!`);
    }

    if (tarefa.realId && subId) {
      try {
        await apiFetch(`${API_URL}/tarefas/passos/${subId}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.error("Erro ao alternar passo na API:", e);
      }
    }

    listarTarefas();
  }
}

async function arrastarTarefa(taskId, novoStatus) {
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (!tarefa) return;

  tarefa.status = novoStatus;
  if (novoStatus === 'concluido') tarefa.concluida = true;
  else tarefa.concluida = false;

  listarTarefas();

  if (tarefa.realId) {
    try {
      await apiFetch(`${API_URL}/tarefas/${tarefa.realId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });
      mostrarToastFeedback(`Tarefa movida para ${novoStatus.replace('_', ' ')}.`);
    } catch (e) {
      console.error("Erro ao atualizar status na API:", e);
    }
  }
}

async function deletarTarefaAPI(taskId) {
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (!tarefa) return;
  if (!confirm(`Deseja excluir a tarefa "${tarefa.titulo}"?`)) return;

  if (tarefa.realId) {
    try {
      const res = await apiFetch(`${API_URL}/tarefas/${tarefa.realId}`, { method: 'DELETE' });
      if (res.ok) {
        tarefasDB = tarefasDB.filter(t => t.id !== taskId);
        listarTarefas();
        mostrarToastFeedback("Tarefa excluída com sucesso.");
      } else {
        mostrarToastFeedback("Erro ao excluir tarefa.");
      }
    } catch (e) {
      console.error("Erro ao excluir tarefa:", e);
    }
  }
}
