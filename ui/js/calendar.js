/**
 * @file calendar.js
 * @description Calendar view management, month navigation, goal rendering, and theme switching logic.
 */

let calendarAnoAtual = new Date().getFullYear();
let calendarMesAtual = new Date().getMonth();

/**
 * Changes active application view between kanban and calendar.
 * @param {string} visao - 'kanban' or 'calendario'.
 */
function mudarVisao(visao) {
  const kanbanContainer = document.getElementById('kanbanViewContainer');
  const calendarContainer = document.getElementById('calendarViewContainer');
  const navKanban = document.getElementById('navKanbanBtn');
  const navCalendar = document.getElementById('navCalendarBtn');

  if (visao === 'calendario') {
    if (kanbanContainer) kanbanContainer.classList.add('hidden');
    if (calendarContainer) calendarContainer.classList.remove('hidden');
    if (navCalendar) navCalendar.className = "flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1f1f24] text-[#fffff2] font-medium text-xs border border-[#3a3a42] transition cursor-pointer";
    if (navKanban) navKanban.className = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9d9da6] hover:bg-[#161619] hover:text-[#fffff2] transition font-medium text-xs border border-transparent cursor-pointer";
    renderizarCalendario();
    mostrarToastFeedback("Visão: Calendário de Metas");
  } else {
    if (calendarContainer) calendarContainer.classList.add('hidden');
    if (kanbanContainer) kanbanContainer.classList.remove('hidden');
    if (navKanban) navKanban.className = "flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#1f1f24] text-[#fffff2] font-medium text-xs border border-[#3a3a42] transition cursor-pointer";
    if (navCalendar) navCalendar.className = "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9d9da6] hover:bg-[#161619] hover:text-[#fffff2] transition font-medium text-xs border border-transparent cursor-pointer";
    mostrarToastFeedback("Visão: Quadro Principal (Kanban)");
  }
}

/**
 * Navigates calendar months by delta (+1 or -1).
 * @param {number} delta - Month shift amount.
 */
function mudarMesCalendario(delta) {
  calendarMesAtual += delta;
  if (calendarMesAtual > 11) {
    calendarMesAtual = 0;
    calendarAnoAtual++;
  } else if (calendarMesAtual < 0) {
    calendarMesAtual = 11;
    calendarAnoAtual--;
  }
  renderizarCalendario();
}

/**
 * Resets calendar view to current month and year.
 */
function irParaMesAtual() {
  const agora = new Date();
  calendarAnoAtual = agora.getFullYear();
  calendarMesAtual = agora.getMonth();
  renderizarCalendario();
}

/**
 * Renders the interactive calendar grid and tasks matching deadlines.
 */
function renderizarCalendario() {
  const titleEl = document.getElementById('calendarMonthTitle');
  const gridEl = document.getElementById('calendarGridDays');
  if (!titleEl || !gridEl) return;

  const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  titleEl.textContent = `${nomesMeses[calendarMesAtual]} ${calendarAnoAtual}`;

  const primeiroDiaDoMes = new Date(calendarAnoAtual, calendarMesAtual, 1);
  const ultimoDiaDoMes = new Date(calendarAnoAtual, calendarMesAtual + 1, 0);
  const diasNoMes = ultimoDiaDoMes.getDate();
  const diaDaSemanaInicio = primeiroDiaDoMes.getDay();

  const ultimoDiaMesAnterior = new Date(calendarAnoAtual, calendarMesAtual, 0).getDate();

  let htmlGrid = '';
  const agora = new Date();
  const hojeStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  // Previous month trailing days
  for (let i = diaDaSemanaInicio - 1; i >= 0; i--) {
    const diaNum = ultimoDiaMesAnterior - i;
    htmlGrid += `
      <div class="min-h-[100px] p-2 bg-[#080808]/50 opacity-40 text-[#9d9da6] font-mono text-xs flex flex-col">
        <span class="font-bold">${diaNum}</span>
      </div>
    `;
  }

  // Current month days
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const mesStr = String(calendarMesAtual + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    const dataIsoStr = `${calendarAnoAtual}-${mesStr}-${diaStr}`;
    const ehHoje = (dataIsoStr === hojeStr);

    const tarefasDoDia = (typeof tarefasDB !== 'undefined' ? tarefasDB : []).filter(t => {
      if (!t.prazo) return false;
      return String(t.prazo).substring(0, 10) === dataIsoStr;
    });

    let tarefasHtml = '';
    tarefasDoDia.forEach(t => {
      let corPrioridade = 'bg-emerald-400';
      if (t.prioridade === 'alta') corPrioridade = 'bg-rose-500';
      else if (t.prioridade === 'media') corPrioridade = 'bg-amber-400';

      const statusBadge = t.status === 'concluido' ? 'line-through opacity-60' : '';

      tarefasHtml += `
        <div onclick="event.stopPropagation(); abrirModalDetalhesTarefa('${t.id}')" class="p-1.5 rounded bg-[#161619] border border-[#26262b] hover:border-[#fffff2] transition cursor-pointer text-[10px] space-y-0.5 ${statusBadge}" title="${t.titulo}">
          <div class="flex items-center gap-1 font-medium text-[#fffff2] truncate">
            <span class="w-1.5 h-1.5 rounded-full ${corPrioridade} flex-shrink-0"></span>
            <span class="truncate">${t.titulo}</span>
          </div>
        </div>
      `;
    });

    const hojeClasses = ehHoje ? 'bg-[#1f1f24] border-2 border-[#fffff2]' : 'bg-[#111113]';
    const hojeBadge = ehHoje ? '<span class="ml-auto text-[9px] bg-[#fffff2] text-[#080808] px-1 rounded font-bold">Hoje</span>' : '';

    htmlGrid += `
      <div onclick="clicarDiaCalendario('${dataIsoStr}')" class="min-h-[110px] p-2.5 ${hojeClasses} flex flex-col transition hover:bg-[#161619]/40 group cursor-pointer relative hover:border hover:border-[#fffff2]/30" title="Clique para adicionar meta nesta data">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-bold text-xs font-mono ${ehHoje ? 'text-[#fffff2]' : 'text-[#9d9da6] group-hover:text-[#fffff2]'}">${dia}</span>
          <span class="opacity-0 group-hover:opacity-100 transition text-[10px] font-mono text-[#fffff2] bg-[#1f1f24] px-1.5 py-0.5 rounded border border-[#3a3a42] flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[12px]">add</span> Adicionar
          </span>
          ${hojeBadge}
        </div>
        <div class="flex-1 space-y-1 overflow-y-auto custom-scroll max-h-[80px]" onclick="event.stopPropagation()">
          ${tarefasHtml}
        </div>
      </div>
    `;
  }

  // Next month leading days
  const totalCelulasPreenchidas = diaDaSemanaInicio + diasNoMes;
  const resto = totalCelulasPreenchidas % 7;
  if (resto !== 0) {
    const diasRestantes = 7 - resto;
    for (let diaProx = 1; diaProx <= diasRestantes; diaProx++) {
      htmlGrid += `
        <div class="min-h-[100px] p-2 bg-[#080808]/50 opacity-40 text-[#9d9da6] font-mono text-xs flex flex-col">
          <span class="font-bold">${diaProx}</span>
        </div>
      `;
    }
  }

  gridEl.innerHTML = htmlGrid;
}

/**
 * Shows task details when clicked in calendar.
 * @param {string} taskId - Task ID.
 */
function abrirModalDetalhesTarefa(taskId) {
  const tarefa = tarefasDB.find(t => t.id === taskId);
  if (!tarefa) return;
  mostrarToastFeedback(`Meta: "${tarefa.titulo.slice(0, 30)}..." [${tarefa.status.toUpperCase()}]`);
}

/**
 * Handles clicking a day cell in calendar to create task with pre-filled date.
 * @param {string} dataIsoStr - ISO date string (YYYY-MM-DD).
 */
function clicarDiaCalendario(dataIsoStr) {
  if (typeof abrirModalCriarTarefa === 'function') {
    abrirModalCriarTarefa(dataIsoStr);
  }
  mostrarToastFeedback(`Nova meta agendada para ${dataIsoStr}`);
}

const temasDB = {
  obsidian: {
    bg: '#080808',
    surface: '#111113',
    card: '#161619',
    cardHover: '#1c1c21',
    border: '#26262b',
    borderLight: '#3a3a42',
    text: '#fffff2',
    muted: '#9d9da6'
  },
  slate: {
    bg: '#0d1117',
    surface: '#161b22',
    card: '#21262d',
    cardHover: '#30363d',
    border: '#30363d',
    borderLight: '#484f58',
    text: '#f0f6fc',
    muted: '#8b949e'
  },
  indigo: {
    bg: '#0b0f19',
    surface: '#0f172a',
    card: '#1e293b',
    cardHover: '#334155',
    border: '#334155',
    borderLight: '#475569',
    text: '#f8fafc',
    muted: '#94a3b8'
  }
};

/**
 * Changes application visual theme across the entire dashboard (including calendar, modals, etc.).
 * @param {string} nomeTema - Theme name ('obsidian', 'slate', 'indigo').
 */
function mudarTema(nomeTema) {
  const tema = temasDB[nomeTema] || temasDB.obsidian;
  const root = document.documentElement;

  root.style.setProperty('--app-bg', tema.bg);
  root.style.setProperty('--app-surface', tema.surface);
  root.style.setProperty('--app-card', tema.card);
  root.style.setProperty('--app-card-hover', tema.cardHover);
  root.style.setProperty('--app-border', tema.border);
  root.style.setProperty('--app-border-light', tema.borderLight);
  root.style.setProperty('--app-text', tema.text);
  root.style.setProperty('--app-muted', tema.muted);

  document.body.style.backgroundColor = tema.bg;
  document.body.style.setProperty('--app-bg', tema.bg);
  document.body.style.setProperty('--app-surface', tema.surface);
  document.body.style.setProperty('--app-card', tema.card);
  document.body.style.setProperty('--app-card-hover', tema.cardHover);
  document.body.style.setProperty('--app-border', tema.border);
  document.body.style.setProperty('--app-border-light', tema.borderLight);
  document.body.style.setProperty('--app-text', tema.text);
  document.body.style.setProperty('--app-muted', tema.muted);

  document.body.className = document.body.className.replace(/theme-\S+/g, '').trim();
  if (nomeTema !== 'obsidian') {
    document.body.classList.add(`theme-${nomeTema}`);
  }
  localStorage.setItem('focus2k_tema', nomeTema);

  const select1 = document.getElementById('selectTema');
  const select2 = document.getElementById('selectTemaModal');
  if (select1) select1.value = temaSalvo; // wait, select1.value = nomeTema
  if (select1) select1.value = nomeTema;
  if (select2) select2.value = nomeTema;

  mostrarToastFeedback(`Tema alterado para: ${nomeTema.toUpperCase()}`);
}

// Initialize theme on load
window.addEventListener('DOMContentLoaded', () => {
  const temaSalvo = localStorage.getItem('focus2k_tema') || 'obsidian';
  const select1 = document.getElementById('selectTema');
  const select2 = document.getElementById('selectTemaModal');
  if (select1) select1.value = temaSalvo;
  if (select2) select2.value = temaSalvo;
  mudarTema(temaSalvo);
});
