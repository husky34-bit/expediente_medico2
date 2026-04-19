from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID

class ConsultaBase(BaseModel):
    paciente_id: UUID
    medico_id: UUID
    centro_id: int
    motivo_consulta: str
    diagnostico_cie10: str
    tratamiento: Optional[str] = None
    notas_privadas: Optional[str] = None

class ConsultaCreate(ConsultaBase):
    pass

class ConsultaResponse(ConsultaBase):
    id: UUID
    fecha_consulta: datetime

    class Config:
        from_attributes = True

class MedicamentoBase(BaseModel):
    paciente_id: UUID
    prescrito_por: UUID
    nombre_medicamento: str
    dosis: str
    frecuencia: str
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    esta_activo: bool = True
    notas: Optional[str] = None

class MedicamentoCreate(MedicamentoBase):
    pass

class MedicamentoUpdate(BaseModel):
    esta_activo: Optional[bool] = None
    fecha_fin: Optional[date] = None
    notas: Optional[str] = None

class MedicamentoResponse(MedicamentoBase):
    id: UUID
    creado_en: datetime

    class Config:
        from_attributes = True

class ResultadoLaboratorioBase(BaseModel):
    paciente_id: UUID
    solicitado_por: UUID
    nombre_prueba: str
    valor_resultado: str
    unidad: Optional[str] = None
    rango_referencia: Optional[str] = None
    fecha_prueba: date
    laboratorio_nombre: Optional[str] = None
    archivo_url: Optional[str] = None
    notas: Optional[str] = None

class ResultadoLaboratorioCreate(ResultadoLaboratorioBase):
    pass

class ResultadoLaboratorioResponse(ResultadoLaboratorioBase):
    id: UUID
    creado_en: datetime

    class Config:
        from_attributes = True
