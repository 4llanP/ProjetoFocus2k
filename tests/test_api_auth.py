import os
os.environ["SECRET_KEY"] = "test-secret-key-12345"

import unittest
from fastapi.testclient import TestClient
from api.api_app import app
from config.database import SessionLocal
from models.usuario import Usuario

class TestApiAuth(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        # Limpa ou cria usuario de teste
        with SessionLocal() as db:
            from sqlalchemy import delete
            db.execute(delete(Usuario).where(Usuario.email == "teste@focus2k.com"))
            db.commit()

    def test_login_e_me(self):
        # 1. Criar usuário
        res_cad = self.client.post("/usuarios", json={
            "nome": "Usuário Teste",
            "email": "teste@focus2k.com",
            "senha": "senha123",
            "estilo_instrucao": "direto"
        })
        self.assertEqual(res_cad.status_code, 201)

        # 2. Fazer login
        res_login = self.client.post("/usuarios/login", json={
            "email": "teste@focus2k.com",
            "senha": "senha123"
        })
        self.assertEqual(res_login.status_code, 200)
        data = res_login.json()
        self.assertIn("token", data)
        token = data["token"]

        # 3. Testar /usuarios/me com Bearer token
        res_me = self.client.get("/usuarios/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_me.status_code, 200, f"Erro no /me: {res_me.text}")
        me_data = res_me.json()
        self.assertEqual(me_data["email"], "teste@focus2k.com")

if __name__ == "__main__":
    unittest.main()
