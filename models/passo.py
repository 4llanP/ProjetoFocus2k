from sqlalchemy import Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from config.database import Base

class Passo(Base):
    __tablename__ = "passos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tarefa_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tarefas.id", ondelete="CASCADE"), nullable=False
    )
    texto: Mapped[str] = mapped_column(Text, nullable=False)
    concluido: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ordem: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
