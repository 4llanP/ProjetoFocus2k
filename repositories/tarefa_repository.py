from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models.tarefa import Tarefa


class TarefaRepository:
    def __init__(self, session: Session):
        """Recebe a sessão do banco de dados (Session do SQLAlchemy) para executar os comandos."""
        self.session = session

    def salvar(self, tarefa: Tarefa) -> Tarefa:
        """Salva (insere ou atualiza) uma tarefa no banco de dados."""
        try:
            self.session.add(tarefa)
            self.session.commit()
            self.session.refresh(tarefa)
            return tarefa
        except SQLAlchemyError as e:
            self.session.rollback()
            raise e

    def buscar_por_id(self, tarefa_id: int) -> Optional[Tarefa]:
        """Busca uma tarefa específica pelo seu ID."""
        return self.session.query(Tarefa).filter(Tarefa.id == tarefa_id).first()

    def listar_por_usuario(self, usuario_id: int) -> List[Tarefa]:
        """Busca todas as tarefas de um usuário específico."""
        return self.session.query(Tarefa).filter(Tarefa.usuario_id == usuario_id).all()

    def deletar(self, tarefa: Tarefa) -> None:
        """Remove uma tarefa do banco de dados."""
        try:
            self.session.delete(tarefa)
            self.session.commit()
        except SQLAlchemyError as e:
            self.session.rollback()
            raise e