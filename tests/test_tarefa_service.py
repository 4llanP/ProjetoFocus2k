import unittest
from datetime import date
from services.tarefa_service import TarefaService
from models.tarefa import Tarefa


class TarefaRepositoryFake:
    def __init__(self):
        self.tarefas = []
        self._id_counter = 1

    def listar_por_usuario(self, usuario_id):
        return [t for t in self.tarefas if t.usuario_id == usuario_id]

    def salvar(self, tarefa):
        if not tarefa.id:
            tarefa.id = self._id_counter
            self._id_counter += 1
        self.tarefas.append(tarefa)
        return tarefa


class DadosTarefaMock:
    def __init__(self, tipo, titulo, descricao, prioridade, prazo):
        self.tipo = tipo
        self.titulo = titulo
        self.descricao = descricao
        self.prioridade = prioridade
        self.prazo = prazo


class TestTarefaService(unittest.TestCase):
    def test_criar_e_listar_tarefa(self):
        repo_fake = TarefaRepositoryFake()
        # Test unit logic using repo fake or service mock logic
        tarefa = Tarefa(
            usuario_id=1,
            tipo="tarefas_educacionais",
            titulo="Estudar FastAPI",
            descricao="Revisar rotas e validações",
            prioridade="alta",
            prazo=date(2026, 10, 30)
        )
        saved = repo_fake.salvar(tarefa)
        self.assertEqual(saved.id, 1)
        self.assertEqual(saved.titulo, "Estudar FastAPI")
        self.assertEqual(saved.prioridade, "alta")
        self.assertEqual(saved.prazo, date(2026, 10, 30))

        lista = repo_fake.listar_por_usuario(1)
        self.assertEqual(len(lista), 1)
        self.assertEqual(lista[0].titulo, "Estudar FastAPI")


if __name__ == "__main__":
    unittest.main()
