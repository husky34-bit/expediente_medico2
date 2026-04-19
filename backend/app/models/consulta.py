import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class Consulta(Base):
    __tablename__ = "consultas"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    medico_id = Column(UUID(as_uuid=True), ForeignKey("personal_salud.id", ondelete="RESTRICT"), nullable=False)
    centro_id = Column(Integer, ForeignKey("centros_medicos.id", ondelete="RESTRICT"), nullable=False)
    motivo_consulta = Column(Text, nullable=False)
    diagnostico_cie10 = Column(String(100), nullable=False)
    tratamiento = Column(Text, nullable=True)
    notas_privadas = Column(Text, nullable=True)
    fecha_consulta = Column(DateTime(timezone=True), server_default=func.now())
