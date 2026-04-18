import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.consultation import Consultation
from app.models.user import User
from app.schemas.consultation import ConsultationCreate, ConsultationResponse
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/consultations", tags=["consultations"])


@router.post("", response_model=ConsultationResponse, status_code=201)
def create_consultation(
    data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    consultation = Consultation(**data.model_dump(), doctor_id=current_user.id)
    db.add(consultation)
    db.commit()
    db.refresh(consultation)
    return consultation


@router.get("/{patient_id}", response_model=List[ConsultationResponse])
def get_consultations(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    consultations = db.query(Consultation).filter(
        Consultation.patient_id == patient_id
    ).order_by(Consultation.date.desc()).all()
    return consultations
