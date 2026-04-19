import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medicamento import Medicamento
from app.models.usuario import Usuario
from app.models.personal_salud import PersonalSalud
from app.schemas.consulta import MedicamentoCreate, MedicamentoUpdate, MedicamentoResponse
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/medicamentos", tags=["medicamentos"])


@router.post("", response_model=MedicamentoResponse, status_code=201)
def create_medicamento(
    data: MedicamentoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    personal = db.query(PersonalSalud).filter(
        PersonalSalud.usuario_id == current_user.id
    ).first()
    
    if not personal:
        raise HTTPException(
            status_code=400,
            detail="Usuario no tiene registro de personal de salud"
        )
    
    med = Medicamento(
        paciente_id=data.paciente_id,
        prescrito_por=personal.id,
        nombre_medicamento=data.nombre_medicamento,
        dosis=data.dosis,
        frecuencia=data.frecuencia,
        fecha_inicio=data.fecha_inicio,
        fecha_fin=data.fecha_fin,
        esta_activo=data.esta_activo,
        notas=data.notas,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.put("/{med_id}", response_model=MedicamentoResponse)
def update_medicamento(
    med_id: uuid.UUID,
    data: MedicamentoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    med = db.query(Medicamento).filter(Medicamento.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(med, key, value)
    db.commit()
    db.refresh(med)
    return med
