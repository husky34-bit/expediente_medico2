from sqlalchemy import Column, Integer, String, Text
from app.database import Base

class CentroMedico(Base):
    __tablename__ = "centros_medicos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    codigo_institucional = Column(String(50), unique=True, nullable=False, index=True)
    direccion = Column(Text, nullable=False)
