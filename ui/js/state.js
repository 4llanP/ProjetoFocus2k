/**
 * @file state.js
 * @description Global application state and UI utility functions (toasts, text safety, user profile rendering).
 */

let tarefasDB = [];
let filtroCategoriaAtiva = 'todas';
let termoBuscaAtivo = '';
let usuarioAtual = {
  nome: localStorage.getItem('userName') || 'Usuário',
  role: localStorage.getItem('role') || 'Estudante',
  estiloInstrucao: 'direto',
  autenticado: !!localStorage.getItem('token')
};
let drawerChatAberto = true;
let cardSendoDesestruturado = null;
let idSendoArrastado = null;

/**
 * Safely updates text content of a DOM element by ID.
 * @param {string} id - Element ID.
 * @param {string|number} text - Text to set.
 */
function setSafeText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

/**
 * Displays a non-intrusive floating feedback toast message.
 * @param {string} mensagem - Message text to display.
 */
function mostrarToastFeedback(mensagem) {
  const container = document.getElementById('toastContainer');
  if (container) {
    const idToast = 'toast_' + Date.now();
    const html = `
      <div id="${idToast}" class="flex items-center gap-2.5 bg-[#161619] border border-[#26262b] text-[#fffff2] px-3.5 py-2.5 rounded-xl shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>${mensagem}</span>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
    setTimeout(() => {
      const el = document.getElementById(idToast);
      if (el) el.remove();
    }, 3500);
    return;
  }

  const toast = document.getElementById('liveFeedbackToast');
  if (toast) {
    toast.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-[#fffff2]"></span> ${mensagem}`;
    toast.classList.remove('hidden');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Updates sidebar user name and role display elements from global state or localStorage.
 */
function atualizarInterfaceUsuario() {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const nomeVal = usuarioAtual.nome || localStorage.getItem('userName') || 'Usuário';
  const roleVal = usuarioAtual.role || localStorage.getItem('role') || 'Estudante';
  if (nameEl) nameEl.textContent = nomeVal;
  if (roleEl) roleEl.textContent = roleVal;
}
