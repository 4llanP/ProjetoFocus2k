-- ============================================================
-- BANCO DE DADOS DO SISTEMA TPAC
-- Execute este arquivo no MySQL Workbench antes de rodar o Python.
-- ============================================================

CREATE DATABASE IF NOT EXISTS tpac_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE tpac_db;

-- Remove as tabelas antigas, caso você esteja recriando o banco.
DROP TABLE IF EXISTS passos;
DROP TABLE IF EXISTS tarefas;
DROP TABLE IF EXISTS usuarios;

-- ============================================================
-- TABELA DE USUÁRIOS
-- Guarda o perfil principal do usuário.
-- ============================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    estilo_instrucao ENUM('direto', 'detalhado') NOT NULL DEFAULT 'direto',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA DE TAREFAS
-- Guarda as atividades diárias e educacionais.
-- ============================================================
CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo ENUM('tarefas_diarias', 'tarefas_educacionais') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NULL,
    prioridade ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
    prazo DATE NULL,
    concluida BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tarefas_usuario
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- ============================================================
-- TABELA DE PASSOS
-- Guarda os passos gerados pela IA para cada tarefa.
-- ============================================================
CREATE TABLE passos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarefa_id INT NOT NULL,
    texto TEXT NOT NULL,
    concluido BOOLEAN NOT NULL DEFAULT FALSE,
    ordem INT NOT NULL DEFAULT 1,

    CONSTRAINT fk_passos_tarefa
        FOREIGN KEY (tarefa_id)
        REFERENCES tarefas(id)
        ON DELETE CASCADE
);
