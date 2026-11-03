# Sistema Focus com MySQL e JWT

Este projeto foi atualizado para utilizar banco de dados MySQL e possui uma camada de autenticação e autorização via JWT (JSON Web Tokens).

## 1. Configurar o Banco de Dados

1. Abra o `database.sql` e execute o script no seu MySQL.
2. Certifique-se de que o banco `focus_db` foi criado conforme o script.

## 2. Instalar dependências

No terminal, dentro da pasta do projeto, execute:

```bash
pip install -r requirements.txt
```

## 3. Configurar variáveis de ambiente

Edite o arquivo `.env` com as configurações do seu banco e a chave secreta para tokens:

```env
GEMINI_API_KEY=sua_chave_gemini
SECRET_KEY=chave_secreta
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
DB_NAME=focus_db
```

## 4. Executar a API e Acessar o App

A aplicação usa FastAPI e serve a interface web estática. Para rodar:

```bash
uvicorn api.api_app:app --reload
```

- **Documentação da API (Swagger)**: `http://localhost:8000/docs`
- **Interface Web**: `http://localhost:8000/ui/tela_login.html`

## Autenticação

- O sistema utiliza JWT.
- Após logar via `POST /usuarios/login`, utilize o token recebido no cabeçalho `Authorization: Bearer <token>` para acessar rotas protegidas (como `GET /usuarios/me` ou `GET /tarefas`).
