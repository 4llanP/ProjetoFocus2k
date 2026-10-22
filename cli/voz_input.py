"""Entrada por voz para o Focus 2k.

Modulo independente e destacavel. So expõe a funcao capturar_voz().
Depois e so importar no main.py:

    from cli.voz_input import capturar_voz
    texto = capturar_voz()
    if texto:
        # use o texto como entrada do sistema

Requisitos (instalar quando for usar):
    pip install speechrecognition pyaudio

Se o microfone nao funcionar via pyaudio, voce pode gravar com arecord
e passar o arquivo .wav para reconhecer_arquivo().
"""

import tempfile
import os
import subprocess


def capturar_voz(idioma="pt-BR", timeout=8, phrase_time_limit=12):
    """Captura audio do microfone e devolve o texto reconhecido.

    Retorna:
        str com o texto falado, ou None se falhar / cancelar.
    """
    try:
        import speech_recognition as sr
    except ImportError:
        print("[Voz] speech_recognition nao instalado.")
        print("      Instale com:  pip install speechrecognition pyaudio")
        return None

    recognizer = sr.Recognizer()
    try:
        with sr.Microphone() as source:
            print("[Voz] Fale agora... (Ctrl+C para cancelar)")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(
                source,
                timeout=timeout,
                phrase_time_limit=phrase_time_limit,
            )
        print("[Voz] Reconhecendo...")
        texto = recognizer.recognize_google(audio, language=idioma)
        return texto
    except sr.WaitTimeoutError:
        print("[Voz] Nenhum audio detectado no tempo esperado.")
        return None
    except sr.UnknownValueError:
        print("[Voz] Nao entendi o que foi dito.")
        return None
    except sr.RequestError as e:
        print(f"[Voz] Erro no servico de reconhecimento: {e}")
        return None
    except KeyboardInterrupt:
        print("\n[Voz] Cancelado pelo usuario.")
        return None


def reconhecer_arquivo(caminho_wav, idioma="pt-BR"):
    """Reconhece texto de um arquivo .wav ja gravado (ex: via arecord)."""
    try:
        import speech_recognition as sr
    except ImportError:
        print("[Voz] speech_recognition nao instalado.")
        print("      Instale com:  pip install speechrecognition")
        return None

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(caminho_wav) as source:
            audio = recognizer.record(source)
        return recognizer.recognize_google(audio, language=idioma)
    except sr.UnknownValueError:
        print("[Voz] Nao entendi o audio do arquivo.")
        return None
    except sr.RequestError as e:
        print(f"[Voz] Erro no servico de reconhecimento: {e}")
        return None


def gravar_arquivo_arecord(caminho_saida, duracao=8):
    """Grava o microfone em um arquivo WAV usando o arecord do sistema."""
    try:
        subprocess.run(
            ["arecord", "-d", str(duracao), "-f", "S16_LE", "-r", "16000", "-c", "1", caminho_saida],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return caminho_saida
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"[Voz] Erro ao gravar com arecord: {e}")
        return None


if __name__ == "__main__":
    # Teste isolado do modulo (roda so se executar este arquivo diretamente)
    texto = capturar_voz()
    if texto:
        print(f"[Voz] Voce disse: {texto}")
    else:
        print("[Voz] Nenhum texto capturado.")
