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
          ${t.status === 'em_andamento' ? `
          <button onclick="abrirTimerTarefa(event, '${t.id}')" title="Temporizador de Foco" class="text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition cursor-pointer">
            <span class="material-symbols-outlined text-[13px]">timer</span>
            <span id="timer-display-${t.id}">25:00</span>
          </button>
          ` : ''}
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

let timerIntervaloAtivo = null;
let timerSegundosRestantes = 25 * 60;
let timerRodando = false;
let tarefaIdTimerAtual = null;

function abrirTimerTarefa(event, taskId) {
  if (event) event.stopPropagation();
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (!tarefa) return;

  tarefaIdTimerAtual = taskId;

  let modal = document.getElementById('modalTimerPomodoro');
  if (!modal) {
    const modalHTML = `
      <div id="modalTimerPomodoro" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onclick="fecharTimerModal()">
        <div class="bg-[#111113] border border-[#28282e] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-[#fffff2] space-y-5" onclick="event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-[#26262b] pb-3">
            <h3 class="font-bold text-sm text-[#fffff2] flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px] text-sky-400">timer</span>
              Sessão de Foco Pomodoro
            </h3>
            <button onclick="fecharTimerModal()" class="text-[#9d9da6] hover:text-[#fffff2] p-1 rounded transition cursor-pointer">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <!-- Coluna Esquerda: Timer -->
            <div class="flex flex-col items-center justify-center bg-[#080808] border border-[#26262b] rounded-xl p-5 text-center">
              <div class="text-[10px] font-mono text-sky-400 uppercase tracking-wider mb-2">Cronômetro Ativo</div>
              <div id="timerModalDisplay" class="text-5xl font-mono font-bold text-[#fffff2] tracking-wider my-3">
                25:00
              </div>
              <div class="flex items-center justify-center gap-2 w-full mt-4">
                <button id="btnPlayPauseTimer" onclick="alternarPlayPauseTimer()" class="flex-1 py-2.5 bg-[#fffff2] hover:bg-white text-[#080808] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer">
                  <span class="material-symbols-outlined text-[16px]" id="playPauseIcon">play_arrow</span>
                  <span id="playPauseText">Iniciar</span>
                </button>
                <button onclick="resetarTimer()" class="px-3 py-2.5 bg-[#161619] hover:bg-[#1f1f24] text-[#fffff2] font-semibold rounded-xl text-xs border border-[#26262b] transition cursor-pointer" title="Zerar timer">
                  Zerar
                </button>
                <button onclick="definirTempoTimer(5 * 60)" class="px-3 py-2.5 bg-[#161619] hover:bg-[#1f1f24] text-[#9d9da6] hover:text-[#fffff2] font-mono rounded-xl text-xs border border-[#26262b] transition cursor-pointer" title="Pausa Curta (5 min)">
                  5m
                </button>
              </div>
            </div>

            <!-- Coluna Direita: Tarefa e Subpassos -->
            <div class="flex flex-col space-y-3">
              <div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">Em Andamento</span>
                <h4 id="timerModalTaskTitle" class="text-sm font-bold text-[#fffff2] mt-1.5 leading-snug"></h4>
                <p id="timerModalTaskDesc" class="text-xs text-[#9d9da6] mt-1 line-clamp-2"></p>
              </div>

              <div class="border-t border-[#26262b] pt-3">
                <div class="flex items-center justify-between text-xs font-mono text-[#9d9da6] mb-2">
                  <span>Subpassos da Tarefa</span>
                  <span id="timerModalSubCount">0/0</span>
                </div>
                <div id="timerModalSublistContainer" class="space-y-1.5 max-h-[160px] overflow-y-auto custom-scroll pr-1">
                  <!-- Subpassos preenchidos dinamicamente -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('modalTimerPomodoro');
  } else {
    modal.classList.remove('hidden');
  }

  atualizarConteudoModalTimer(tarefa);
  atualizarDisplayTimerModal();
}

function atualizarConteudoModalTimer(tarefa) {
  const titleEl = document.getElementById('timerModalTaskTitle');
  const descEl = document.getElementById('timerModalTaskDesc');
  const countEl = document.getElementById('timerModalSubCount');
  const sublistEl = document.getElementById('timerModalSublistContainer');

  if (titleEl) titleEl.textContent = tarefa.titulo;
  if (descEl) {
    if (tarefa.descricao) {
      descEl.textContent = tarefa.descricao;
      descEl.classList.remove('hidden');
    } else {
      descEl.classList.add('hidden');
    }
  }

  const totalSubs = tarefa.subtarefas.length;
  const feitasSubs = tarefa.subtarefas.filter(s => s.feita).length;
  if (countEl) countEl.textContent = `${feitasSubs}/${totalSubs}`;

  if (sublistEl) {
    if (totalSubs > 0) {
      let html = '';
      tarefa.subtarefas.forEach(sub => {
        html += `
          <label class="flex items-center gap-2.5 p-2 rounded-lg bg-[#080808] border border-[#26262b] hover:border-[#3a3a42] cursor-pointer transition">
            <input type="checkbox" ${sub.feita ? 'checked' : ''} onchange="alternarSubtarefaNoModal(event, '${tarefa.id}', '${sub.id}')" class="w-4 h-4 rounded border-[#3a3a42] bg-[#161619] accent-[#fffff2] cursor-pointer">
            <span class="text-xs ${sub.feita ? 'line-through text-[#9d9da6]' : 'text-[#fffff2]'}">${sub.texto}</span>
          </label>
        `;
      });
      sublistEl.innerHTML = html;
    } else {
      sublistEl.innerHTML = `<p class="text-xs text-[#9d9da6] italic py-3 text-center">Nenhum subpasso cadastrado.</p>`;
    }
  }
}

async function alternarSubtarefaNoModal(event, taskId, subId) {
  await alternarSubtarefa(event, taskId, subId);
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (tarefa) {
    atualizarConteudoModalTimer(tarefa);
  }
}

function fecharTimerModal() {
  const modal = document.getElementById('modalTimerPomodoro');
  if (modal) modal.classList.add('hidden');
}

function alternarPlayPauseTimer() {
  if (timerRodando) {
    pausarTimer();
  } else {
    iniciarTimer();
  }
}

function iniciarTimer() {
  if (timerRodando) return;
  timerRodando = true;
  const icon = document.getElementById('playPauseIcon');
  const text = document.getElementById('playPauseText');
  if (icon) icon.textContent = 'pause';
  if (text) text.textContent = 'Pausar';

  timerIntervaloAtivo = setInterval(() => {
    if (timerSegundosRestantes > 0) {
      timerSegundosRestantes--;
      atualizarDisplayTimerModal();
    } else {
      pararTimer();
      mostrarToastFeedback("Tempo de foco concluído! Bom trabalho!");
      fecharTimerModal();
    }
  }, 1000);
}

function pausarTimer() {
  timerRodando = false;
  clearInterval(timerIntervaloAtivo);
  const icon = document.getElementById('playPauseIcon');
  const text = document.getElementById('playPauseText');
  if (icon) icon.textContent = 'play_arrow';
  if (text) text.textContent = 'Retomar';
}

function pararTimer() {
  timerRodando = false;
  clearInterval(timerIntervaloAtivo);
  timerSegundosRestantes = 25 * 60;
  const icon = document.getElementById('playPauseIcon');
  const text = document.getElementById('playPauseText');
  if (icon) icon.textContent = 'play_arrow';
  if (text) text.textContent = 'Iniciar';
}

function resetarTimer() {
  pausarTimer();
  timerSegundosRestantes = 25 * 60;
  atualizarDisplayTimerModal();
}

function definirTempoTimer(segundos) {
  pausarTimer();
  timerSegundosRestantes = segundos;
  atualizarDisplayTimerModal();
}

function atualizarDisplayTimerModal() {
  const mins = Math.floor(timerSegundosRestantes / 60);
  const secs = timerSegundosRestantes % 60;
  const formato = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const displayModal = document.getElementById('timerModalDisplay');
  if (displayModal) displayModal.textContent = formato;

  if (tarefaIdTimerAtual) {
    const displayCard = document.getElementById(`timer-display-${tarefaIdTimerAtual}`);
    if (displayCard) displayCard.textContent = formato;
  }
}
