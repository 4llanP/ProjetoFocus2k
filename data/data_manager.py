"""Gerenciamento de dados do sistema usando MySQL."""

import os
from typing import Dict, Any

import mysql.connector
from dotenv import load_dotenv

load_dotenv()


def conectar():
    """
    Cria e retorna uma conexão com o banco MySQL.
    """
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT")),
    )


def carregar_dados() -> Dict[str, Any]:
    """
    Busca os usuários, tarefas e passos no MySQL e monta a mesma estrutura
    que antes era lida do arquivo tpac_users.json.

    Estrutura retornada:
    {
        "Nome": {
            "preferencias": {"estilo_instrucao": "direto"},
            "tarefas_diarias": [...],
            "tarefas_educacionais": [...]
        }
    }
    """
    dados = {}

    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute("""
    SELECT id, nome, senha, estilo_instrucao
    FROM usuarios
    ORDER BY nome
    """)
    usuarios = cursor.fetchall()

    for usuario in usuarios:
        nome = usuario["nome"]

        dados[nome] = {
            "senha": usuario["senha"],
            "preferencias": {"estilo_instrucao": usuario["estilo_instrucao"]},
            "tarefas_diarias": [],
            "tarefas_educacionais": [],
        }

        cursor.execute(
            """
            SELECT id, titulo, descricao, prioridade, prazo, concluida, tipo
            FROM tarefas
            WHERE usuario_id = %s
            ORDER BY id
        """,
            (usuario["id"],),
        )
        tarefas = cursor.fetchall()

        for tarefa in tarefas:
            prazo = tarefa["prazo"].strftime("%Y-%m-%d") if tarefa["prazo"] else ""
            tarefa_dict = {
                "titulo": tarefa["titulo"],
                "descricao": tarefa["descricao"],
                "prioridade": tarefa["prioridade"],
                "prazo": prazo,
                "concluida": bool(tarefa["concluida"]),
                "passos": [],
            }

            cursor.execute(
                """
                SELECT texto, concluido
                FROM passos
                WHERE tarefa_id = %s
                ORDER BY ordem
            """,
                (tarefa["id"],),
            )
            passos = cursor.fetchall()

            for passo in passos:
                tarefa_dict["passos"].append(
                    {"texto": passo["texto"], "concluido": bool(passo["concluido"])}
                )

            dados[nome][tarefa["tipo"]].append(tarefa_dict)

    cursor.close()
    conexao.close()

    return dados


def salvar_dados(dados: Dict[str, Any]) -> None:
    """
    Salva no MySQL a estrutura completa do sistema.

    Para manter o código simples e didático para os alunos, esta função:
    1. apaga os dados antigos;
    2. recria usuários, tarefas e passos com base no dicionário recebido.

    Em sistemas profissionais, normalmente usaríamos INSERT, UPDATE e DELETE
    específicos para cada ação.
    """
    conexao = conectar()
    cursor = conexao.cursor()

    try:
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute("TRUNCATE TABLE passos")
        cursor.execute("TRUNCATE TABLE tarefas")
        cursor.execute("TRUNCATE TABLE usuarios")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

        for nome, info_usuario in dados.items():
            estilo = info_usuario.get("preferencias", {}).get(
                "estilo_instrucao", "direto"
            )
            senha = info_usuario.get("senha", "")

            cursor.execute(
                """
            INSERT INTO usuarios (nome, senha, estilo_instrucao)
            VALUES (%s, %s, %s)
            """,
                (nome, senha, estilo),
            )

            usuario_id = cursor.lastrowid

            for tipo in ["tarefas_diarias", "tarefas_educacionais"]:
                for tarefa in info_usuario.get(tipo, []):
                    cursor.execute(
                        """
                        INSERT INTO tarefas (usuario_id, tipo, titulo, descricao, prioridade, prazo, concluida)
                        VALUES (%s, %s, %s, %s, %s, NULLIF(%s, ''), %s)
                    """,
                        (
                            usuario_id,
                            tipo,
                            tarefa.get("titulo", ""),
                            tarefa.get("descricao", ""),
                            tarefa.get("prioridade", "media"),
                            tarefa.get("prazo", ""),
                            bool(tarefa.get("concluida", False)),
                        ),
                    )

                    tarefa_id = cursor.lastrowid

                    for ordem, passo in enumerate(tarefa.get("passos", []), start=1):
                        cursor.execute(
                            """
                            INSERT INTO passos (tarefa_id, texto, concluido, ordem)
                            VALUES (%s, %s, %s, %s)
                        """,
                            (
                                tarefa_id,
                                passo.get("texto", ""),
                                bool(passo.get("concluido", False)),
                                ordem,
                            ),
                        )

        conexao.commit()

    except Exception:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()
