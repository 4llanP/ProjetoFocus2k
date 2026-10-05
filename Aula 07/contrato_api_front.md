# Contrato da API — Focus2k

## usuarios
O front-end precisa listar os perfis de usuário para seleção e permitir a criação de novos perfis de estudantes.

### GET /usuarios — Listar usuários
- Estado: FRONT-READY
- Sucesso esperado: 200
- Evidência: O arquivo api/rotas_usuarios.py retorna a lista de entidades SQLAlchemy diretamente dentro de um dicionario. A analise estatica do codigo indica a ausencia de um schema de resposta (response_model) Pydantic no FastAPI.

### POST /usuarios — Criar novo usuário
- Estado: FRONT-READY
- Sucesso esperado: 201
- Evidência: A tabela 'usuarios' no database.sql define a coluna 'senha' como VARCHAR(255) NOT NULL. No entanto, o schema Pydantic NovoUsuario em api/rotas_usuarios.py, a entidade Usuario em models/usuario.py e o metodo UsuarioRepository.criar omitem o campo 'senha'.

## tarefas
O front-end precisa carregar as tarefas vinculadas a um determinado usuario e permitir a criacao de novas atividades.

### GET /tarefas — Listar tarefas do usuário
- Estado: FRONT-READY
- Sucesso esperado: 200
- Evidência: O endpoint api/rotas_tarefas.py recebe usuario_id como Query Param e retorna modelos ORM Tarefa diretamente em um dicionario sem o uso de response_model ou DTOs Pydantic.

### POST /tarefas — Criar nova tarefa
- Estado: FRONT-READY
- Sucesso esperado: 201
- Evidência: O endpoint recebe o schema NovaTarefa com campos correspondentes ao modelo e repassa para a camada de servico/repositorio. A operacao nao possui erros estaticos de contrato declarados no Pydantic.

