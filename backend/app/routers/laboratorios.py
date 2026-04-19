import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resultado_laboratorio import ResultadoLaboratorio
from app.models.usuario import Usuario
from app.schemas.consulta import ResultadoLaboratorioCreate, ResultadoLaboratorioResponse
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/laboratorios", tags=["laboratorios"])


@router.post("", response_model=ResultadoLaboratorioResponse, status_code=201)
def create_resultado_laboratorio(
    data: ResultadoLaboratorioCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    lab = ResultadoLaboratorio(**data.model_dump())
    db.add(lab)
    db.commit()
    db.refresh(lab)
    return lab
