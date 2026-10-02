from fastapi import FastAPI

from api.rotas_usuarios import router as usuarios_router

app = FastAPI(
    title="TPaC API",
    description="API criada na Aula 05",
    version="1.0.0"
)

app.include_router(usuarios_router)


@app.get("/")
def inicio():
    return {
        "sistema": "TPaC",
        "api": "funcionando"
    }