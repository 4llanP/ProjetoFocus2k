import unittest

from services.usuario_service import UsuarioService


class UsuarioFake:
    def __init__(self, nome, email, senha_hash, estilo_instrucao="direto", role="user"):
        self.id = 1
        self.nome = nome
        self.email = email
        self.senha = senha_hash
        self.estilo_instrucao = estilo_instrucao
        self.role = role


class UsuarioRepositoryFake:
    def __init__(self):
        self.usuarios = {}

    def listar(self):
        return list(self.usuarios.values())

    def buscar_por_email(self, email):
        return self.usuarios.get(email)

    def buscar_por_nome(self, nome):
        for u in self.usuarios.values():
            if u.nome == nome:
                return u
        return None

    def criar(self, nome, email, senha, estilo_instrucao, role='user'):
        usuario = UsuarioFake(nome, email, senha, estilo_instrucao, role)
        self.usuarios[email] = usuario
        return usuario


class TestUsuarioService(unittest.TestCase):
    def setUp(self):
        self.service = UsuarioService(UsuarioRepositoryFake())

    def test_cria_usuario_valido(self):
        usuario = self.service.criar_usuario("Ana", "ana@empresa.com.br", "senha123", "direto")
        self.assertEqual(usuario.nome, "Ana")
        self.assertEqual(usuario.email, "ana@empresa.com.br")
        self.assertEqual(usuario.role, "user")

    def test_nao_aceita_nome_vazio(self):
        with self.assertRaises(ValueError):
            self.service.criar_usuario("   ", "ana@gmail.com", "senha123", "direto")

    def test_nao_aceita_email_invalido(self):
        with self.assertRaises(ValueError):
            self.service.criar_usuario("Ana", "email_invalido_sem_arroba", "senha123", "direto")

    def test_nao_aceita_duplicado(self):
        self.service.criar_usuario("Leo", "leo@gmail.com", "senha123", "direto")
        with self.assertRaises(ValueError):
            self.service.criar_usuario("Leo 2", "leo@gmail.com", "senha123", "direto")


if __name__ == "__main__":
    unittest.main()
