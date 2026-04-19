import uuid
from sqlalchemy import Column, String, Date, DateTime, Boolean, Text, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class Medicamento(Base):
    __tablename__ = "medicamentos"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    prescrito_por = Column(UUID(as_uuid=True), ForeignKey("personal_salud.id", ondelete="RESTRICT"), nullable=False)
    nombre_medicamento = Column(String(255), nullable=False)
    dosis = Column(String(100), nullable=False)
    frecuencia = Column(String(100), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    esta_activo = Column(Boolean, server_default='true')
    notas = Column(Text, nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
