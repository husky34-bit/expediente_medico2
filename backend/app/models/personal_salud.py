import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class PersonalSalud(Base):
    __tablename__ = "personal_salud"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), unique=True, nullable=False)
    centro_id = Column(Integer, ForeignKey("centros_medicos.id", ondelete="RESTRICT"), nullable=False)
    matricula_profesional = Column(String(100), unique=True, nullable=False, index=True)
    especialidad = Column(String(100), nullable=False)
