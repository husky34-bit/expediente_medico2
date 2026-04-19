import uuid
from sqlalchemy import Column, String, Date, ForeignKey, text, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), unique=True, nullable=True)
    dni_pasaporte = Column(String(50), unique=True, nullable=False, index=True)
    nombre_completo = Column(String(255), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    genero_biologico = Column(String(20), nullable=False)
    tipo_sangre = Column(String(10), nullable=True)
    alergias = Column(Text, nullable=True)
    contacto_emergencia_nombre = Column(String(255), nullable=True)
    contacto_emergencia_tel = Column(String(50), nullable=True)
    qr_token = Column(String(255), unique=True, nullable=True)
