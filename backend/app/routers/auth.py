from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import Token, UsuarioResponse
from app.core.security import verify_password, create_access_token, decode_token, get_password_hash
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    nombre_completo: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

router = APIRouter(prefix="/api/auth", tags=["auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(Usuario).filter(Usuario.id == user_id, Usuario.estado == "Activo").first()
    if user is None:
        raise credentials_exception
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.estado != "Activo":
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UsuarioResponse)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UsuarioResponse)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    current_user.nombre_completo = data.nombre_completo
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password", response_model=UsuarioResponse)
def update_password(data: PasswordUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    
    current_user.password_hash = get_password_hash(data.new_password)
    db.commit()
    db.refresh(current_user)
    return current_user
