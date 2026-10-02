from repositories.tarefa_repository import TarefaRepository
from config.database import SessionLocal
from models.tarefa import Tarefa


class TarefaService:

    def __init__(self):
        self.repository = TarefaRepository(SessionLocal())

    def listar_por_usuario(self, usuario_id):
        return self.repository.listar_por_usuario(usuario_id)

    def criar_tarefa(self, dados):
        tarefa = Tarefa(
            usuario_id=dados.usuario_id,
            tipo=dados.tipo,
            titulo=dados.titulo,
            descricao=dados.descricao,
            prioridade=dados.prioridade,
            prazo=dados.prazo,
        )

        return self.repository.salvar(tarefa)
