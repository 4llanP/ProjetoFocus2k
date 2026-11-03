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
  // Notificações toast desativadas a pedido do usuário.
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
