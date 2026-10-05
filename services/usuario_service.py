from repositories.usuario_repository import UsuarioRepository


class UsuarioService:
    def __init__(self, repository=None):
        self.repository = repository or UsuarioRepository()

    def listar_usuarios(self):
        return self.repository.listar()

    def buscar_por_id(self, usuario_id):
        return self.repository.buscar_por_id(usuario_id)

    def atualizar_usuario(self, usuario_id, nome, estilo_instrucao):
        nome = nome.strip()

        if not nome:
            raise ValueError("O nome não pode ficar vazio.")
        if len(nome) < 3:
            raise ValueError("O nome precisa ter pelo menos 3 caracteres.")
        if estilo_instrucao not in {"direto", "detalhado"}:
            raise ValueError("O estilo deve ser 'direto' ou 'detalhado'.")

        return self.repository.atualizar(usuario_id, nome, estilo_instrucao)

    def deletar_usuario(self, usuario_id):
        return self.repository.deletar(usuario_id)

    def criar_usuario(self, nome, senha, estilo_instrucao):
        nome = nome.strip()

        if not nome:
            raise ValueError("O nome não pode ficar vazio.")
        if not senha:
             raise ValueError("A senha não pode ficar vazia.")
        if len(nome) < 3:
            raise ValueError("O nome precisa ter pelo menos 3 caracteres.")
        if estilo_instrucao not in {"direto", "detalhado"}:
            raise ValueError("O estilo deve ser 'direto' ou 'detalhado'.")

        existente = self.repository.buscar_por_nome(nome)
        if existente is not None:
            raise ValueError("Já existe um perfil com esse nome.")

        return self.repository.criar(nome, senha, estilo_instrucao)
