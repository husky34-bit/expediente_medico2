import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.paciente import Paciente
from app.models.usuario import Usuario
from app.schemas.paciente import PacienteCreate, PacienteUpdate, PacienteResponse, PacienteListItem
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/pacientes", tags=["pacientes"])


@router.get("", response_model=dict)
def list_pacientes(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    query = db.query(Paciente)
    if search:
        query = query.filter(
            Paciente.nombre_completo.ilike(f"%{search}%") |
            Paciente.dni_pasaporte.ilike(f"%{search}%")
        )
    total = query.count()
    pacientes = query.order_by(Paciente.nombre_completo).offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pacientes": [PacienteListItem.model_validate(p) for p in pacientes],
    }


@router.post("", response_model=PacienteResponse, status_code=201)
def create_paciente(
    data: PacienteCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    paciente = Paciente(**data.model_dump())
    db.add(paciente)
    db.commit()
    db.refresh(paciente)
    return paciente


@router.get("/{paciente_id}", response_model=dict)
def get_paciente(
    paciente_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    from app.models.consulta import Consulta
    from app.models.medicamento import Medicamento
    from app.models.resultado_laboratorio import ResultadoLaboratorio

    consultas = db.query(Consulta).filter(
        Consulta.paciente_id == paciente_id
    ).order_by(Consulta.fecha_consulta.desc()).all()

    medicamentos = db.query(Medicamento).filter(
        Medicamento.paciente_id == paciente_id
    ).order_by(Medicamento.fecha_inicio.desc()).all()

    laboratorios = db.query(ResultadoLaboratorio).filter(
        ResultadoLaboratorio.paciente_id == paciente_id
    ).order_by(ResultadoLaboratorio.fecha_prueba.desc()).all()

    from app.schemas.paciente import PacienteResponse
    from app.schemas.consulta import ConsultaResponse, MedicamentoResponse, ResultadoLaboratorioResponse

    return {
        "paciente": PacienteResponse.model_validate(paciente),
        "consultas": [ConsultaResponse.model_validate(c) for c in consultas],
        "medicamentos": [MedicamentoResponse.model_validate(m) for m in medicamentos],
        "laboratorios": [ResultadoLaboratorioResponse.model_validate(l) for l in laboratorios],
    }


@router.put("/{paciente_id}", response_model=PacienteResponse)
def update_paciente(
    paciente_id: uuid.UUID,
    data: PacienteUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    paciente = db.query(Paciente).filter(Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(paciente, key, value)
    
    db.commit()
    db.refresh(paciente)
    return paciente
