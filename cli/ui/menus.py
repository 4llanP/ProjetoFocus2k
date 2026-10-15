"""Menus de interação do sistema Focus 2k."""

# pylint: disable=line-too-long
from ui.utils import exibir_cabecalho
from data.data_manager import salvar_dados
import core.tarefas as core_tarefas
import core.ia_service as ia_service


def criar_usuario_menu(dados: dict):
    """Cria um novo usuário no sistema."""
    exibir_cabecalho("Criar perfil de estudante")
    nome = input("Digite o nome do estudante: ").strip()
    if not nome or nome in dados:
        input("\nNome já existente. Pressione Enter.")
        return
    senha = input("Informe sua senha: ")

    print("\n--- Preferências de Comunicação ---")
    print("1. Passo a passo curto e direto")
    print("2. Detalhado e explicativo")
    pref = input("Opção: ").strip()
    estilo = "direto" if pref == "1" else "detalhado"

    dados[nome] = {
        "senha": senha,
        "preferencias": {"estilo_instrucao": estilo},
        "tarefas_diarias": [],
        "tarefas_educacionais": [],
    }
    salvar_dados(dados)
    input(f"\nPerfil {nome} criado! Pressione Enter.")


def gerenciar_tarefas_menu(dados: dict, usuario: str, chave: str, titulo: str):
    """
    Exibe e gerencia tarefas do usuário.

    Permite criar tarefas, alterar status e gerar passos usando IA.
    """
    while True:
        exibir_cabecalho(titulo)
        tarefas = dados[usuario][chave]

        _mostrar_tarefas(tarefas)

        print("\n" + "-" * 30, "\n")
        print("1. Criar tarefa")
        print("2. Alternar status da tarefa")
        print("3. Editar tarefa")
        print("4. Excluir tarefa")
        print("5. Marcar passo como concluído")
        print("6. Desmembrar com IA")
        print("7. Voltar")

        opcao = input("\nEscolha uma opção: ").strip()

        if opcao == "1":
            titulo_tarefa = input("Título da tarefa: ").strip()
            if not titulo_tarefa:
                input("\nO título não pode ficar vazio. Pressione Enter.")
                continue
            descricao = input("Descrição curta da tarefa: ").strip()
            prioridade = _pedir_prioridade()
            prazo = input("Prazo no formato AAAA-MM-DD (ou deixe vazio): ").strip()
            core_tarefas.adicionar_tarefa(
                dados, usuario, chave, titulo_tarefa, descricao, prioridade, prazo
            )
            input("\nTarefa criada com sucesso!")
        elif opcao == "2" and tarefas:
            try:
                idx = int(input("Número da tarefa: ")) - 1
                core_tarefas.alternar_status_tarefa(dados, usuario, chave, idx)
            except ValueError:
                pass
        elif opcao == "3" and tarefas:
            try:
                idx = int(input("Número da tarefa que deseja editar: ")) - 1
                if 0 <= idx < len(tarefas):
                    tarefa_atual = tarefas[idx]
                    print("\nDeixe em branco para manter o valor atual.")
                    novo_titulo = (
                        input(f"Novo título [{tarefa_atual['titulo']}]: ").strip()
                        or tarefa_atual["titulo"]
                    )
                    nova_descricao = input(
                        f"Nova descrição [{tarefa_atual.get('descricao', '')}]: "
                    ).strip() or tarefa_atual.get("descricao", "")
                    nova_prioridade = input(
                        f"Nova prioridade baixa/media/alta [{tarefa_atual.get('prioridade', 'media')}]: "
                    ).strip() or tarefa_atual.get("prioridade", "media")
                    novo_prazo = input(
                        f"Novo prazo AAAA-MM-DD [{tarefa_atual.get('prazo', '')}]: "
                    ).strip() or tarefa_atual.get("prazo", "")
                    if nova_prioridade not in ["baixa", "media", "alta"]:
                        nova_prioridade = "media"
                    core_tarefas.editar_tarefa(
                        dados,
                        usuario,
                        chave,
                        idx,
                        novo_titulo,
                        nova_descricao,
                        nova_prioridade,
                        novo_prazo,
                    )
                    input("\nTarefa editada com sucesso! Pressione Enter.")
            except ValueError:
                input("\nDigite apenas números.")
        elif opcao == "4" and tarefas:
            try:
                idx = int(input("Número da tarefa que deseja excluir: ")) - 1
                if 0 <= idx < len(tarefas):
                    tarefa = tarefas[idx]
                    confirmar = input(
                        f"Tem certeza que deseja excluir '{tarefa['titulo']}'? (s/n): "
                    ).lower()
                    if confirmar == "s":
                        core_tarefas.excluir_tarefa(dados, usuario, chave, idx)
                        input("\nTarefa excluída!")
            except ValueError:
                input("\nDigite apenas números")
        elif opcao == "5" and tarefas:
            try:
                idx_tarefa = int(input("Número da tarefa: ")) - 1
                idx_passo = int(input("Número do passo: ")) - 1
                core_tarefas.alternar_status_passo(
                    dados, usuario, chave, idx_tarefa, idx_passo
                )
                input("\nStatus do passo alterado! Pressione Enter.")
            except ValueError:
                input("\nDigite apenas números. Pressione Enter.")
        elif opcao == "6" and tarefas:
            # Não foi passado no roteiro como fazer
            try:
                idx = int(input("Número da tarefa para desmembrar: ")) - 1
                if 0 <= idx < len(tarefas):
                    passos = ia_service.gerar_passos_tarefa(tarefas[idx]["titulo"])
                    print("\nPassos sugeridos:")
                    for i, p in enumerate(passos, 1):
                        print(f" {i}. {p}")
                    if input("\nAceitar sugestão? (s/n): ").lower() == "s":
                        core_tarefas.injetar_passos_ia(
                            dados, usuario, chave, idx, passos
                        )
                        input("\nPassos adicionados! Pressione Enter.")
            except ValueError:
                input("\nDigite apenas números. Pressione Enter.")
        elif opcao == "7":
            break


def painel_ia_menu(dados: dict, usuario: str):
    """Abre o painel de interação com a IA."""
    exibir_cabecalho("ASSISTENTE DE IA PARA TPAC")
    print("Peça ajuda para simplificar enunciados, organizar rotinas ou tirar dúvidas.")
    print("Digite 'sair' para retornar.\n")
    estilo = dados[usuario]["preferencias"]["estilo_instrucao"]

    while True:
        pergunta = input("\nVocê: ").strip()
        if pergunta.lower() == "sair":
            break
        if not pergunta:
            continue

        print("\nProcessando sem ambiguidades...")
        respostas = ia_service.obter_resposta_ia(pergunta, estilo)
        print(f"\n[Assistente - Modo {estilo.upper()}]:")
        for linha in respostas:
            print(f"- {linha}")
        print("-" * 30)


def painel_principal_menu(dados: dict, usuario: str):
    """Exibe o menu principal do usuário."""
    while True:
        exibir_cabecalho(f"PAINEL DO USUÁRIO: {usuario}")
        print("1. Rotina diária")
        print("2. Estudos e atividades")
        print("3. Central de apoio")
        print("4. Relatório")
        print("5. Logout")
        opcao = input("\nEscolha: ").strip()
        if opcao == "1":
            gerenciar_tarefas_menu(dados, usuario, "tarefas_diarias", "ROTINA DIÁRIA")
        elif opcao == "2":
            gerenciar_tarefas_menu(
                dados, usuario, "tarefas_educacionais", "ESTUDOS E ATIVIDADES"
            )
        elif opcao == "3":
            painel_ia_menu(dados, usuario)
        elif opcao == "4":
            relatorio_menu(dados, usuario)
        elif opcao == "5":
            break


def _pedir_prioridade():
    """
    Solicita ao usuário a prioridade da tarefa.
    """
    print("\nPrioridade da tarefa:")
    print("1. Baixa")
    print("2. Média")
    print("3. Alta")
    escolha = input("Escolha: ").strip()
    if escolha == "1":
        return "baixa"
    if escolha == "3":
        return "alta"
    return "media"


def _mostrar_tarefas(tarefas):
    if not tarefas:
        print("[Nenhuma tarefa cadastrada.]")
        return

    VERDE = "\033[1;92m"
    AMARELO = "\033[1;93m"
    VERMELHO = "\033[1;91m"
    BOLD = "\033[1m"
    RESET = "\033[0m"

    for idx, tarefa in enumerate(tarefas, 1):
        status = "[X]" if tarefa["concluida"] else "[ ]"

        prioridade_pura = tarefa.get("prioridade", "media").capitalize()
        if prioridade_pura == "Baixa":
            cor = VERDE
        elif prioridade_pura == "Alta":
            cor = VERMELHO
        else:
            cor = AMARELO

        # Formata o texto da prioridade com a cor escolhida
        prioridade_colorida = f"{cor}{prioridade_pura.capitalize()}{RESET}"
        prazo = tarefa.get("prazo", "Sem prazo") or "Sem prazo"

        print(
            f"{idx}. {status} {BOLD}Tarefa: {RESET}{tarefa['titulo']}",
            end=f"{BOLD} | {RESET}",
        )
        print(
            f"{BOLD}Prioridade:{RESET} {prioridade_colorida} {BOLD}| Prazo:{RESET} {prazo}"
        )

        if tarefa.get("descricao"):
            print(f"\n   {BOLD}Descrição:{RESET} {tarefa['descricao']}")

        for i, passo in enumerate(tarefa.get("passos", []), 1):
            simbolo = "✓" if passo.get("concluido") else "○"
            print(f"     {i}. {simbolo} {passo['texto']}")


def relatorio_menu(dados: dict, usuario: str):
    resumo = core_tarefas.gerar_resumo_tarefas(dados, usuario)
    exibir_cabecalho("RELATÓRIO DO ESTUDANTE")
    print(f"Total de tarefas: {resumo['total']}")
    print(f"Tarefas concluídas: {resumo['concluidas']}")
    print(f"Tarefas pendentes: {resumo['pendentes']}")
    input("\nPressione Enter para voltar.")
