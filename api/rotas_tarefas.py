from fastapi import APIRouter, HTTPException, status, Depends

from config.database import SessionLocal
from controllers.tarefa_controller import TarefaController
from core.auth import verificar_token
from core.ia_service import gerar_passos_tarefa
from models.tarefa_schema import NovaTarefa, TarefaResposta
from repositories.tarefa_repository import TarefaRepository

router = APIRouter(prefix="/tarefas", tags=["tarefas"])

controller = TarefaController()


@router.get("")
def listar_tarefas(usuario_logado: dict = Depends(verificar_token)):
    usuario_id = int(usuario_logado['sub'])
    tarefas = controller.listar_tarefas(usuario_id)
    dados = [
        t.to_dict() if hasattr(t, "to_dict") else t
        for t in tarefas
    ] if isinstance(tarefas, list) else tarefas
    return {"dados": dados}


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_tarefa(dados: NovaTarefa, usuario_logado: dict = Depends(verificar_token)):
    usuario_id = int(usuario_logado['sub'])
    tarefa = controller.criar_tarefa(dados, usuario_id)
    return {"dados": tarefa}


@router.get("/{tarefa_id}/passos")
def obter_passos_tarefa(tarefa_id: int, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        repo = TarefaRepository(db)
        tarefa = repo.buscar_por_id(tarefa_id)

        if not tarefa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarefa não encontrada.",
            )

        if tarefa.usuario_id != int(usuario_logado['sub']):
             raise HTTPException(status_code=403, detail="Você não tem acesso a esta tarefa.")

        try:
            passos = gerar_passos_tarefa(tarefa.titulo)
            return {"tarefa_id": tarefa_id, "passos": passos}
        except Exception:
            return {
                "tarefa_id": tarefa_id,
                "passos": [
                    "Configure a GEMINI_API_KEY para habilitar a geração por IA."
                ],
            }