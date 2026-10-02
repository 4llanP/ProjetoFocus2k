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

    def test_rejeita_nome_vazio(self):
        with self.assertRaisesRegex(ValueError, "O nome não pode ficar vazio"):
            self.service.criar_usuario("   ", "direto")

    def test_rejeita_usuario_duplicado(self):
        self.service.criar_usuario("Leo", "direto")
        with self.assertRaisesRegex(ValueError, "Já existe um perfil com esse nome"):
            self.service.criar_usuario("Leo", "direto")

    def test_rejeita_estilo_invalido(self):
        with self.assertRaisesRegex(ValueError, "O estilo deve ser"):
            self.service.criar_usuario("Bia", "rapido")

    def test_rejeita_nome_com_menos_de_3_caracteres(self):
        with self.assertRaisesRegex(ValueError, "pelo menos 3 caracteres"):
            self.service.criar_usuario("Al", "direto")

if __name__ == "__main__":
    unittest.main()