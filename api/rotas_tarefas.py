from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from config.database import SessionLocal
from controllers.tarefa_controller import TarefaController
from core.auth import verificar_token
from core.ia_service import gerar_passos_tarefa
from models.tarefa_schema import NovaTarefa, NovoPasso, AtualizarPasso, PassoResposta
from models.passo import Passo
import models.usuario
from repositories.tarefa_repository import TarefaRepository
from repositories.passo_repository import PassoRepository

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

        # Se não houver passos salvos, tenta gerar via IA opcionalmente ou retorna vazio
        if not passos:
            try:
                textos_ia = gerar_passos_tarefa(tarefa.titulo)
                # Salva os passos gerados pela IA automaticamente
                for i, texto in enumerate(textos_ia, 1):
                    novo_p = Passo(tarefa_id=tarefa_id, texto=texto, ordem=i, concluido=False)
                    passo_repo.salvar(novo_p)
                passos = passo_repo.listar_por_tarefa(tarefa_id)
            except Exception:
                pass

        return passos


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

        repo.deletar(tarefa)
        return {"mensagem": "Tarefa excluída com sucesso."}
