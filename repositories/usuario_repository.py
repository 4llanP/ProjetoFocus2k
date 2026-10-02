from sqlalchemy import select

from config.database import SessionLocal
from models.usuario import Usuario


class UsuarioRepository:
    def listar(self):
        with SessionLocal() as session:
            comando = select(Usuario).order_by(Usuario.nome)
            return list(session.scalars(comando))

    def buscar_por_nome(self, nome):
        with SessionLocal() as session:
            comando = select(Usuario).where(Usuario.nome == nome)
            return session.scalar(comando)

    def criar(self, nome, estilo_instrucao):
        with SessionLocal() as session:
            usuario = Usuario(nome=nome, estilo_instrucao=estilo_instrucao)
            session.add(usuario)
            session.commit()
            session.refresh(usuario)
            return usuario
