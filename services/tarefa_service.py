from repositories.tarefa_repository import TarefaRepository
from config.database import SessionLocal
from models.tarefa import Tarefa


class TarefaService:

    def listar_por_usuario(self, usuario_id):
        with SessionLocal() as db:
            repository = TarefaRepository(db)
            return repository.listar_por_usuario(usuario_id)

    def criar_tarefa(self, dados, usuario_id):
        with SessionLocal() as db:
            repository = TarefaRepository(db)
            tarefa = Tarefa(
                usuario_id=usuario_id,
                tipo=dados.tipo,
                titulo=dados.titulo,
                descricao=dados.descricao,
                prioridade=dados.prioridade,
                prazo=dados.prazo,
            )
            return repository.salvar(tarefa)
