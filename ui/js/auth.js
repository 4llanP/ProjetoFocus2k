/**
 * @file auth.js
 * @description Authentication, session validation, profile modal management, and logout handling.
 */

/**
 * Clears local session tokens and redirects to the login screen.
 */
function deslogar() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  localStorage.removeItem('role');
  window.location.href = 'tela_login.html';
}

/**
 * Opens the user profile modal and populates fields with current user data and active theme.
 */
function abrirModalPerfil() {
  const modalNome = document.getElementById('perfilModalNome');
  const modalRole = document.getElementById('perfilModalRole');
  const modalEstilo = document.getElementById('perfilModalEstilo');
  const modalPerfil = document.getElementById('modalPerfil');
  const selectTemaModal = document.getElementById('selectTemaModal');

  if (modalNome) modalNome.textContent = usuarioAtual.nome || localStorage.getItem('userName') || 'Usuário';
  if (modalRole) modalRole.textContent = usuarioAtual.role || localStorage.getItem('role') || 'Estudante';
  if (modalEstilo) modalEstilo.textContent = usuarioAtual.estiloInstrucao || 'direto';
  if (selectTemaModal) selectTemaModal.value = localStorage.getItem('focus2k_tema') || 'obsidian';

  if (modalPerfil) modalPerfil.classList.remove('hidden');
}

/**
 * Closes the user profile modal.
 */
function fecharModalPerfil() {
  const modalPerfil = document.getElementById('modalPerfil');
  if (modalPerfil) modalPerfil.classList.add('hidden');
}

/**
 * Verifies active user session via backend API and loads user details & tasks.
 */
async function verificarSessaoECarregar() {
  let user = null;
  try {
    const resUser = await apiFetch(`${API_URL}/usuarios/me`);
    if (!resUser.ok) {
      localStorage.removeItem('token');
      window.location.href = 'tela_login.html';
      return;
    }
    user = await resUser.json();
  } catch (err) {
    localStorage.removeItem('token');
    window.location.href = 'tela_login.html';
    return;
  }

  try {
    usuarioAtual = {
      nome: user.nome,
      role: user.role,
      estiloInstrucao: user.estilo_instrucao || 'direto',
      autenticado: true
    };
    localStorage.setItem('userName', user.nome);
    localStorage.setItem('role', user.role);
    atualizarInterfaceUsuario();
    if (typeof carregarTarefasDaAPI === 'function') {
      await carregarTarefasDaAPI();
    }
  } catch (uiErr) {}
}
