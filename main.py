"""Sistema principal do Focus 2k."""

import os

from data.data_manager import carregar_dados
from data.functions import autenticar_usuario
from ui.menus import criar_usuario_menu, painel_principal_menu
from ui.utils import exibir_cabecalho


os.system("cls")


def executar_sistema():
    """Executa o menu principal do sistema."""
    while True:
        dados = carregar_dados()
        exibir_cabecalho("Focus 2k")

        print("1. Entrar com perfil existente")
        print("2. Criar novo perfil de estudante")
        print("3. Encerrar")

        opcao = input("\nEscolha uma opção: ").strip()

        if opcao == "1":
            if not dados:
                input("\nNenhum perfil salvo. Crie um primeiro!")
                continue

            print("\nPerfis:")
            for u in dados:
                print(f"- {u}")

            nome = input("\nNome do perfil: ").strip()

            if nome in dados:
                senha = input("Digite a senha: ")

                if autenticar_usuario(dados, nome, senha):
                    painel_principal_menu(dados, nome)
                else:
                    input("\nAcesso negado!")
            else:
                input("\nPerfil não encontrado!")

        elif opcao == "2":
            criar_usuario_menu(dados)

        elif opcao == "3":
            print("\nAté logo! Bons estudos!")
            break


if __name__ == "__main__":
    executar_sistema()
