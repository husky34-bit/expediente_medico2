import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    mfa_secret = Column(String(255), nullable=True)
    intentos_fallidos = Column(Integer, server_default='0')
    estado = Column(String(20), server_default='Activo')
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
    nombre_completo = Column(String(255), nullable=True)
