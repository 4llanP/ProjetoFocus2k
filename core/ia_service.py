"""Serviço de integração com IA para recursos do sistema."""

# pylint: disable=line-too-long
# pylint: disable=astroid-error
import os
from pathlib import Path
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Carrega o .env explicitamente do diretório raiz do projeto
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Inicializa o cliente se a chave de API estiver presente
API_KEY = os.environ.get("GEMINI_API_KEY")
client = None
if API_KEY:
    try:
        client = genai.Client(api_key=API_KEY)
    except Exception as e:
        print(f"Erro ao inicializar cliente Gemini: {e}")
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
            "- Forneça explicações claras, didáticas e acolhedoras, com exemplos práticos curtos. "
            "Evite absolutamente rodeios, enrolação, redundâncias ou repetições desnecessárias; vá direto ao ponto mantendo a explicação concisa (máximo de 3 linhas por tópico)."
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
    """Usa a IA do Gemini para quebrar a tarefa em micro-ações baseadas no título e descrição."""
    t = titulo_tarefa.strip()
    d = descricao_tarefa.strip() if descricao_tarefa else ""

    if client:
        try:
            detalhes = f" Tarefa: '{t}'."
            if d:
                detalhes += f" Contexto/Descrição: '{d}'."

            if estilo_usuario == "detalhado":
                system_instruction = (
                    "Você é um mentor especialista em produtividade TDAH. "
                    "Crie 3 a 5 passos práticos, altamente específicos e acionáveis para o título e contexto fornecidos. "
                    "PROIBIDO usar passos genéricos (como 'Planejar a tarefa', 'Executar etapa', 'Revisar final'). "
                    "Diga exatamente o que fazer em cada passo de forma prática, clara e sem enrolação (máximo de 3 linhas por passo)."
                )
                prompt = (
                    f"Gere os passos ultra-específicos para resolver esta tarefa exata:{detalhes} "
                    f"Escreva apenas os passos, um por linha, sem numeração manual. Sem rodeios, direto ao ponto."
                )
            else:  # estilo_usuario == "direto"
                system_instruction = (
                    "Você é um especialista em foco cirúrgico e produtividade TDAH. "
                    "Crie 3 a 5 micro-passos hiper-específicos e executáveis baseados estritamente no assunto da tarefa. "
                    "PROIBIDO respostas genéricas. Diga a ação concreta exata a ser realizada."
                )
                prompt = (
                    f"Gere passos hiper-específicos para esta tarefa:{detalhes} "
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

            texto_resp = ""
            if hasattr(response, "text") and response.text:
                texto_resp = response.text
            elif hasattr(response, "candidates") and response.candidates:
                try:
                    texto_resp = response.candidates[0].content.parts[0].text
                except Exception:
                    pass

            passos = [linha.strip() for linha in texto_resp.split("\n") if linha.strip()]
            passos_limpos = []
            for p in passos:
                p_limpo = p.lstrip("0123456789.-* ")
                if p_limpo:
                    passos_limpos.append(p_limpo)

            if passos_limpos:
                return passos_limpos
        except Exception as e:
            print(f"ERRO CRÍTICO AO GERAR PASSOS VIA IA: {e}")
            raise Exception(f"Falha na API de IA ao decompor tarefa: {str(e)}")

    print("ERRO CRÍTICO: Cliente Gemini não inicializado ou sem resposta válida.")
    raise Exception("Chave GEMINI_API_KEY não configurada ou cliente de IA indisponível.")


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
        if not hasattr(response, "text") or not response.text:
            return {"criar": False}
        texto = response.text.strip()
        if texto.startswith("```"):
            texto = texto.split("```")[1]
            if texto.startswith("json"):
                texto = texto[4:]
            texto = texto.strip("` \n")
        return json.loads(texto)
    except Exception:
        return {"criar": False}


def transcrever_audio_ia(audio_bytes: bytes, mime_type: str = "audio/webm") -> str:
    """Usa a IA do Gemini para transcrever áudio enviado pelo usuário de forma universal."""
    if not client:
        return ""
    try:
        response = client.models.generate_content(
            model=MODELO_GEMINI,
            contents=[
                types.Part.from_bytes(data=audio_bytes, mime_type=mime_type),
                "Transcreva o áudio acima exatamente para texto em português, retornando apenas o texto transcrito, sem introduções ou explicações."
            ]
        )
        return response.text.strip() if response.text else ""
    except Exception as e:
        print(f"Erro na transcrição de áudio via IA: {e}")
        return ""

