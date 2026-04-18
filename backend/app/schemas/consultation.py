from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID


class ConsultationBase(BaseModel):
    patient_id: UUID
    date: date
    institution: Optional[str] = None
    chief_complaint: str
    diagnosis: str
    diagnosis_code: Optional[str] = None
    notes: Optional[str] = None


class ConsultationCreate(ConsultationBase):
    pass


class ConsultationResponse(ConsultationBase):
    id: UUID
    doctor_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class MedicationBase(BaseModel):
    patient_id: UUID
    name: str
    dose: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True
    notes: Optional[str] = None


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(BaseModel):
    is_active: Optional[bool] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class MedicationResponse(MedicationBase):
    id: UUID
    prescribed_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class LabResultBase(BaseModel):
    patient_id: UUID
    test_name: str
    result_value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    date: date
    lab_name: Optional[str] = None
    file_url: Optional[str] = None
    notes: Optional[str] = None


class LabResultCreate(LabResultBase):
    pass


class LabResultResponse(LabResultBase):
    id: UUID
    requested_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class AllergyBase(BaseModel):
    patient_id: UUID
    allergen: str
    reaction_type: Optional[str] = None
    severity: str
    confirmed_date: Optional[date] = None
    notes: Optional[str] = None


class AllergyCreate(AllergyBase):
    pass


class AllergyResponse(AllergyBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
