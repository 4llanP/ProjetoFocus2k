from sqlalchemy import select

from config.database import SessionLocal
from models.usuario import Usuario


class UsuarioRepository:
    def __init__(self, session=None):
        self.session = session

    def _get_session(self):
        if self.session:
            return self.session, False
        return SessionLocal(), True

    def listar(self):
        session, close_session = self._get_session()
        try:
            comando = select(Usuario).order_by(Usuario.nome)
            return list(session.scalars(comando))
        finally:
            if close_session:
                session.close()

    def buscar_por_email(self, email):
        session, close_session = self._get_session()
        try:
            comando = select(Usuario).where(Usuario.email == email)
            return session.scalar(comando)
        finally:
            if close_session:
                session.close()

    def buscar_por_nome(self, nome):
        session, close_session = self._get_session()
        try:
            comando = select(Usuario).where(Usuario.nome == nome)
            return session.scalar(comando)
        finally:
            if close_session:
                session.close()

    def buscar_por_id(self, usuario_id):
        session, close_session = self._get_session()
        try:
            comando = select(Usuario).where(Usuario.id == usuario_id)
            return session.scalar(comando)
        finally:
            if close_session:
                session.close()

    def atualizar(self, usuario_id, nome, email, estilo_instrucao):
        session, close_session = self._get_session()
        try:
            usuario = session.get(Usuario, usuario_id)
            if not usuario:
                return None
            usuario.nome = nome
            usuario.email = email
            usuario.estilo_instrucao = estilo_instrucao
            session.commit()
            session.refresh(usuario)
            return usuario
        finally:
            if close_session:
                session.close()

    def deletar(self, usuario_id):
        session, close_session = self._get_session()
        try:
            usuario = session.get(Usuario, usuario_id)
            if not usuario:
                return False
            session.delete(usuario)
            session.commit()
            return True
        finally:
            if close_session:
                session.close()

    def criar(self, nome, email, senha, estilo_instrucao, role='user'):
        session, close_session = self._get_session()
        try:
            usuario = Usuario(nome=nome, email=email, senha=senha, estilo_instrucao=estilo_instrucao, role=role)
            session.add(usuario)
            session.commit()
            session.refresh(usuario)
            return usuario
        finally:
            if close_session:
                session.close()
