from datetime import date, datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class TipoTarefaEnum(str, Enum):
    TAREFAS_DIARIAS = "tarefas_diarias"
    TAREFAS_EDUCACIONAIS = "tarefas_educacionais"


class NovaTarefa(BaseModel):
    tipo: TipoTarefaEnum
    titulo: str
    descricao: Optional[str] = None
    prioridade: str = "media"
    prazo: Optional[date] = None


class NovoPasso(BaseModel):
    texto: str
    ordem: Optional[int] = 1


class AtualizarPasso(BaseModel):
    texto: Optional[str] = None
    concluido: Optional[bool] = None
    ordem: Optional[int] = None


class PassoResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tarefa_id: int
    texto: str
    concluido: bool
    ordem: int


class UsuarioResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    estilo_instrucao: str
    criado_em: Optional[datetime] = None


class TarefaResposta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    tipo: str
    titulo: str
    descricao: Optional[str] = None
    prioridade: str
    status: str
    prazo: Optional[date] = None
    criado_em: Optional[datetime] = None


class AtualizarStatusTarefa(BaseModel):
    status: str
