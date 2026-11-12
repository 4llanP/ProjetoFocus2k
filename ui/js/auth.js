/**
 * @file auth.js
 * @description Authentication, session validation, profile modal management, and logout handling.
 */

/**
 * Clears local session tokens and redirects to the login screen.
 */
function deslogar() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("role");
  window.location.href = "tela_login.html";
}

/**
 * Opens the user profile modal and populates fields with current user data and active theme.
 */
function abrirModalPerfil() {
  const inputNome = document.getElementById("inputPerfilNome");
  const selectEstilo = document.getElementById("selectPerfilEstilo");
  const modalPerfil = document.getElementById("modalPerfil");
  const selectTemaModal = document.getElementById("selectTemaModal");

  if (inputNome) {
    inputNome.value =
      usuarioAtual.nome || localStorage.getItem("userName") || "";
  }
  if (selectEstilo)
    selectEstilo.value = usuarioAtual.estiloInstrucao || "direto";
  if (selectTemaModal)
    selectTemaModal.value = localStorage.getItem("focus2k_tema") || "obsidian";

  if (modalPerfil) modalPerfil.classList.remove("hidden");
}

/**
 * Closes the user profile modal.
 */
function fecharModalPerfil() {
  const modalPerfil = document.getElementById("modalPerfil");
  if (modalPerfil) modalPerfil.classList.add("hidden");
}

/**
 * Saves updated profile details to the backend database.
 */
async function salvarPerfil() {
  const inputNome = document.getElementById("inputPerfilNome");
  const selectEstilo = document.getElementById("selectPerfilEstilo");
  if (!inputNome || !selectEstilo) return;

  const nomeAtual = usuarioAtual.nome || localStorage.getItem("userName") || "";
  const novoNome = inputNome.value.trim() || nomeAtual;
  const novoEstilo = selectEstilo.value;

  if (!novoNome) {
    alert("O nome do usuário não pode estar vazio.");
    return;
  }

  if (!usuarioAtual.id) {
    alert("ID do usuário não encontrado.");
    return;
  }

  try {
    const res = await apiFetch(`${API_URL}/usuarios/${usuarioAtual.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: novoNome,
        email: usuarioAtual.email || "usuario@focus2k.com",
        estilo_instrucao: novoEstilo,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      usuarioAtual.nome = novoNome;
      usuarioAtual.estiloInstrucao = novoEstilo;
      localStorage.setItem("userName", novoNome);
      if (typeof atualizarInterfaceUsuario === "function") {
        atualizarInterfaceUsuario();
      }
      fecharModalPerfil();
      if (typeof mostrarToastFeedback === "function") {
        mostrarToastFeedback("Perfil e preferências atualizados com sucesso!");
      }
    } else {
      if (typeof mostrarToastFeedback === "function") {
        mostrarToastFeedback(
          `Erro: ${data.detail || "Não foi possível atualizar o perfil"}`,
        );
      }
    }
  } catch (err) {
    console.error("Erro ao salvar perfil:", err);
    if (typeof mostrarToastFeedback === "function") {
      mostrarToastFeedback("Erro de conexão ao atualizar perfil.");
    }
  }
}

/**
 * Verifies active user session via backend API and loads user details & tasks.
 */
async function verificarSessaoECarregar() {
  let user = null;
  try {
    const resUser = await apiFetch(`${API_URL}/usuarios/me`);
    if (!resUser.ok) {
      localStorage.removeItem("token");
      window.location.href = "tela_login.html";
      return;
    }
    user = await resUser.json();
  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "tela_login.html";
    return;
  }

  try {
    const nomeUsuario =
      user.nome || (user.email ? user.email.split("@")[0] : "Usuário");
    window.usuarioAtual = {
      id: user.id,
      nome: nomeUsuario,
      email: user.email,
      role: user.role,
      estiloInstrucao: user.estilo_instrucao || "direto",
      autenticado: true,
    };
    localStorage.setItem("userName", nomeUsuario);
    if (user.email) localStorage.setItem("userEmail", user.email);
    localStorage.setItem("role", user.role);
    if (typeof atualizarInterfaceUsuario === "function") {
      atualizarInterfaceUsuario();
    }
    if (typeof carregarTarefasDaAPI === "function") {
      await carregarTarefasDaAPI();
    }
  } catch (uiErr) {
    console.error("Erro ao atualizar interface com dados do usuário:", uiErr);
  }
}
