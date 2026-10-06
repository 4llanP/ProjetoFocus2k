# Sistema TPAC com MySQL e JWT

Este projeto foi atualizado para utilizar banco de dados MySQL e possui uma camada de autenticação e autorização via JWT (JSON Web Tokens).

## 1. Configurar o Banco de Dados

1. Abra o `database.sql` e execute o script no seu MySQL.
2. Certifique-se de que o banco `tpac_db` foi criado conforme o script.

## 2. Instalar dependências

No terminal, dentro da pasta do projeto, execute:

```bash
pip install -r requirements.txt
```

## 3. Configurar variáveis de ambiente

Edite o arquivo `.env` com as configurações do seu banco e a chave secreta para tokens:

```env
GEMINI_API_KEY=sua_chave_gemini
SECRET_KEY=uma_chave_secreta_muito_segura_e_longa_123456789
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=tpac_db
```

## 4. Executar a API

A aplicação usa FastAPI. Para rodar:

```bash
uvicorn api.api_app:app --reload
```

Acesse a documentação interativa em: `http://localhost:8000/docs`

## Autenticação

- O sistema utiliza JWT.
- Após logar via `POST /usuarios/login`, utilize o token recebido no cabeçalho `Authorization: Bearer <token>` para acessar rotas protegidas (como `GET /usuarios/me` ou `GET /tarefas`).
