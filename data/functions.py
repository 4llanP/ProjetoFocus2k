"""Funções auxiliares relacionadas aos usuários."""


def autenticar_usuario(dados: dict, nome: str, senha: str) -> bool:
    """
    Verifica se a senha informada pertence ao usuário.
    """
    if nome not in dados:
        return False

    senha_correta = dados[nome].get("senha", "")

    return senha == senha_correta
