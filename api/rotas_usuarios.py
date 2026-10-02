from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from config.database import SessionLocal
from controllers.usuario_controller import UsuarioController
from core.ia_service import gerar_passos_tarefa
from repositories.tarefa_repository import TarefaRepository

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

controller = UsuarioController()


class NovoUsuario(BaseModel):
    nome: str
    senha: str
    estilo_instrucao: str = "direto"


@router.get("")
def listar_usuarios():
    perfis = controller.listar_perfis()
    # Converte explicitamente objetos SQLAlchemy em dicionários se necessário
    dados = [
        p.to_dict() if hasattr(p, "to_dict") else p
        for p in perfis
    ] if isinstance(perfis, list) else perfis
    return {"dados": dados}


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_usuario(dados: NovoUsuario):
    resposta = controller.criar_perfil(
        dados.nome,
        dados.senha,
        dados.estilo_instrucao
    )

    if not resposta["sucesso"]:
        raise HTTPException(
            status_code=422,
            detail=resposta["mensagem"]
        )

    return resposta


@router.get("/passos")
def obter_passos_via_query(tarefa_id: int):
    with SessionLocal() as db:
        repo = TarefaRepository(db)
        tarefa = repo.buscar_por_id(tarefa_id)

        if not tarefa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarefa não encontrada.",
            )

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