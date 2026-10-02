from datetime import date, datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict

class TipoTarefaEnum(str, Enum):
    TAREFAS_DIARIAS = "tarefas_diarias"
    TAREFAS_EDUCACIONAIS = "tarefas_educacionais"


class NovaTarefa(BaseModel):
    usuario_id: int
    tipo: TipoTarefaEnum 
    titulo: str
    descricao: Optional[str] = None
    prioridade: str = "media"
    prazo: Optional[date] = None


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