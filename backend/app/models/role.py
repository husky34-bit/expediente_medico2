from sqlalchemy import Column, Integer, String, JSON
from app.database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), unique=True, nullable=False)
    permisos = Column(JSON, nullable=False, server_default='{}')
