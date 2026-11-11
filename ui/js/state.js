/**
 * @file state.js
 * @description Global application state and UI utility functions (toasts, text safety, user profile rendering).
 */

window.tarefasDB = [];
window.filtroCategoriaAtiva = 'todas';
window.termoBuscaAtivo = '';
window.usuarioAtual = {
  nome: localStorage.getItem('userName') || 'Usuário',
  role: localStorage.getItem('role') || 'Estudante',
  estiloInstrucao: 'direto',
  autenticado: !!localStorage.getItem('token')
};
window.drawerChatAberto = true;
window.cardSendoDesestruturado = null;
window.idSendoArrastado = null;

function setTarefasDB(novaLista) {
  window.tarefasDB = novaLista;
}

function setFiltroCategoriaAtiva(cat) {
  window.filtroCategoriaAtiva = cat;
}

function setTermoBuscaAtivo(termo) {
  window.termoBuscaAtivo = termo;
}

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
  // Notificações toast desativadas a pedido do usuário.
}

/**
 * Updates sidebar user name and role display elements from global state or localStorage.
 */
function atualizarInterfaceUsuario() {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const nomeVal = window.usuarioAtual.nome || localStorage.getItem('userName') || 'Usuário';
  const roleVal = window.usuarioAtual.role || localStorage.getItem('role') || 'Estudante';
  if (nameEl) nameEl.textContent = nomeVal;
  if (roleEl) roleEl.textContent = roleVal;
}

window.setTarefasDB = setTarefasDB;
window.setFiltroCategoriaAtiva = setFiltroCategoriaAtiva;
window.setTermoBuscaAtivo = setTermoBuscaAtivo;
window.setSafeText = setSafeText;
window.mostrarToastFeedback = mostrarToastFeedback;
window.atualizarInterfaceUsuario = atualizarInterfaceUsuario;
