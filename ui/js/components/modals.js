/**
 * @file modals.js
 * @description Injects dashboard modals (Profile, Create Task, Delete Task, Auth) dynamically to keep dashboard.html clean and modular.
 */

function renderizarModals() {
  const container = document.getElementById('modalsContainer') || document.body;
  if (document.getElementById('modalPerfil')) return;

  const modalsHTML = `
    <!-- ================= MODAL DE PERFIL & CONFIGURAÇÕES ================= -->
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 hidden" id="modalPerfil" onclick="fecharModalPerfil()">
      <div class="bg-[#111113] border border-[#28282e] rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-[#fffff2] space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scroll" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-[#26262b] pb-3">
          <h3 class="font-bold text-sm text-[#fffff2] flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-[#fffff2]">account_circle</span>
            Perfil & Configurações
          </h3>
          <button onclick="fecharModalPerfil()" class="text-[#9d9da6] hover:text-[#fffff2] p-1 rounded transition cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-[#9d9da6] mb-1 font-mono">Nome do Usuário</label>
            <input type="text" id="inputPerfilNome" class="w-full bg-[#080808] border border-[#26262b] text-[#fffff2] text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#fffff2] font-medium font-mono">
          </div>
          <div>
            <label class="block text-[#9d9da6] mb-1 font-mono">Estilo de Instrução da IA</label>
            <select id="selectPerfilEstilo" class="w-full bg-[#080808] border border-[#26262b] text-[#fffff2] text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#fffff2] cursor-pointer font-mono">
              <option value="direto">Direto (Conciso)</option>
              <option value="detalhado">Detalhado (Explicativo)</option>
            </select>
          </div>
          <div>
            <label class="block text-[#9d9da6] mb-1 font-mono flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px] text-emerald-400">palette</span>
              Tema Visual (Fundo)
            </label>
            <select id="selectTemaModal" onchange="mudarTema(this.value)" class="w-full bg-[#080808] border border-[#26262b] text-[#fffff2] text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#fffff2] cursor-pointer font-mono">
              <option value="obsidian">Obsidian & Cyber Emerald</option>
              <option value="slate">Midnight Slate & Amber</option>
              <option value="indigo">Deep Indigo & Arctic Blue</option>
              <option value="branco">Branco Acessível (Alto Contraste)</option>
            </select>
          </div>
          <div>
            <label class="block text-[#9d9da6] mb-1 font-mono flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px] text-sky-400">text_fields</span>
              Tamanho da Fonte (Acessibilidade)
            </label>
            <select id="selectTamanhoFonteModal" onchange="mudarTamanhoFonte(this.value)" class="w-full bg-[#080808] border border-[#26262b] text-[#fffff2] text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#fffff2] cursor-pointer font-mono">
              <option value="100">100% — Padrão</option>
              <option value="110">110%</option>
              <option value="125">125%</option>
              <option value="150">150% (Máximo)</option>
            </select>
          </div>
        </div>
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#26262b]">
          <button onclick="fecharModalPerfil()" class="px-4 py-2 bg-[#161619] hover:bg-[#26262b] text-[#9d9da6] hover:text-[#fffff2] rounded-lg text-xs font-bold transition cursor-pointer">
            Cancelar
          </button>
          <button onclick="salvarPerfil()" class="px-4 py-2 bg-[#fffff2] hover:bg-white text-[#080808] rounded-lg text-xs font-bold transition cursor-pointer">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL DE CRIAR TAREFA ================= -->
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 hidden" id="modalCriarTarefa" onclick="fecharModalCriarTarefa()">
      <div class="bg-[#111113] border border-[#28282e] rounded-2xl w-full max-w-[620px] p-6 shadow-2xl relative text-[#fffff2] space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scroll" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-[#26262b] pb-3 -mt-1">
          <div class="flex items-center gap-2.5 font-mono text-[11px] tracking-wider text-sky-400 font-semibold">
            <span class="w-2 h-2 rounded-full bg-[#fffff2] inline-block"></span>
            <span>FOCUS 2K • GESTOR DE TAREFA</span>
          </div>
          <div class="flex items-center gap-3 text-[#9d9da6] text-xs font-mono select-none">
            <button class="hover:text-[#fffff2] transition cursor-pointer p-0.5" onclick="fecharModalCriarTarefa()" type="button">—</button>
            <button class="hover:text-[#fffff2] transition cursor-pointer p-0.5" type="button"></button>
            <button class="hover:text-[#fffff2] transition cursor-pointer p-0.5 text-sm leading-none" onclick="fecharModalCriarTarefa()" type="button">✕</button>
          </div>
        </div>
        <div>
          <h2 id="modalCriarTarefaTitulo" class="text-[22px] font-bold text-[#fffff2] tracking-tight leading-none">Criar nova tarefa</h2>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold text-[#fffff2] font-mono">Nome da tarefa</label>
            <button type="button" onclick="ativarReconhecimentoVoz()" id="btnVozModal" class="px-2 py-0.5 bg-[#161619] hover:bg-sky-500/20 text-[#9d9da6] hover:text-sky-400 border border-[#26262b] rounded-lg text-[10px] font-mono flex items-center gap-1 transition cursor-pointer" title="Ditar tarefa por voz">
              <span class="material-symbols-outlined text-[14px]">mic</span>
              <span id="labelVozModal">Falar tarefa</span>
            </button>
          </div>
          <input class="w-full bg-[#0c0c0e] border border-[#26262b] focus:border-[#fffff2] rounded-xl px-4 py-3 text-sm text-[#fffff2] placeholder-[#9d9da6]/60 focus:outline-none transition" id="inputNomeTarefaModal" placeholder="Nome da tarefa" type="text">
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label class="block text-xs font-bold text-[#fffff2] mb-1.5 font-mono">Data / Prazo</label>
            <div class="relative flex items-center">
              <input class="w-full bg-[#0c0c0e] border border-[#26262b] focus:border-[#fffff2] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#fffff2] placeholder-[#9d9da6]/60 focus:outline-none transition" id="inputDataModal" type="text" placeholder="DD/MM/AAAA (Dia/Mês)" maxlength="10" oninput="formatarMascaraData(this)">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-[#fffff2] mb-1.5 font-mono">Prioridade</label>
            <div class="inline-flex w-full items-center p-1 rounded-xl bg-[#0c0c0e] border border-[#26262b] gap-1">
              <button type="button" id="btnPrioridadeBaixa" onclick="selecionarPrioridadeModal('baixa')" class="flex-1 py-2 rounded-lg text-xs font-medium text-[#9d9da6] hover:text-[#fffff2] transition">Baixa</button>
              <button type="button" id="btnPrioridadeMedia" onclick="selecionarPrioridadeModal('media')" class="flex-1 py-2 rounded-lg text-xs font-bold bg-[#fffff2] text-[#080808] shadow-sm transition">Média</button>
              <button type="button" id="btnPrioridadeAlta" onclick="selecionarPrioridadeModal('alta')" class="flex-1 py-2 rounded-lg text-xs font-medium text-[#9d9da6] hover:text-[#fffff2] transition">Alta</button>
            </div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold text-[#fffff2] font-mono">Descrição</label>
            <button type="button" onclick="ativarReconhecimentoVozDesc()" id="btnVozDescModal" class="px-2 py-0.5 bg-[#161619] hover:bg-sky-500/20 text-[#9d9da6] hover:text-sky-400 border border-[#26262b] rounded-lg text-[10px] font-mono flex items-center gap-1 transition cursor-pointer" title="Ditar descrição por voz">
              <span class="material-symbols-outlined text-[14px]">mic</span>
              <span id="labelVozDescModal">Falar descrição</span>
            </button>
          </div>
          <textarea class="w-full bg-[#0c0c0e] border border-[#26262b] focus:border-[#fffff2] rounded-xl p-3.5 text-xs text-[#fffff2] placeholder-[#9d9da6]/60 focus:outline-none transition resize-none custom-scroll" id="inputDescricaoModal" placeholder="Descreva sua tarefa" rows="4"></textarea>
        </div>
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs font-mono text-[#9d9da6]">Tipo de Tarefa:</span>
          <div class="inline-flex items-center p-1 rounded-xl bg-[#0c0c0e] border border-[#26262b] gap-1">
            <button class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#fffff2] text-[#080808] shadow-sm transition" id="btnTipoEdu" onclick="selecionarTipoEstudo('educacional')" type="button">Tarefas Únicas</button>
            <button class="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9d9da6] hover:text-[#fffff2] transition" id="btnTipoRotina" onclick="selecionarTipoEstudo('rotina')" type="button">Tarefas Diárias</button>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#26262b]">
          <button class="px-5 py-2.5 rounded-xl border border-[#26262b] hover:border-[#3a3a42] hover:bg-[#161619] text-[#fffff2] font-semibold text-xs transition cursor-pointer active:scale-95" onclick="fecharModalCriarTarefa()" type="button">
            Cancelar
          </button>
          <button class="px-5 py-2.5 rounded-xl bg-[#fffff2] hover:bg-white text-[#080808] font-bold text-xs flex items-center gap-1.5 transition shadow active:scale-95 cursor-pointer" onclick="confirmarCriarTarefaModal()" type="button">
            <span class="material-symbols-outlined text-[16px] font-bold">add</span>
            <span id="modalCriarTarefaBtnText">Criar Tarefa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL DE EXCLUIR TAREFA ================= -->
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 hidden" id="modalDeletarTarefa" onclick="fecharModalDeletarTarefa()">
      <div class="bg-[#111113] border border-[#28282e] rounded-2xl w-full max-w-[420px] p-6 shadow-2xl relative text-[#fffff2] space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scroll" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-[#26262b] pb-3 -mt-1">
          <div class="flex items-center gap-2.5 font-mono text-[11px] tracking-wider text-rose-400 font-semibold">
            <span class="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
            <span>CONFIRMAR EXCLUSÃO</span>
          </div>
          <button class="text-[#9d9da6] hover:text-[#fffff2] transition cursor-pointer text-sm leading-none" onclick="fecharModalDeletarTarefa()" type="button">✕</button>
        </div>
        <div>
          <h3 class="text-base font-bold text-[#fffff2] tracking-tight mb-1">Deseja realmente excluir esta tarefa?</h3>
          <p id="textoTarefaDeletar" class="text-xs text-[#9d9da6] leading-relaxed break-words font-mono bg-[#0c0c0e] p-3 rounded-xl border border-[#26262b] mt-2"></p>
        </div>
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#26262b]">
          <button class="px-4 py-2 rounded-xl border border-[#26262b] hover:border-[#3a3a42] hover:bg-[#161619] text-[#fffff2] font-semibold text-xs transition cursor-pointer active:scale-95" onclick="fecharModalDeletarTarefa()" type="button">
            Cancelar
          </button>
          <button class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-[#fffff2] font-bold text-xs flex items-center gap-1.5 transition shadow active:scale-95 cursor-pointer" onclick="executarDeletarTarefa()" type="button">
            <span class="material-symbols-outlined text-[16px]">delete</span>
            <span>Sim, Excluir</span>
          </button>
        </div>
      </div>
    </div>
  `;

  if (container) {
    container.innerHTML += modalsHTML;
  }
}

window.renderizarModals = renderizarModals;
