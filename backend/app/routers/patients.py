import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient
from app.models.user import User
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse, PatientListItem
from app.routers.auth import get_current_user
from app.core.qr_generator import generate_qr_image
from app.config import settings

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=dict)
def list_patients(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Patient)
    if search:
        query = query.filter(
            Patient.full_name.ilike(f"%{search}%") |
            Patient.national_id.ilike(f"%{search}%")
        )
    total = query.count()
    patients = query.order_by(Patient.full_name).offset((page - 1) * limit).limit(limit).all()
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "patients": [PatientListItem.model_validate(p) for p in patients],
    }


@router.post("", response_model=PatientResponse, status_code=201)
def create_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = Patient(**data.model_dump(), qr_token=uuid.uuid4())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}", response_model=dict)
def get_patient(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    from app.models.consultation import Consultation
    from app.models.medication import Medication
    from app.models.lab_result import LabResult
    from app.models.allergy import Allergy

    consultations = db.query(Consultation).filter(
        Consultation.patient_id == patient_id
    ).order_by(Consultation.date.desc()).all()

    medications = db.query(Medication).filter(
        Medication.patient_id == patient_id
    ).order_by(Medication.start_date.desc()).all()

    labs = db.query(LabResult).filter(
        LabResult.patient_id == patient_id
    ).order_by(LabResult.date.desc()).all()

    allergies = db.query(Allergy).filter(
        Allergy.patient_id == patient_id
    ).all()

    from app.schemas.patient import PatientResponse
    from app.schemas.consultation import ConsultationResponse, MedicationResponse, LabResultResponse, AllergyResponse

    return {
        "patient": PatientResponse.model_validate(patient),
        "consultations": [ConsultationResponse.model_validate(c) for c in consultations],
        "medications": [MedicationResponse.model_validate(m) for m in medications],
        "labs": [LabResultResponse.model_validate(l) for l in labs],
        "allergies": [AllergyResponse.model_validate(a) for a in allergies],
    }


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: uuid.UUID,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/{patient_id}/qr")
def get_patient_qr(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    qr_url = f"{settings.frontend_url}/public/{patient.qr_token}"
    image_bytes = generate_qr_image(qr_url)
    return Response(content=image_bytes, media_type="image/png")


@router.post("/{patient_id}/qr-token", response_model=PatientResponse)
def regenerate_qr_token(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient.qr_token = uuid.uuid4()
    db.commit()
    db.refresh(patient)
    return patient
