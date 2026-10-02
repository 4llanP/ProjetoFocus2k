"""Utilitários de interface do terminal."""

import os


def limpar_tela():
    """
    Limpa a tela do terminal
    """
    os.system("cls" if os.name == "nt" else "clear")


def exibir_cabecalho(titulo: str):
    """
    Exibe um cabeçalho formatado no terminal
    """
    limpar_tela()
    largura = 60

    print("\n" + "=" * largura)
    print(titulo.center(largura))
    print("=" * largura)
