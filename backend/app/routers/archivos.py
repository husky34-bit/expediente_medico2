"""
Router para subida de archivos (laboratorios, radiografías, etc.)
Los archivos se guardan en /app/uploads dentro del contenedor.
"""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resultado_laboratorio import ResultadoLaboratorio
from app.models.usuario import Usuario
from app.models.personal_salud import PersonalSalud
from app.routers.auth import get_current_user

UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

router = APIRouter(prefix="/api/archivos", tags=["archivos"])


@router.post("/laboratorio", status_code=201)
async def subir_archivo_laboratorio(
    paciente_id: str = Form(...),
    nombre_prueba: str = Form(...),
    valor_resultado: str = Form(default="Ver archivo adjunto"),
    fecha_prueba: str = Form(...),
    laboratorio_nombre: str = Form(default=""),
    notas: str = Form(default=""),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Validar tipo
    if archivo.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo no permitido: {archivo.content_type}. Use PDF, JPG, PNG o WebP.",
        )

    # Validar tamaño (10 MB max)
    content = await archivo.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="El archivo supera el límite de 10 MB.")

    # Guardar con nombre único
    ext = os.path.splitext(archivo.filename)[1] or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    # Obtener personal_salud del usuario
    personal = db.query(PersonalSalud).filter(
        PersonalSalud.usuario_id == current_user.id
    ).first()
    if not personal:
        raise HTTPException(status_code=400, detail="Sin registro de personal de salud")

    # Crear registro en BD
    import datetime
    lab = ResultadoLaboratorio(
        paciente_id=uuid.UUID(paciente_id),
        solicitado_por=personal.id,
        nombre_prueba=nombre_prueba,
        valor_resultado=valor_resultado,
        fecha_prueba=datetime.date.fromisoformat(fecha_prueba),
        laboratorio_nombre=laboratorio_nombre or None,
        archivo_url=f"/api/archivos/{filename}",
        notas=notas or None,
    )
    db.add(lab)
    db.commit()
    db.refresh(lab)

    return {
        "id": str(lab.id),
        "archivo_url": lab.archivo_url,
        "nombre_prueba": lab.nombre_prueba,
        "fecha_prueba": str(lab.fecha_prueba),
    }


@router.get("/{filename}")
def descargar_archivo(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(filepath)


@router.delete("/laboratorio/{lab_id}", status_code=204)
def eliminar_laboratorio(
    lab_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    lab = db.query(ResultadoLaboratorio).filter(ResultadoLaboratorio.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    # Borrar archivo físico
    if lab.archivo_url:
        filename = lab.archivo_url.split("/")[-1]
        filepath = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(filepath):
            os.remove(filepath)

    db.delete(lab)
    db.commit()
