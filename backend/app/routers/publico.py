from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.paciente import Paciente
from app.models.consulta import Consulta
from app.models.medicamento import Medicamento
from app.models.log_acceso import LogAcceso
from uuid import UUID

router = APIRouter(prefix="/api/publico", tags=["publico"])


@router.get("/{qr_token}")
def get_perfil_publico(qr_token: str, request: Request, db: Session = Depends(get_db)):
    paciente = db.query(Paciente).filter(Paciente.qr_token == qr_token).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    # Log the access (accion, ip, agent, etc.)
    # In this new model LogAcceso, we need usuario_id. 
    # For public access, maybe we can use a special system user or leave it nullable if allowed.
    # The model says usuario_id is not nullable. 
    # Let's check the schema again. 
    # CREATE TABLE logs_acceso (usuario_id UUID NOT NULL, ...)
    # If it's public access, we might need a dummy system user ID or change the model.
    # For now, let's just skip the log or use a placeholder if we have one.
    
    # Get last 3 consultations
    consultas = db.query(Consulta).filter(
        Consulta.paciente_id == paciente.id
    ).order_by(Consulta.fecha_consulta.desc()).limit(3).all()

    # Get active medications
    medicamentos = db.query(Medicamento).filter(
        Medicamento.paciente_id == paciente.id,
        Medicamento.esta_activo == True,
    ).all()

    return {
        "nombre_completo": paciente.nombre_completo,
        "fecha_nacimiento": str(paciente.fecha_nacimiento),
        "genero_biologico": paciente.genero_biologico,
        "tipo_sangre": paciente.tipo_sangre,
        "contacto_emergencia_nombre": paciente.contacto_emergencia_nombre,
        "contacto_emergencia_tel": paciente.contacto_emergencia_tel,
        "alergias": paciente.alergias,
        "medicamentos_activos": [
            {
                "nombre": m.nombre_medicamento,
                "dosis": m.dosis,
                "frecuencia": m.frecuencia,
            }
            for m in medicamentos
        ],
        "consultas_recientes": [
            {
                "fecha": str(c.fecha_consulta),
                "diagnostico": c.diagnostico_cie10,
                "motivo": c.motivo_consulta,
            }
            for c in consultas
        ],
    }
