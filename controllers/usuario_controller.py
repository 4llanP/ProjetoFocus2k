from services.usuario_service import UsuarioService


class UsuarioController:

    def __init__(self, service=None):
        self.service = service or UsuarioService()

    def listar_perfis(self):
        return self.service.listar_usuarios()

    def buscar_perfil_por_id(self, usuario_id):
        return self.service.buscar_por_id(usuario_id)

    def atualizar_perfil(self, usuario_id, nome, estilo_instrucao):
        try:
            usuario = self.service.atualizar_usuario(usuario_id, nome, estilo_instrucao)
            if not usuario:
                return {"sucesso": False, "tipo": "NOT_FOUND", "mensagem": "Usuário não encontrado."}
            return {"sucesso": True, "tipo": "SUCESSO", "mensagem": "Perfil atualizado."}
        except ValueError as erro:
            return {"sucesso": False, "tipo": "REGRA_NEGOCIO", "mensagem": str(erro)}
        except Exception:
            return {"sucesso": False, "tipo": "FALHA_TECNICA", "mensagem": "Não foi possível concluir a operação."}

    def deletar_perfil(self, usuario_id):
        sucesso = self.service.deletar_usuario(usuario_id)
        if not sucesso:
            return {"sucesso": False, "tipo": "NOT_FOUND", "mensagem": "Usuário não encontrado."}
        return {"sucesso": True, "tipo": "SUCESSO", "mensagem": "Perfil deletado."}

    def criar_perfil(self, nome, senha, estilo_instrucao):
        try:
            usuario = self.service.criar_usuario(nome, senha, estilo_instrucao)
            return {
                "sucesso": True,
                "tipo": "SUCESSO",
                "mensagem": f"Perfil {usuario.nome} criado.",
            }
        except ValueError as erro:
            return {"sucesso": False, "tipo": "REGRA_NEGOCIO", "mensagem": str(erro)}
        except Exception:
            return {
                "sucesso": False,
                "tipo": "FALHA_TECNICA",
                "mensagem": "Não foi possível concluir a operação.",
            }
