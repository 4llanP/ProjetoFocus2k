from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from config.database import SessionLocal
from controllers.tarefa_controller import TarefaController
from core.auth import verificar_token
from core.ia_service import gerar_passos_tarefa
from models.tarefa_schema import NovaTarefa, NovoPasso, AtualizarPasso, PassoResposta, AtualizarStatusTarefa
from models.passo import Passo
import models.usuario
from repositories.tarefa_repository import TarefaRepository
from repositories.passo_repository import PassoRepository

router = APIRouter(prefix="/tarefas", tags=["tarefas"])

controller = TarefaController()


@router.get("")
def listar_tarefas(usuario_logado: dict = Depends(verificar_token)):
    try:
        usuario_id = int(usuario_logado['sub'])
        tarefas = controller.listar_tarefas(usuario_id)
        dados = [
            t.to_dict() if hasattr(t, "to_dict") else t
            for t in tarefas
        ] if isinstance(tarefas, list) else tarefas
        return {"dados": dados}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar tarefas: {str(e)}")


@router.post("", status_code=status.HTTP_201_CREATED)
def criar_tarefa(dados: NovaTarefa, usuario_logado: dict = Depends(verificar_token)):
    try:
        usuario_id = int(usuario_logado['sub'])
        tarefa = controller.criar_tarefa(dados, usuario_id)
        return {"dados": tarefa.to_dict() if hasattr(tarefa, "to_dict") else tarefa}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao criar tarefa: {str(e)}")


# --- CRUD DE PASSOS ---

@router.get("/{tarefa_id}/passos", response_model=List[PassoResposta])
def listar_passos_tarefa(tarefa_id: int, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        tarefa_repo = TarefaRepository(db)
        tarefa = tarefa_repo.buscar_por_id(tarefa_id)

        if not tarefa:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        if tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        passo_repo = PassoRepository(db)
        passos = passo_repo.listar_por_tarefa(tarefa_id)

        return passos


@router.post("/{tarefa_id}/decompor")
def decompor_tarefa_ia(tarefa_id: int, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        tarefa_repo = TarefaRepository(db)
        tarefa = tarefa_repo.buscar_por_id(tarefa_id)

        if not tarefa:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        if tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        textos_passos = gerar_passos_tarefa(tarefa.titulo, tarefa.descricao or "")
        return {"passos": textos_passos}


@router.post("/{tarefa_id}/passos", response_model=PassoResposta, status_code=status.HTTP_201_CREATED)
def criar_passo(tarefa_id: int, dados: NovoPasso, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        tarefa_repo = TarefaRepository(db)
        tarefa = tarefa_repo.buscar_por_id(tarefa_id)

        if not tarefa:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        if tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        passo_repo = PassoRepository(db)
        novo_passo = Passo(
            tarefa_id=tarefa_id,
            texto=dados.texto,
            ordem=dados.ordem or 1,
            concluido=False
        )
        return passo_repo.salvar(novo_passo)


@router.patch("/passos/{passo_id}/toggle", response_model=PassoResposta)
def alternar_status_passo(passo_id: int, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        passo_repo = PassoRepository(db)
        passo = passo_repo.buscar_por_id(passo_id)

        if not passo:
            raise HTTPException(status_code=404, detail="Passo não encontrado.")

        tarefa_repo = TarefaRepository(db)
        tarefa = tarefa_repo.buscar_por_id(passo.tarefa_id)
        if not tarefa or tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        passo.concluido = not passo.concluido
        return passo_repo.salvar(passo)


@router.put("/passos/{passo_id}", response_model=PassoResposta)
def atualizar_passo(passo_id: int, dados: AtualizarPasso, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        passo_repo = PassoRepository(db)
        passo = passo_repo.buscar_por_id(passo_id)

        if not passo:
            raise HTTPException(status_code=404, detail="Passo não encontrado.")

        tarefa_repo = TarefaRepository(db)
        tarefa = tarefa_repo.buscar_por_id(passo.tarefa_id)
        if not tarefa or tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        if dados.texto is not None:
            passo.texto = dados.texto
        if dados.concluido is not None:
            passo.concluido = dados.concluido
        if dados.ordem is not None:
            passo.ordem = dados.ordem

        return passo_repo.salvar(passo)


@router.delete("/passos/{passo_id}", status_code=status.HTTP_200_OK)
def deletar_passo(passo_id: int, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        passo_repo = PassoRepository(db)
        passo = passo_repo.buscar_por_id(passo_id)

        if not passo:
            raise HTTPException(status_code=404, detail="Passo não encontrado.")

        tarefa_repo = TarefaRepository(db)
        tarefa = tarefa_repo.buscar_por_id(passo.tarefa_id)
        if not tarefa or tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        passo_repo.deletar(passo)
        return {"mensagem": "Passo excluído com sucesso."}


@router.put("/{tarefa_id}")
def atualizar_tarefa(tarefa_id: int, dados: NovaTarefa, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        repo = TarefaRepository(db)
        tarefa = repo.buscar_por_id(tarefa_id)
        if not tarefa:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        if tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        tarefa.titulo = dados.titulo
        tarefa.descricao = dados.descricao
        tarefa.prioridade = dados.prioridade
        tarefa.prazo = dados.prazo
        tarefa.tipo = dados.tipo
        repo.salvar(tarefa)
        return {"mensagem": "Tarefa atualizada com sucesso.", "dados": tarefa.to_dict() if hasattr(tarefa, "to_dict") else tarefa}


@router.delete("/{tarefa_id}")
def deletar_tarefa(tarefa_id: int, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        repo = TarefaRepository(db)
        tarefa = repo.buscar_por_id(tarefa_id)
        if not tarefa:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        if tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        passo_repo = PassoRepository(db)
        passos = passo_repo.listar_por_tarefa(tarefa_id)
        for p in passos:
            passo_repo.deletar(p)

        repo.deletar(tarefa)
        return {"mensagem": "Tarefa excluída com sucesso."}


@router.patch("/{tarefa_id}/status")
def atualizar_status_tarefa(tarefa_id: int, dados: AtualizarStatusTarefa, usuario_logado: dict = Depends(verificar_token)):
    with SessionLocal() as db:
        repo = TarefaRepository(db)
        tarefa = repo.buscar_por_id(tarefa_id)
        if not tarefa:
            raise HTTPException(status_code=404, detail="Tarefa não encontrada.")
        if tarefa.usuario_id != int(usuario_logado['sub']):
            raise HTTPException(status_code=403, detail="Acesso negado.")

        if dados.status not in ["pendente", "em_andamento", "concluido"]:
            raise HTTPException(status_code=422, detail="Status inválido.")

        tarefa.status = dados.status
        if dados.status == "concluido":
            tarefa.concluida = True
        else:
            tarefa.concluida = False

        repo.salvar(tarefa)
        return {"mensagem": "Status atualizado com sucesso.", "dados": tarefa.to_dict()}
