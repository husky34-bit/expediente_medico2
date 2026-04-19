"""
Seed script for Expediente Clínico Universal (v2.0 - Español)
Run: docker compose exec backend python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import date, datetime
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.role import Role
from app.models.usuario import Usuario
from app.models.centro_medico import CentroMedico
from app.models.personal_salud import PersonalSalud
from app.models.paciente import Paciente
from app.models.consulta import Consulta
from app.models.medicamento import Medicamento
from app.models.resultado_laboratorio import ResultadoLaboratorio
from app.core.security import get_password_hash


def seed(force=False):
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if not force and db.query(Role).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # Limpiar datos existentes si se fuerza
        if force:
            db.query(Consulta).delete()
            db.query(Medicamento).delete()
            db.query(ResultadoLaboratorio).delete()
            db.query(PersonalSalud).delete()
            db.query(Usuario).delete()
            db.query(CentroMedico).delete()
            db.query(Role).delete()
            db.query(Paciente).delete()
            db.flush()

        # ─── ROLES ────────────────────────────────────────────────────
        admin_role = Role(nombre_rol="admin", permisos={"all": True})
        doctor_role = Role(nombre_rol="doctor", permisos={"read": True, "write": True})
        db.add_all([admin_role, doctor_role])
        db.flush()

        # ─── CENTROS MÉDICOS ──────────────────────────────────────────
        centro1 = CentroMedico(
            nombre="Hospital Central de Bolivia",
            codigo_institucional="HCB-001",
            direccion="Av. Villazón, La Paz"
        )
        centro2 = CentroMedico(
            nombre="Clínica Los Andes",
            codigo_institucional="CLA-002",
            direccion="Av. Busch, Cochabamba"
        )
        db.add_all([centro1, centro2])
        db.flush()

        # ─── USUARIOS ─────────────────────────────────────────────────
        user_admin = Usuario(
            email="admin@hospital.bo",
            password_hash=get_password_hash("Admin1234!"),
            role_id=admin_role.id,
            estado="Activo"
        )
        user_doctor1 = Usuario(
            email="doctor1@clinica.bo",
            password_hash=get_password_hash("Doctor1234!"),
            role_id=doctor_role.id,
            estado="Activo"
        )
        db.add_all([user_admin, user_doctor1])
        db.flush()

        # ─── PERSONAL SALUD ──────────────────────────────────────────
        doc1 = PersonalSalud(
            usuario_id=user_admin.id,
            centro_id=centro1.id,
            matricula_profesional="MS-12345",
            especialidad="Administración Médica"
        )
        doc2 = PersonalSalud(
            usuario_id=user_doctor1.id,
            centro_id=centro2.id,
            matricula_profesional="MS-67890",
            especialidad="Medicina General"
        )
        db.add_all([doc1, doc2])
        db.flush()

        # ─── PACIENTES ───────────────────────────────────────────────
        p1 = Paciente(
            dni_pasaporte="7654321",
            nombre_completo="Ana Sofia Reyes Vargas",
            fecha_nacimiento=date(1985, 3, 15),
            genero_biologico="Femenino",
            tipo_sangre="O+",
            alergias="Penicilina: Urticaria severa",
            contacto_emergencia_nombre="Roberto Reyes",
            contacto_emergencia_tel="+591 70098765",
            qr_token="token_ana_sofia"
        )
        p2 = Paciente(
            dni_pasaporte="4521678",
            nombre_completo="Miguel Angel Torres Paz",
            fecha_nacimiento=date(1972, 7, 22),
            genero_biologico="Masculino",
            tipo_sangre="A+",
            alergias="Contraste yodado: Anafilaxia",
            contacto_emergencia_nombre="Carmen Torres",
            contacto_emergencia_tel="+591 67345678",
            qr_token="token_miguel_angel"
        )
        db.add_all([p1, p2])
        db.flush()

        # ─── CONSULTAS ───────────────────────────────────────────────
        c1 = Consulta(
            paciente_id=p1.id,
            medico_id=doc2.id,
            centro_id=centro2.id,
            motivo_consulta="Dolor de cabeza intenso",
            diagnostico_cie10="G43.0",
            tratamiento="Reposo y analgésicos",
            notas_privadas="Posible migraña tensional"
        )
        db.add(c1)

        # ─── MEDICAMENTOS ────────────────────────────────────────────
        m1 = Medicamento(
            paciente_id=p1.id,
            prescrito_por=doc2.id,
            nombre_medicamento="Ibuprofeno",
            dosis="400mg",
            frecuencia="Cada 8 horas",
            fecha_inicio=date.today(),
            esta_activo=True
        )
        db.add(m1)

        # ─── LABORATORIOS ────────────────────────────────────────────
        l1 = ResultadoLaboratorio(
            paciente_id=p1.id,
            solicitado_por=doc2.id,
            nombre_prueba="Hemograma Completo",
            valor_resultado="Normal",
            fecha_prueba=date.today()
        )
        db.add(l1)

        db.commit()
        print("[OK] Base de datos poblada exitosamente!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al poblar la base de datos: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    seed(force=args.force)
