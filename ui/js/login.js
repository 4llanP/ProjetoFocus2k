/**
 * @file login.js
 * @description Authentication, login validation, and user registration logic for the login screen.
 */

const API_URL = "";

function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function mudarAba(aba) {
  const formLog = document.getElementById('formLogin');
  const formCad = document.getElementById('formCadastro');
  const tabLog = document.getElementById('tabLogin');
  const tabCad = document.getElementById('tabCadastro');
  esconderAlerta();

  if (aba === 'login') {
    if (formLog) formLog.classList.remove('hidden');
    if (formCad) formCad.classList.add('hidden');
    if (tabLog) tabLog.className = 'flex-1 pb-3 text-sm sm:text-base font-bold text-[#fffff2] border-b-2 border-[#fffff2] text-center transition flex items-center justify-center gap-2';
    if (tabCad) tabCad.className = 'flex-1 pb-3 text-sm sm:text-base font-medium text-[#75757d] hover:text-[#d6d6de] border-b-2 border-transparent text-center transition flex items-center justify-center gap-2';
    const loginUser = document.getElementById('loginUser');
    if (loginUser) loginUser.focus();
  } else {
    if (formLog) formLog.classList.add('hidden');
    if (formCad) formCad.classList.remove('hidden');
    if (tabCad) tabCad.className = 'flex-1 pb-3 text-sm sm:text-base font-bold text-[#fffff2] border-b-2 border-[#fffff2] text-center transition flex items-center justify-center gap-2';
    if (tabLog) tabLog.className = 'flex-1 pb-3 text-sm sm:text-base font-medium text-[#75757d] hover:text-[#d6d6de] border-b-2 border-transparent text-center transition flex items-center justify-center gap-2';
    const cadNome = document.getElementById('cadNome');
    if (cadNome) cadNome.focus();
  }
}

function alternarVisibilidadeSenha(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.textContent = '';
  } else {
    input.type = 'password';
    if (icon) icon.textContent = '';
  }
}

function mostrarAlerta(msg, tipo) {
  const alert = document.getElementById('statusAlert');
  const icon = document.getElementById('alertIcon');
  const text = document.getElementById('alertMessage');
  if (!alert) return;

  alert.classList.remove('hidden', 'bg-rose-950/70', 'border-rose-500/80', 'text-rose-200', 'bg-emerald-950/70', 'border-emerald-500/80', 'text-emerald-200', 'bg-[#18181c]', 'border-[#333338]', 'text-[#fffff2]');

  if (tipo === 'erro') {
    alert.classList.add('bg-rose-950/70', 'border-rose-500/80', 'text-rose-200');
    if (icon) icon.textContent = '';
  } else if (tipo === 'sucesso') {
    alert.classList.add('bg-emerald-950/70', 'border-emerald-500/80', 'text-emerald-200');
    if (icon) icon.textContent = '';
  } else {
    alert.classList.add('bg-[#18181c]', 'border-[#333338]', 'text-[#fffff2]');
    if (icon) icon.textContent = 'ℹ';
  }

  if (text) text.textContent = msg;
}

function esconderAlerta() {
  const alert = document.getElementById('statusAlert');
  if (alert) alert.classList.add('hidden');
}

async function executarLogin() {
  const loginUserInput = document.getElementById('loginUser');
  const loginPassInput = document.getElementById('loginPassword');
  if (!loginUserInput || !loginPassInput) return;

  const email = loginUserInput.value.trim();
  const pass = loginPassInput.value;

  if (!email) {
    mostrarAlerta('Por favor, informe seu e-mail para prosseguir.', 'erro');
    loginUserInput.focus();
    return;
  }

  if (!validarEmail(email)) {
    mostrarAlerta('Por favor, informe um endereço de e-mail válido.', 'erro');
    loginUserInput.focus();
    return;
  }

  if (!pass) {
    mostrarAlerta('Por favor, digite sua senha de acesso.', 'erro');
    loginPassInput.focus();
    return;
  }

  try {
    mostrarAlerta('Autenticando...', 'info');
    const res = await fetch(`${API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email, senha: pass })
    });

    const data = await res.json();

    if (res.ok) {
      const tVal = data.token || data.access_token;
      if (tVal) {
        localStorage.setItem('token', tVal);
      }
      if (data.role) {
        localStorage.setItem('role', data.role);
      }
      if (data.nome) {
        localStorage.setItem('userName', data.nome);
      }
      if (email) {
        localStorage.setItem('userEmail', email);
        if (!data.nome) {
          localStorage.setItem('userName', email.split('@')[0]);
        }
      }
      mostrarAlerta('Login realizado com sucesso! Redirecionando para o Dashboard...', 'sucesso');
      setTimeout(() => {
        window.location.href = 'dashboard.html?v=' + Date.now();
      }, 1500);
    } else {
      mostrarAlerta(data.detail || 'Credenciais inválidas. Se ainda não tem conta, cadastre-se na aba "Criar Acesso".', 'erro');
    }
  } catch (err) {
    console.error("Erro de conexão no login:", err);
    mostrarAlerta('Não foi possível conectar ao servidor backend em http://localhost:8000. O Uvicorn está rodando?', 'erro');
  }
}

async function executarCadastro() {
  const cadNomeInput = document.getElementById('cadNome');
  const cadEmailInput = document.getElementById('cadEmail');
  const cadSenhaInput = document.getElementById('cadSenha');
  const cadEstiloInput = document.getElementById('cadEstilo');
  if (!cadNomeInput || !cadEmailInput || !cadSenhaInput || !cadEstiloInput) return;

  const nome = cadNomeInput.value.trim();
  const email = cadEmailInput.value.trim();
  const senha = cadSenhaInput.value;
  const estilo = cadEstiloInput.value;

  if (!nome || nome.length < 3) {
    mostrarAlerta('O nome deve conter ao menos 3 caracteres.', 'erro');
    cadNomeInput.focus();
    return;
  }

  if (!email || !validarEmail(email)) {
    mostrarAlerta('Por favor, informe um e-mail válido.', 'erro');
    cadEmailInput.focus();
    return;
  }

  if (!senha || senha.length < 4) {
    mostrarAlerta('A senha precisa ter no mínimo 4 caracteres.', 'erro');
    cadSenhaInput.focus();
    return;
  }

  try {
    mostrarAlerta('Criando conta...', 'info');
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: nome,
        email: email,
        senha: senha,
        estilo_instrucao: estilo
      })
    });

    const data = await res.json();

    if (res.ok) {
      mostrarAlerta('Conta criada com sucesso! Faça login com suas credenciais.', 'sucesso');
      setTimeout(() => {
        mudarAba('login');
        const loginUser = document.getElementById('loginUser');
        const loginPass = document.getElementById('loginPassword');
        if (loginUser) loginUser.value = email;
        if (loginPass) loginPass.value = '';
      }, 1400);
    } else {
      mostrarAlerta(data.detail || 'Erro ao criar conta no sistema.', 'erro');
    }
  } catch (err) {
    mostrarAlerta('Não foi possível conectar ao servidor backend.', 'erro');
  }
}

function mostrarDicaSenha() {
  mostrarAlerta('Instruções de recuperação foram enviadas para seu e-mail cadastrado.', 'info');
}

function loginDemoInstitucional() {
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPassword');
  if (loginUser) loginUser.value = 'aluno.academico@focus2k.edu.br';
  if (loginPass) loginPass.value = 'senha1234';
  executarLogin();
}
