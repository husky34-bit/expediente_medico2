from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lab_result import LabResult
from app.models.allergy import Allergy
from app.models.user import User
from app.schemas.consultation import LabResultCreate, LabResultResponse, AllergyCreate, AllergyResponse
from app.routers.auth import get_current_user

labs_router = APIRouter(prefix="/api/labs", tags=["labs"])
allergies_router = APIRouter(prefix="/api/allergies", tags=["allergies"])


@labs_router.post("", response_model=LabResultResponse, status_code=201)
def create_lab(
    data: LabResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lab = LabResult(**data.model_dump(), requested_by=current_user.id)
    db.add(lab)
    db.commit()
    db.refresh(lab)
    return lab


@allergies_router.post("", response_model=AllergyResponse, status_code=201)
def create_allergy(
    data: AllergyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allergy = Allergy(**data.model_dump())
    db.add(allergy)
    db.commit()
    db.refresh(allergy)
    return allergy
