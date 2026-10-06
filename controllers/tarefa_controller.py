from services.tarefa_service import TarefaService


class TarefaController:

    def __init__(self):
        self.service = TarefaService()

    def listar_tarefas(self, usuario_id):
        return self.service.listar_por_usuario(usuario_id)

    def criar_tarefa(self, dados, usuario_id):
        return self.service.criar_tarefa(dados, usuario_id)
