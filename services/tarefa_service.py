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
            tarefa_salva = repository.salvar(tarefa)

            try:
                from core.ia_service import gerar_passos_tarefa
                from repositories.passo_repository import PassoRepository
                from repositories.usuario_repository import UsuarioRepository
                from models.passo import Passo

                estilo = "direto"
                user_repo = UsuarioRepository(db)
                user = user_repo.buscar_por_id(usuario_id)
                if user and hasattr(user, 'estilo_instrucao'):
                    estilo = user.estilo_instrucao

                passos_textos = gerar_passos_tarefa(tarefa_salva.titulo, tarefa_salva.descricao or "", estilo)
                passo_repo = PassoRepository(db)
                for idx, pt in enumerate(passos_textos, start=1):
                    novo_p = Passo(tarefa_id=tarefa_salva.id, texto=pt, ordem=idx, concluido=False)
                    passo_repo.salvar(novo_p)
            except Exception as e:
                print(f"Aviso: Não foi possível gerar passos automáticos via IA na criação: {e}")

            return tarefa_salva
