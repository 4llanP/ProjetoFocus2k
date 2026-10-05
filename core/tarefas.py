"""Funções de gerenciamento de tarefas do sistema."""

# pylint: disable=line-too-long
from data.data_manager import salvar_dados


def adicionar_tarefa(
    dados: dict,
    usuario: str,
    chave: str,
    titulo: str,
    descricao: str = "",
    prioridade: str = "media",
    prazo: str = "",
):
    """
    Adiciona uma nova tarefa para um usuário.
    """
    dados[usuario][chave].append(
        {
            "titulo": titulo,
            "descricao": descricao,
            "prioridade": prioridade,
            "prazo": prazo,
            "concluida": False,
            "passos": [],
        }
    )
    salvar_dados(dados)


def editar_tarefa(
    dados: dict,
    usuario: str,
    chave: str,
    idx: int,
    novo_titulo: str,
    nova_descricao: str,
    nova_prioridade: str,
    novo_prazo: str,
):
    tarefas = dados[usuario][chave]
    if 0 <= idx < len(tarefas):
        tarefas[idx]["titulo"] = novo_titulo
        tarefas[idx]["descricao"] = nova_descricao
        tarefas[idx]["prioridade"] = nova_prioridade
        tarefas[idx]["prazo"] = novo_prazo
        salvar_dados(dados)


def alternar_status_tarefa(dados: dict, usuario: str, chave: str, idx: int):
    """
    Alterna o status de conclusão de uma tarefa.
    """
    tarefas = dados[usuario][chave]
    if 0 <= idx < len(tarefas):
        tarefas[idx]["concluida"] = not tarefas[idx]["concluida"]
        salvar_dados(dados)


def injetar_passos_ia(dados: dict, usuario: str, chave: str, idx: int, passos: list):
    """
    Adiciona passos gerados pela IA em uma tarefa.
    """
    tarefas = dados[usuario][chave]
    if 0 <= idx < len(tarefas):
        tarefas[idx]["passos"] = [{"texto": p, "concluido": False} for p in passos]
        salvar_dados(dados)


def excluir_tarefa(dados: dict, usuario: str, chave: str, idx: int):
    tarefas = dados[usuario][chave]
    if 0 <= idx < len(tarefas):
        tarefas.pop(idx)
        salvar_dados(dados)


def alternar_status_passo(
    dados: dict, usuario: str, chave: str, idx_tarefa: int, idx_passo: int
):
    tarefas = dados[usuario][chave]
    if 0 <= idx_tarefa < len(tarefas):
        passos = tarefas[idx_tarefa].get("passos", [])
    if 0 <= idx_passo < len(passos):
        passos[idx_passo]["concluido"] = not passos[idx_passo]["concluido"]
        salvar_dados(dados)


def gerar_resumo_tarefas(dados: dict, usuario: str):
    total = 0
    concluidas = 0
    pendentes = 0
    for chave in ["tarefas_diarias", "tarefas_educacionais"]:
        for tarefa in dados[usuario][chave]:
            total += 1
            if tarefa.get("concluida"):
                concluidas += 1
            else:
                pendentes += 1
    return {"total": total, "concluidas": concluidas, "pendentes": pendentes}
