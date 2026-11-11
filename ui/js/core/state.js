/**
 * @file state.js
 * @description Global application state and UI utility functions.
 */

export let tarefasDB = [];
export let filtroCategoriaAtiva = 'todas';
export let termoBuscaAtivo = '';
export let usuarioAtual = {
  nome: localStorage.getItem('userName') || 'Usuário',
  role: localStorage.getItem('role') || 'Estudante',
  estiloInstrucao: 'direto',
  autenticado: !!localStorage.getItem('token')
};
export let drawerChatAberto = true;
export let cardSendoDesestruturado = null;
export let idSendoArrastado = null;

export function setTarefasDB(novaLista) {
  tarefasDB = novaLista;
}

export function setFiltroCategoriaAtiva(cat) {
  filtroCategoriaAtiva = cat;
}

export function setTermoBuscaAtivo(termo) {
  termoBuscaAtivo = termo;
}

export function setSafeText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

export function mostrarToastFeedback(mensagem) {
  // Notificações toast desativadas.
}

export function atualizarInterfaceUsuario() {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const nomeVal = usuarioAtual.nome || localStorage.getItem('userName') || 'Usuário';
  const roleVal = usuarioAtual.role || localStorage.getItem('role') || 'Estudante';
  if (nameEl) nameEl.textContent = nomeVal;
  if (roleEl) roleEl.textContent = roleVal;
}
