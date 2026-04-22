from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.pacientes import router as pacientes_router
from app.routers.consultas import router as consultas_router
from app.routers.medicamentos import router as medicamentos_router
from app.routers.laboratorios import router as laboratorios_router
from app.routers.publico import router as publico_router
from app.routers.archivos import router as archivos_router

app = FastAPI(
    title="Expediente Clínico Universal API",
    description="API para el sistema de historial médico en la nube accesible mediante código QR",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(pacientes_router)
app.include_router(consultas_router)
app.include_router(medicamentos_router)
app.include_router(laboratorios_router)
app.include_router(publico_router)
app.include_router(archivos_router)


@app.get("/")
def root():
    return {"message": "Expediente Clínico Universal API", "version": "2.0.0", "docs": "/docs"}
