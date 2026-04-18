from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.auth import router as auth_router
from app.routers.patients import router as patients_router
from app.routers.consultations import router as consultations_router
from app.routers.medications import router as medications_router
from app.routers.labs import labs_router, allergies_router
from app.routers.public import router as public_router
from app.config import settings

app = FastAPI(
    title="Expediente Clínico Universal API",
    description="API para el sistema de historial médico en la nube accesible mediante código QR",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(patients_router)
app.include_router(consultations_router)
app.include_router(medications_router)
app.include_router(labs_router)
app.include_router(allergies_router)
app.include_router(public_router)


@app.get("/")
def root():
    return {"message": "Expediente Clínico Universal API", "version": "1.0.0", "docs": "/docs"}
