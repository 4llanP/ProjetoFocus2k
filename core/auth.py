import jwt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Security, Depends, Cookie
from typing import Optional
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable must be set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Define que o token pode vir no header Bearer ou via Cookie
security = HTTPBearer(auto_error=False)

def criar_token_acesso(dados: dict):
    to_encode = dados.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verificar_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    access_token: Optional[str] = Cookie(None)
):
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(status_code=401, detail="Token ausente ou não autenticado")

    try:
        # Tenta decodificar o token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")

def verificar_dono_ou_admin(resource_owner_id: int, payload: dict):
    if payload.get("role") == "admin":
        return True
    if int(payload.get("sub")) == resource_owner_id:
        return True
    raise HTTPException(status_code=403, detail="Acesso proibido: você não tem permissão para este recurso")

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, payload: dict = Depends(verificar_token)):
        if payload.get("role") not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Acesso proibido: papel insuficiente")
        return payload
