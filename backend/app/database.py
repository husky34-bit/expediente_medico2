import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Prioriza la URL de Docker, si no existe usa la de desarrollo local
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://mrbmz:mrbmz369@db:5432/expediente_clinico_db")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para los endpoints de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
