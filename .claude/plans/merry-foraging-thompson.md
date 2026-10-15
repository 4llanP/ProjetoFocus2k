# Plano de Reorganização e Implementação de Passos

## Contexto
1. **Separar CLI do Backend/API**: Mover todos os arquivos de interface de linha de comando (`main.py`, pasta `ui/`, arquivos legados em `core/` como `core/tarefas.py`, e `data/functions.py`) para uma pasta dedicada chamada `cli/` (ou `legacy_cli/`), mantendo limpa a raiz e a estrutura de API (`api/`, `controllers/`, `services/`, `repositories/`, `models/`, `config/`).
2. **Implementar CRUD Completo de Passos na API**:
   - Criar o modelo SQLAlchemy `Passo` em `models/passo.py` mapeado para a tabela `passos`.
   - Adicionar o relacionamento na model `Tarefa` se necessário, ou gerenciar via repositório/serviço.
   - Criar `PassoRepository` em `repositories/passo_repository.py` para persistir, buscar, atualizar e deletar passos.
   - Criar schemas Pydantic para Passos (`NovoPasso`, `AtualizarPasso`, `PassoResposta`) em `models/passo_schema.py` ou `models/tarefa_schema.py`.
   - Criar rotas robustas em `api/rotas_tarefas.py` (ou `api/rotas_passos.py`):
     - `POST /tarefas/{tarefa_id}/passos` — Adicionar passo manual ou gerar via IA e salvar.
     - `GET /tarefas/{tarefa_id}/passos` — Listar passos salvos no banco.
     - `PATCH /passos/{passo_id}/toggle` — Alternar status (concluído/pendente).
     - `PUT /passos/{passo_id}` — Editar texto/ordem do passo.
     - `DELETE /passos/{passo_id}` — Excluir passo.

## Passos da Execução
1. Criar diretório `cli/` e mover arquivos de console (`main.py`, `ui/`, `core/tarefas.py`, etc.).
2. Criar `models/passo.py`.
3. Criar `repositories/passo_repository.py`.
4. Atualizar schemas Pydantic.
5. Adicionar endpoints de passos na API.
