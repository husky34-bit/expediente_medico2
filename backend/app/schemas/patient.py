from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from app.models.patient import BloodType, Gender


class PatientBase(BaseModel):
    full_name: str
    date_of_birth: date
    gender: Gender
    blood_type: Optional[BloodType] = None
    national_id: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[BloodType] = None


class PatientResponse(PatientBase):
    id: UUID
    qr_token: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientListItem(BaseModel):
    id: UUID
    full_name: str
    date_of_birth: date
    gender: Gender
    blood_type: Optional[BloodType] = None
    national_id: Optional[str] = None
    phone: Optional[str] = None
    qr_token: UUID
    created_at: datetime

    class Config:
        from_attributes = True
