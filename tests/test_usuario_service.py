import unittest

from services.usuario_service import UsuarioService


class UsuarioFake:
    def __init__(self, nome, estilo_instrucao="direto"):
        self.id = 1
        self.nome = nome
        self.estilo_instrucao = estilo_instrucao


class UsuarioRepositoryFake:
    def __init__(self):
        self.usuarios = {}

    def listar(self):
        return list(self.usuarios.values())

    def buscar_por_nome(self, nome):
        return self.usuarios.get(nome)

    def criar(self, nome, estilo_instrucao):
        usuario = UsuarioFake(nome, estilo_instrucao)
        self.usuarios[nome] = usuario
        return usuario


class TestUsuarioService(unittest.TestCase):
    def setUp(self):
        self.service = UsuarioService(UsuarioRepositoryFake())

    def test_cria_usuario_valido(self):
        usuario = self.service.criar_usuario("Ana", "direto")
        self.assertEqual(usuario.nome, "Ana")

    def test_nao_aceita_nome_vazio(self):
        with self.assertRaises(ValueError):
            self.service.criar_usuario("   ", "direto")

    def test_nao_aceita_duplicado(self):
        self.service.criar_usuario("Leo", "direto")
        with self.assertRaises(ValueError):
            self.service.criar_usuario("Leo", "direto")


if __name__ == "__main__":
    unittest.main()
