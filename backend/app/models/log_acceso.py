import uuid
from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey, text, Text
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.sql import func
from app.database import Base

class LogAcceso(Base):
    __tablename__ = "logs_acceso"

    id = Column(BigInteger, primary_key=True, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="NO ACTION"), nullable=False)
    accion = Column(String(255), nullable=False)
    paciente_afectado_id = Column(UUID(as_uuid=True), ForeignKey("pacientes.id", ondelete="NO ACTION"), nullable=True)
    fecha_hora = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
