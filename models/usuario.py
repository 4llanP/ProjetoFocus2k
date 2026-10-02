from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from config.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False, unique=True)
    estilo_instrucao = Column(String(20), nullable=False, default="direto")
    criado_em = Column(DateTime, server_default=func.now())
