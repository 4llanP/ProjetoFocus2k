from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from models.passo import Passo

class PassoRepository:
    def __init__(self, session: Session):
        self.session = session

    def salvar(self, passo: Passo) -> Passo:
        self.session.add(passo)
        self.session.commit()
        self.session.refresh(passo)
        return passo

    def buscar_por_id(self, passo_id: int) -> Optional[Passo]:
        return self.session.get(Passo, passo_id)

    def listar_por_tarefa(self, tarefa_id: int) -> List[Passo]:
        comando = select(Passo).where(Passo.tarefa_id == tarefa_id).order_by(Passo.ordem, Passo.id)
        return list(self.session.scalars(comando))

    def deletar(self, passo: Passo) -> None:
        self.session.delete(passo)
        self.session.commit()
