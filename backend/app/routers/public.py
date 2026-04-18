from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.medication import Medication
from app.models.allergy import Allergy
from app.models.access_log import AccessLog, AccessType

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/{qr_token}")
def get_public_profile(qr_token: str, request: Request, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.qr_token == qr_token).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Log the access
    log = AccessLog(
        patient_id=patient.id,
        access_type=AccessType.qr_scan,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
    db.add(log)
    db.commit()

    # Get last 3 consultations
    consultations = db.query(Consultation).filter(
        Consultation.patient_id == patient.id
    ).order_by(Consultation.date.desc()).limit(3).all()

    # Get active medications
    medications = db.query(Medication).filter(
        Medication.patient_id == patient.id,
        Medication.is_active == True,
    ).all()

    # Get all allergies
    allergies = db.query(Allergy).filter(Allergy.patient_id == patient.id).all()

    return {
        "full_name": patient.full_name,
        "date_of_birth": str(patient.date_of_birth),
        "gender": patient.gender,
        "blood_type": patient.blood_type,
        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "allergies": [
            {
                "allergen": a.allergen,
                "severity": a.severity,
                "reaction_type": a.reaction_type,
            }
            for a in allergies
        ],
        "active_medications": [
            {
                "name": m.name,
                "dose": m.dose,
                "frequency": m.frequency,
            }
            for m in medications
        ],
        "recent_consultations": [
            {
                "date": str(c.date),
                "diagnosis": c.diagnosis,
                "chief_complaint": c.chief_complaint,
                "institution": c.institution,
            }
            for c in consultations
        ],
    }
