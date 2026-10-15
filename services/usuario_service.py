import re
import bcrypt
from repositories.usuario_repository import UsuarioRepository

class UsuarioService:
    EMAIL_REGEX = re.compile(r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')

    def __init__(self, repository=None):
        self.repository = repository or UsuarioRepository()

    def listar_usuarios(self):
        return self.repository.listar()

    def buscar_por_id(self, usuario_id):
        return self.repository.buscar_por_id(usuario_id)

    def _hash_senha(self, senha: str) -> str:
        # Garante que a senha tenha no máximo 72 bytes e converte para bytes
        senha_bytes = senha[:72].encode('utf-8')
        return bcrypt.hashpw(senha_bytes, bcrypt.gensalt()).decode('utf-8')

    def _verificar_senha(self, senha: str, senha_hash: str) -> bool:
        senha_bytes = senha[:72].encode('utf-8')
        return bcrypt.checkpw(senha_bytes, senha_hash.encode('utf-8'))

    def _validar_email(self, email: str) -> bool:
        return bool(self.EMAIL_REGEX.match(email))

    def atualizar_usuario(self, usuario_id, nome, email, estilo_instrucao):
        nome = nome.strip()
        email = email.strip().lower()

        if not nome:
            raise ValueError("O nome não pode ficar vazio.")
        if len(nome) < 3:
            raise ValueError("O nome precisa ter pelo menos 3 caracteres.")
        if not email or not self._validar_email(email):
            raise ValueError("E-mail inválido. Por favor, insira um endereço de e-mail válido.")
        if estilo_instrucao not in {"direto", "detalhado"}:
            raise ValueError("O estilo deve ser 'direto' ou 'detalhado'.")

        return self.repository.atualizar(usuario_id, nome, email, estilo_instrucao)

    def deletar_usuario(self, usuario_id):
        return self.repository.deletar(usuario_id)

    def criar_usuario(self, nome, email, senha, estilo_instrucao):
        nome = nome.strip()
        email = email.strip().lower()

        if not nome:
            raise ValueError("O nome não pode ficar vazio.")
        if not email:
            raise ValueError("O email não pode ficar vazio.")
        if not self._validar_email(email):
            raise ValueError("E-mail inválido. Por favor, insira um endereço de e-mail válido.")
        if not senha:
             raise ValueError("A senha não pode ficar vazia.")
        if len(nome) < 3:
            raise ValueError("O nome precisa ter pelo menos 3 caracteres.")
        if estilo_instrucao not in {"direto", "detalhado"}:
            raise ValueError("O estilo deve ser 'direto' ou 'detalhado'.")

        existente = self.repository.buscar_por_email(email)
        if existente is not None:
            raise ValueError("Já existe um perfil com esse email.")

        existente_nome = self.repository.buscar_por_nome(nome)
        if existente_nome is not None:
            raise ValueError("Já existe um perfil com esse nome.")

        senha_hash = self._hash_senha(senha)

        return self.repository.criar(nome, email, senha_hash, estilo_instrucao, role='user')

    def autenticar_usuario(self, email, senha):
        email = email.lower().strip()
        usuario = self.repository.buscar_por_email(email)

        if usuario and self._verificar_senha(senha, usuario.senha):
            return usuario
        return None
