import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.medication import Medication
from app.models.user import User
from app.schemas.consultation import MedicationCreate, MedicationUpdate, MedicationResponse
from app.routers.auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/medications", tags=["medications"])


@router.post("", response_model=MedicationResponse, status_code=201)
def create_medication(
    data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    med = Medication(**data.model_dump(), prescribed_by=current_user.id)
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.put("/{med_id}", response_model=MedicationResponse)
def update_medication(
    med_id: uuid.UUID,
    data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    med = db.query(Medication).filter(Medication.id == med_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(med, key, value)
    db.commit()
    db.refresh(med)
    return med
