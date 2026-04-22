from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, EmailStr
from uuid import UUID

class RoleBase(BaseModel):
    nombre_rol: str
    permisos: Dict[str, Any] = {}

class RoleResponse(RoleBase):
    id: int

    class Config:
        from_attributes = True

class CentroMedicoBase(BaseModel):
    nombre: str
    codigo_institucional: str
    direccion: str

class CentroMedicoResponse(CentroMedicoBase):
    id: int

    class Config:
        from_attributes = True

class UsuarioBase(BaseModel):
    email: EmailStr
    role_id: int
    estado: str = "Activo"
    nombre_completo: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    estado: Optional[str] = None
    role_id: Optional[int] = None

class UsuarioResponse(UsuarioBase):
    id: UUID
    creado_en: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UsuarioResponse] = None

class TokenData(BaseModel):
    user_id: Optional[str] = None
