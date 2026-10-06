from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel

from config.database import SessionLocal
from controllers.usuario_controller import UsuarioController
from core.ia_service import gerar_passos_tarefa
from repositories.tarefa_repository import TarefaRepository
from core.auth import verificar_token, RoleChecker, verificar_dono_ou_admin

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

controller = UsuarioController()


class NovoUsuario(BaseModel):
    nome: str
    email: str
    senha: str
    estilo_instrucao: str = "direto"


class AtualizarUsuario(BaseModel):
    nome: str
    email: str
    estilo_instrucao: str


class Login(BaseModel):
    email: str
    senha: str


@router.get("", dependencies=[Depends(RoleChecker(allowed_roles=["admin"]))])
def listar_usuarios(usuario_logado: dict = Depends(verificar_token)):
    perfis = controller.listar_perfis()
    # Converte explicitamente objetos SQLAlchemy em dicionários se necessário
    dados = [
        p.to_dict() if hasattr(p, "to_dict") else p
        for p in perfis
    ] if isinstance(perfis, list) else perfis
    return {"dados": dados}


@router.get("/me")
def obter_meu_perfil(usuario_logado: dict = Depends(verificar_token)):
    # O ID está salvo no 'sub' do token
    usuario_id = int(usuario_logado['sub'])
    usuario = controller.buscar_perfil_por_id(usuario_id)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    # Retornamos apenas os campos seguros, omitindo a senha
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "role": usuario.role,
        "estilo_instrucao": usuario.estilo_instrucao,
        "criado_em": usuario.criado_em
    }


@router.get("/{usuario_id}")
def buscar_usuario(usuario_id: int, usuario_logado: dict = Depends(verificar_token)):
    verificar_dono_ou_admin(usuario_id, usuario_logado)
    usuario = controller.buscar_perfil_por_id(usuario_id)

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )

    dados = usuario.to_dict() if hasattr(usuario, "to_dict") else usuario
    return {"dados": dados}


@router.put("/{usuario_id}")
def atualizar_usuario(usuario_id: int, dados: AtualizarUsuario, usuario_logado: dict = Depends(verificar_token)):
    verificar_dono_ou_admin(usuario_id, usuario_logado)
    resposta = controller.atualizar_perfil(
        usuario_id,
        dados.nome,
        dados.email,
        dados.estilo_instrucao
    )

    if not resposta["sucesso"]:
        if resposta["tipo"] == "NOT_FOUND":
            raise HTTPException(status_code=404, detail=resposta["mensagem"])
        raise HTTPException(status_code=422, detail=resposta["mensagem"])

    return resposta


@router.delete("/{usuario_id}", dependencies=[Depends(RoleChecker(allowed_roles=["admin"]))])
def deletar_usuario(usuario_id: int):
    resposta = controller.deletar_perfil(usuario_id)

    if not resposta["sucesso"]:
        if resposta["tipo"] == "NOT_FOUND":
            raise HTTPException(status_code=404, detail=resposta["mensagem"])
        raise HTTPException(status_code=422, detail=resposta["mensagem"])

    return resposta


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_usuario(dados: NovoUsuario):
    resposta = controller.criar_perfil(
        dados.nome,
        dados.email,
        dados.senha,
        dados.estilo_instrucao
    )

    if not resposta["sucesso"]:
        raise HTTPException(
            status_code=422,
            detail=resposta["mensagem"]
        )

    return resposta


@router.post("/login")
def login(dados: Login):
    resposta = controller.autenticar_perfil(dados.email, dados.senha)
    if not resposta["sucesso"]:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=resposta["mensagem"])
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
