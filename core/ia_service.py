"""Serviço de integração com IA para recursos do sistema."""

# pylint: disable=line-too-long
# pylint: disable=astroid-error
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Inicializa o cliente se a chave de API estiver presente
API_KEY = os.environ.get("GEMINI_API_KEY")
client = None
if API_KEY:
    try:
        client = genai.Client()
    except Exception:
        client = None

# Modelo ideal para tarefas rápidas de texto e resumos no terminal
MODELO_GEMINI = "gemini-2.5-flash"


def _obter_instrucao_chat_ia(estilo_usuario: str) -> str:
    """Retorna a persona e as diretrizes para o chat interativo com a IA, permitindo respostas mais livres, conversacionais e acolhedoras."""
    base_prompt = (
        "Você é um assistente de IA amigável, acolhedor e especialista em apoio a pessoas com TDAH, produtividade e organização pessoal.\n"
        "Seu objetivo é conversar com o usuário, tirar dúvidas, ajudar a organizar pensamentos, sugerir estratégias e planejar estudos ou rotinas.\n"
        "Diretrizes para o chat:\n"
        "- Tenha respostas naturais, fluidas, conversacionais e mais livres, permitindo explicações em prosa clara ou tópicos conforme necessário.\n"
        "- Mantenha a empatia, clareza e acolhimento, evitando blocos de texto excessivamente densos para não sobrecarregar a atenção.\n"
        "- Não utilize formatação de texto com asteriscos (*), negrito, itálico ou símbolos de markdown; escreva o texto limpo, natural e legível.\n"
    )

    if estilo_usuario == "detalhado":
        base_prompt += (
            "- Forneça respostas completas, ricas em explicações didáticas, exemplos práticos e orientações detalhadas, "
            "com acolhimento total e contexto completo."
        )
    else:
        base_prompt += (
            "- Seja conciso, direto ao ponto, pragmático e focado em soluções imediatas e acionáveis, "
            "completamente livre de rodeios."
        )

    return base_prompt


def obter_resposta_ia(pergunta: str, estilo_usuario: str, contexto_tarefa: str = "") -> list:
    """Conecta ao serviço de IA para responder dúvidas gerais de estudos ou organização no chat."""
    if not client:
        return [
            "Erro: Chave de API não configurada.",
            "Por favor, configure sua chave de API.",
        ]
    system_instruction = _obter_instrucao_chat_ia(estilo_usuario)

    contents = pergunta
    if contexto_tarefa:
        contents = f"[Contexto da Tarefa Ativa: {contexto_tarefa}]\n\nPergunta do usuário: {pergunta}"

    try:
        response = client.models.generate_content(
            model=MODELO_GEMINI,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
            ),
        )

        texto_resp = response.text.strip() if response.text else "Sem resposta da IA."
        return [texto_resp]
    except Exception as e:
        return [f"Erro na comunicação com a IA: {str(e)}"]


def gerar_passos_tarefa(titulo_tarefa: str, descricao_tarefa: str = "", estilo_usuario: str = "direto") -> list:
    """Usa exclusivamente a IA do Gemini para quebrar a tarefa em micro-ações baseadas no título e descrição."""
    if not client:
        raise ValueError("Chave de API do Gemini (GEMINI_API_KEY) não configurada no servidor.")

    detalhes = f" Tarefa: '{titulo_tarefa}'."
    if descricao_tarefa:
        detalhes += f" Contexto/Descrição: '{descricao_tarefa}'."

    if estilo_usuario == "detalhado":
        system_instruction = (
            "Você é um especialista em tutoria, pedagogia e produtividade para pessoas com TDAH. "
            "Crie 3 a 5 passos sequenciais bem explicados, didáticos e acolhedores baseados estritamente no título e descrição fornecidos. "
            "Cada passo deve detalhar o 'porquê' e o 'como fazer' de forma estruturada."
        )
        prompt = (
            f"Quebre a tarefa abaixo em 3 a 5 passos sequenciais detalhados e didáticos gerados pela IA:{detalhes} "
            f"Escreva apenas os passos, um por linha, sem numeração manual."
        )
    else:  # estilo_usuario == "direto"
        system_instruction = (
            "Você é um especialista em foco cirúrgico e produtividade para pessoas com TDAH. "
            "Crie 3 a 5 micro-passos sequenciais extremamente diretos, concretos e acionáveis baseados no título e descrição."
        )
        prompt = (
            f"Quebre a tarefa abaixo em 3 a 4 micro-passos sequenciais ultra-diretos e executáveis gerados pela IA:{detalhes} "
            f"Escreva apenas os passos, um por linha, sem numeração manual."
        )

    response = client.models.generate_content(
        model=MODELO_GEMINI,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.25,
        ),
    )

    passos = [linha.strip() for linha in response.text.split("\n") if linha.strip()]
    passos_limpos = []
    for p in passos:
        p_limpo = p.lstrip("0123456789.-* ")
        if p_limpo:
            passos_limpos.append(p_limpo)

    if not passos_limpos:
        raise ValueError("A IA não retornou passos válidos para esta tarefa.")

    return passos_limpos


def extrair_intent_criar_tarefa(pergunta: str) -> dict:
    """Usa a IA para detectar se o usuário quer criar uma tarefa e extrair os dados."""
    import json
    if not client:
        return {"criar": False}

    prompt = (
        f"Analise o texto do usuário: '{pergunta}'.\n"
        "O usuário está pedindo para criar, adicionar ou registrar uma nova tarefa/atividade?\n"
        "Se sim, retorne APENAS um objeto JSON válido (sem markdown ```json) com os campos:\n"
        "{\n"
        "  \"criar\": true,\n"
        "  \"titulo\": \"título extraído da tarefa\",\n"
        "  \"descricao\": \"descrição detalhada ou vazia\",\n"
        "  \"prioridade\": \"baixa\" | \"media\" | \"alta\",\n"
        "  \"tipo\": \"tarefas_diarias\" | \"tarefas_educacionais\"\n"
        "}\n"
        "Se não estiver pedindo para criar uma tarefa, retorne APENAS:\n"
        "{\n"
        "  \"criar\": false\n"
        "}"
    )
    try:
        response = client.models.generate_content(
            model=MODELO_GEMINI,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.1)
        )
        texto = response.text.strip()
        if texto.startswith("```"):
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]
            texto = texto.strip("` \n")
        return json.loads(texto)
    except Exception:
        return {"criar": False}
