from datetime import datetime, date
from typing import Optional
from sqlalchemy import Integer, String, Text, Enum, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from config.database import Base  # Importando a Base que seu projeto já usa


class Tarefa(Base):
    __tablename__ = "tarefas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False
    )
    tipo: Mapped[str] = mapped_column(
        Enum("tarefas_diarias", "tarefas_educacionais"), nullable=False
    )
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    prioridade: Mapped[str] = mapped_column(
        Enum("baixa", "media", "alta"), default="media", nullable=False
    )
    prazo: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    concluida: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
