from sqlalchemy import select

from config.database import SessionLocal
from models.usuario import Usuario


class UsuarioRepository:
    def listar(self):
        with SessionLocal() as session:
            comando = select(Usuario).order_by(Usuario.nome)
            return list(session.scalars(comando))

    def buscar_por_email(self, email):
        with SessionLocal() as session:
            comando = select(Usuario).where(Usuario.email == email)
            return session.scalar(comando)

    def buscar_por_id(self, usuario_id):
        with SessionLocal() as session:
            comando = select(Usuario).where(Usuario.id == usuario_id)
            return session.scalar(comando)

    def atualizar(self, usuario_id, nome, email, estilo_instrucao):
        with SessionLocal() as session:
            usuario = session.get(Usuario, usuario_id)
            if not usuario:
                return None
            usuario.nome = nome
            usuario.email = email
            usuario.estilo_instrucao = estilo_instrucao
            session.commit()
            session.refresh(usuario)
            return usuario

    def deletar(self, usuario_id):
        with SessionLocal() as session:
            usuario = session.get(Usuario, usuario_id)
            if not usuario:
                return False
            session.delete(usuario)
            session.commit()
            return True

    def criar(self, nome, email, senha, estilo_instrucao, role='estudante'):
        with SessionLocal() as session:
            usuario = Usuario(nome=nome, email=email, senha=senha, estilo_instrucao=estilo_instrucao, role=role)
            session.add(usuario)
            session.commit()
            session.refresh(usuario)
            return usuario
