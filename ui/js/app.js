/**
 * @file app.js
 * @description Application initialization, modals, task creation modal logic, drag & drop handlers, and filtering logic.
 */

let modalTipoEstudoSelecionado = 'tarefas_educacionais';
let modalPrioridadeSelecionada = 'media';
let tarefaEmEdicaoId = null;

function formatarMascaraData(input) {
  let v = input.value.replace(/\D/g, '');
  if (v.length > 8) v = v.substring(0, 8);

  if (v.length > 4) {
    input.value = `${v.substring(0, 2)}/${v.substring(2, 4)}/${v.substring(4)}`;
  } else if (v.length > 2) {
    input.value = `${v.substring(0, 2)}/${v.substring(2)}`;
  } else {
    input.value = v;
  }
}

function iniciarArrasto(event, taskId) {
  idSendoArrastado = taskId;
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.effectAllowed = 'move';
  }
}

function permitirDrop(event) {
  event.preventDefault();
}

function permitirSoltar(event) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

async function dropTarefa(event, novoStatus) {
  event.preventDefault();
  const taskId = (event.dataTransfer && event.dataTransfer.getData('text/plain')) || idSendoArrastado;
  idSendoArrastado = null;
  if (taskId) {
    await arrastarTarefa(taskId, novoStatus);
  }
}

function soltarTarefa(event, novoStatus) {
  dropTarefa(event, novoStatus);
}

function selecionarPrioridadeModal(prioridade) {
  modalPrioridadeSelecionada = prioridade;
  const btnBaixa = document.getElementById('btnPrioridadeBaixa');
  const btnMedia = document.getElementById('btnPrioridadeMedia');
  const btnAlta = document.getElementById('btnPrioridadeAlta');

  [btnBaixa, btnMedia, btnAlta].forEach(btn => {
    if (btn) {
      btn.className = "flex-1 py-2 rounded-lg text-xs font-medium text-[#9d9da6] hover:text-[#fffff2] transition";
    }
  });

  if (prioridade === 'baixa' && btnBaixa) {
    btnBaixa.className = "flex-1 py-2 rounded-lg text-xs font-bold bg-[#fffff2] text-[#080808] shadow-sm transition";
  } else if (prioridade === 'media' && btnMedia) {
    btnMedia.className = "flex-1 py-2 rounded-lg text-xs font-bold bg-[#fffff2] text-[#080808] shadow-sm transition";
  } else if (prioridade === 'alta' && btnAlta) {
    btnAlta.className = "flex-1 py-2 rounded-lg text-xs font-bold bg-[#fffff2] text-[#080808] shadow-sm transition";
  }
}

function selecionarTipoEstudo(tipo) {
  const btnEdu = document.getElementById('btnTipoEdu');
  const btnRotina = document.getElementById('btnTipoRotina');

  if (tipo === 'educacional' || tipo === 'tarefas_educacionais') {
    modalTipoEstudoSelecionado = 'tarefas_educacionais';
    if (btnEdu) {
      btnEdu.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fffff2] text-[#080808] shadow-sm transition";
    }
    if (btnRotina) {
      btnRotina.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-[#9d9da6] hover:text-[#fffff2] transition";
    }
  } else {
    modalTipoEstudoSelecionado = 'tarefas_diarias';
    if (btnRotina) {
      btnRotina.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fffff2] text-[#080808] shadow-sm transition";
    }
    if (btnEdu) {
      btnEdu.className = "px-3 py-1.5 rounded-lg text-xs font-medium text-[#9d9da6] hover:text-[#fffff2] transition";
    }
  }
}

function abrirModalCriarTarefa(dataInicial = null) {
  tarefaEmEdicaoId = null;
  const modal = document.getElementById('modalCriarTarefa');
  const tituloEl = document.getElementById('modalCriarTarefaTitulo');
  const btnTextEl = document.getElementById('modalCriarTarefaBtnText');
  if (tituloEl) tituloEl.textContent = 'Criar nova tarefa';
  if (btnTextEl) btnTextEl.textContent = 'Criar Tarefa';

  if (modal) {
    const inputNome = document.getElementById('inputNomeTarefaModal');
    const inputDesc = document.getElementById('inputDescricaoModal');
    const inputData = document.getElementById('inputDataModal');

    if (inputNome) inputNome.value = '';
    if (inputDesc) inputDesc.value = '';

    if (inputData) {
      if (dataInicial) {
        const partes = dataInicial.split('-');
        if (partes.length === 3) {
          inputData.value = `${partes[2]}/${partes[1]}/${partes[0]}`;
        } else {
          inputData.value = dataInicial;
        }
      } else {
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        inputData.value = `${dia}/${mes}/${ano}`;
      }
    }

    selecionarTipoEstudo('educacional');
    selecionarPrioridadeModal('media');

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function abrirModalEditarTarefa(taskId) {
  const tarefa = tarefasDB.find(t => String(t.id) === String(taskId) || String(t.realId) === String(taskId));
  if (!tarefa) {
    mostrarToastFeedback('Tarefa não encontrada para edição.');
    return;
  }

  tarefaEmEdicaoId = tarefa.realId || tarefa.id;
  const modal = document.getElementById('modalCriarTarefa');
  const tituloEl = document.getElementById('modalCriarTarefaTitulo');
  const btnTextEl = document.getElementById('modalCriarTarefaBtnText');
  if (tituloEl) tituloEl.textContent = 'Editar Tarefa';
  if (btnTextEl) btnTextEl.textContent = 'Salvar Alterações';

  if (modal) {
    const inputNome = document.getElementById('inputNomeTarefaModal');
    const inputDesc = document.getElementById('inputDescricaoModal');
    const inputData = document.getElementById('inputDataModal');

    if (inputNome) inputNome.value = tarefa.titulo || '';
    if (inputDesc) inputDesc.value = tarefa.descricao || '';

    if (inputData) {
      if (tarefa.prazo) {
        const partes = tarefa.prazo.split('-');
        if (partes.length === 3) {
          inputData.value = `${partes[2]}/${partes[1]}/${partes[0]}`;
        } else {
          inputData.value = tarefa.prazo;
        }
      } else {
        inputData.value = '';
      }
    }

    selecionarTipoEstudo(tarefa.tipo || 'tarefas_educacionais');
    selecionarPrioridadeModal(tarefa.prioridade || 'media');

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
}

function fecharModalCriarTarefa() {
  const modal = document.getElementById('modalCriarTarefa');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

async function confirmarCriarTarefaModal() {
  const tituloInput = document.getElementById('inputNomeTarefaModal');
  const descInput = document.getElementById('inputDescricaoModal');
  const dataInput = document.getElementById('inputDataModal');

  const titulo = tituloInput ? tituloInput.value.trim() : '';
  const descricao = descInput ? descInput.value.trim() : '';
  const dataStr = dataInput ? dataInput.value.trim() : '';

  if (!titulo || titulo.length < 3) {
    mostrarToastFeedback('O título da tarefa deve ter pelo menos 3 caracteres.');
    return;
  }

  let prazoISO = null;
  if (dataStr) {
    let partes = [];
    if (dataStr.includes('/')) {
      partes = dataStr.split('/');
    } else if (dataStr.includes('-')) {
      partes = dataStr.split('-');
    }
    if (partes.length === 3) {
      if (partes[0].length === 4) {
        prazoISO = `${partes[0]}-${partes[1]}-${partes[2]}`;
      } else {
        let dia = partes[0].padStart(2, '0');
        let mes = partes[1].padStart(2, '0');
        let ano = partes[2];
        if (ano.length === 2) {
          ano = '20' + ano;
        }
        prazoISO = `${ano}-${mes}-${dia}`;
      }
    }
  }

  if (!prazoISO) {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    prazoISO = `${ano}-${mes}-${dia}`;
  }

  let statusAutomatico = 'pendente';
  let prioridadeFinal = modalPrioridadeSelecionada;
  if (prazoISO) {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hojeStr = `${ano}-${mes}-${dia}`;
    if (prazoISO < hojeStr) {
      statusAutomatico = 'em_andamento';
      prioridadeFinal = 'alta';
    }
  }

  try {
    let url = `${API_URL}/tarefas`;
    let method = 'POST';
    let bodyData = {
      tipo: modalTipoEstudoSelecionado,
      titulo: titulo,
      descricao: descricao || null,
      prioridade: prioridadeFinal,
      prazo: prazoISO
    };

    if (tarefaEmEdicaoId) {
      url = `${API_URL}/tarefas/${tarefaEmEdicaoId}`;
      method = 'PUT';
    }

    const res = await apiFetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });

    const data = await res.json();
    if (res.ok) {
      const novaTarefaCriada = data.dados || data;
      const novaId = novaTarefaCriada.id || tarefaEmEdicaoId;

      if (!tarefaEmEdicaoId && statusAutomatico === 'em_andamento' && novaId) {
        await apiFetch(`${API_URL}/tarefas/${novaId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'em_andamento' })
        });
      }

      fecharModalCriarTarefa();
      if (typeof carregarTarefasDaAPI === 'function') {
        await carregarTarefasDaAPI();
      }
      if (typeof renderizarCalendario === 'function') {
        renderizarCalendario();
      }
      mostrarToastFeedback(tarefaEmEdicaoId ? 'Tarefa atualizada com sucesso!' : (statusAutomatico === 'em_andamento' ? 'Tarefa criada em "Em progresso" (data vencida)!' : 'Tarefa criada em "A Fazer"!'));
    } else {
      mostrarToastFeedback(`Erro: ${data.detail || 'Não foi possível salvar a tarefa'}`);
    }
  } catch (err) {
    console.error("Erro ao salvar tarefa:", err);
    mostrarToastFeedback('Erro de conexão ao salvar tarefa.');
  }
}

function filtrarCategoria(cat) {
  filtroCategoriaAtiva = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === cat) {
      btn.classList.add('bg-[#1f1f24]', 'text-[#fffff2]', 'border-[#3a3a42]');
      btn.classList.remove('text-[#9d9da6]', 'border-transparent');
    } else {
      btn.classList.remove('bg-[#1f1f24]', 'text-[#fffff2]', 'border-[#3a3a42]');
      btn.classList.add('text-[#9d9da6]', 'border-transparent');
    }
  });
  if (typeof listarTarefas === 'function') listarTarefas();
}

function filtrarTarefasInput(valor) {
  termoBuscaAtivo = valor;
  if (typeof listarTarefas === 'function') listarTarefas();
}

function alternarMenuLateral() {
  const sidebar = document.getElementById('sidebar');
  const icon = document.getElementById('hamburgerIcon');
  if (!sidebar) return;
  const estaFechada = sidebar.classList.contains('-translate-x-full') || sidebar.style.display === 'none';

  if (estaFechada) {
    sidebar.classList.remove('-translate-x-full', 'w-0', 'p-0');
    sidebar.classList.add('w-64');
    sidebar.style.display = 'flex';
    if (icon) icon.classList.remove('rotate-90');
  } else {
    sidebar.classList.add('-translate-x-full', 'w-0');
    sidebar.classList.remove('w-64');
    sidebar.style.display = 'none';
    if (icon) icon.classList.add('rotate-90');
  }
  mostrarToastFeedback(estaFechada ? 'Sidebar Aberta' : 'Sidebar Ocultada');
}

function alternarDrawerChat(forcarEstado) {
  const drawer = document.getElementById('drawerChatIA');
  const btnBottomRight = document.getElementById('btnAssistenteBottomRight');
  if (!drawer) return;
  if (typeof forcarEstado === 'boolean') {
    drawerChatAberto = forcarEstado;
  } else {
    drawerChatAberto = !drawerChatAberto;
  }

  if (drawerChatAberto) {
    drawer.classList.remove('hidden');
    drawer.style.width = '24rem';
    if (btnBottomRight) btnBottomRight.classList.add('hidden');
    mostrarToastFeedback('Assistente IA Aberto');
  } else {
    drawer.classList.add('hidden');
    drawer.style.width = '0px';
    if (btnBottomRight) btnBottomRight.classList.remove('hidden');
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  if (typeof verificarSessaoECarregar === 'function') {
    await verificarSessaoECarregar();
  }
});
