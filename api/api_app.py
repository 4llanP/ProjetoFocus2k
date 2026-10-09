from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.rotas_usuarios import router as usuarios_router
from api.rotas_tarefas import router as tarefas_router

app = FastAPI(title="TPaC API", description="API criada na Aula 04", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios_router)
app.include_router(tarefas_router)

@app.get("/")
def inicio():
    return {"sistema": "TPaC", "api": "funcionando"}
