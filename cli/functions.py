from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def autenticar_usuario(dados: dict, nome: str, senha: str) -> bool:
    if nome not in dados:
        return False

      # A senha que está no banco (ou memória) agora é um hash
    senha_hash_armazenado = dados[nome].get("senha", "")

      # VERIFICAÇÃO DO HASH
    return pwd_context.verify(senha, senha_hash_armazenado)