import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.consulta import Consulta
from app.models.usuario import Usuario
from app.models.personal_salud import PersonalSalud
from app.schemas.consulta import ConsultaCreate, ConsultaResponse
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/consultas", tags=["consultas"])


@router.post("", response_model=ConsultaResponse, status_code=201)
def create_consulta(
    data: ConsultaCreate,
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
    
    consulta = Consulta(
        paciente_id=data.paciente_id,
        medico_id=personal.id,
        centro_id=data.centro_id,
        motivo_consulta=data.motivo_consulta,
        diagnostico_cie10=data.diagnostico_cie10,
        tratamiento=data.tratamiento,
        notas_privadas=data.notas_privadas,
    )
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    return consulta


@router.get("/{paciente_id}", response_model=List[ConsultaResponse])
def get_consultas(
    paciente_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    consultas = db.query(Consulta).filter(
        Consulta.paciente_id == paciente_id
    ).order_by(Consulta.fecha_consulta.desc()).all()
    return consultas
