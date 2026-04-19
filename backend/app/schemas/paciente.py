from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID

class PacienteBase(BaseModel):
    dni_pasaporte: str
    nombre_completo: str
    fecha_nacimiento: date
    genero_biologico: str
    tipo_sangre: Optional[str] = None
    alergias: Optional[str] = None
    contacto_emergencia_nombre: Optional[str] = None
    contacto_emergencia_tel: Optional[str] = None
    usuario_id: Optional[UUID] = None
    qr_token: Optional[str] = None

class PacienteCreate(PacienteBase):
    pass

class PacienteUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    genero_biologico: Optional[str] = None
    tipo_sangre: Optional[str] = None
    alergias: Optional[str] = None
    contacto_emergencia_nombre: Optional[str] = None
    contacto_emergencia_tel: Optional[str] = None

class PacienteResponse(PacienteBase):
    id: UUID

    class Config:
        from_attributes = True

class PacienteListItem(BaseModel):
    id: UUID
    nombre_completo: str
    dni_pasaporte: str
    fecha_nacimiento: date
    genero_biologico: str
    tipo_sangre: Optional[str] = None

    class Config:
        from_attributes = True
