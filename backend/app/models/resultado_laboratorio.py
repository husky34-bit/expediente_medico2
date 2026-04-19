import uuid
from sqlalchemy import Column, String, Date, DateTime, Text, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base

class ResultadoLaboratorio(Base):
    __tablename__ = "resultados_laboratorio"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    paciente_id = Column(UUID(as_uuid=True), ForeignKey("pacientes.id", ondelete="CASCADE"), nullable=False)
    solicitado_por = Column(UUID(as_uuid=True), ForeignKey("personal_salud.id", ondelete="RESTRICT"), nullable=False)
    nombre_prueba = Column(String(255), nullable=False)
    valor_resultado = Column(String(255), nullable=False)
    unidad = Column(String(50), nullable=True)
    rango_referencia = Column(String(100), nullable=True)
    fecha_prueba = Column(Date, nullable=False)
    laboratorio_nombre = Column(String(255), nullable=True)
    archivo_url = Column(String(255), nullable=True)
    notas = Column(Text, nullable=True)
    creado_en = Column(DateTime(timezone=True), server_default=func.now())
