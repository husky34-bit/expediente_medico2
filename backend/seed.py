"""
Seed script for Expediente Clínico Universal
Run: docker compose exec backend python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import date, timedelta
import uuid
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.medication import Medication
from app.models.lab_result import LabResult
from app.models.allergy import Allergy
from app.core.security import get_password_hash


def seed():
    db: Session = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # ─── USERS ────────────────────────────────────────────────────
        admin = User(
            id=uuid.uuid4(),
            email="admin@hospital.bo",
            hashed_password=get_password_hash("Admin1234!"),
            full_name="Dr. Admin Sistema",
            role=UserRole.admin,
            institution="Hospital Central de Bolivia",
            is_active=True,
        )
        doctor1 = User(
            id=uuid.uuid4(),
            email="doctor1@clinica.bo",
            hashed_password=get_password_hash("Doctor1234!"),
            full_name="Dra. María González",
            role=UserRole.doctor,
            institution="Clínica Los Andes",
            is_active=True,
        )
        doctor2 = User(
            id=uuid.uuid4(),
            email="doctor2@clinica.bo",
            hashed_password=get_password_hash("Doctor1234!"),
            full_name="Dr. Carlos Mendoza",
            role=UserRole.doctor,
            institution="Hospital San Juan de Dios",
            is_active=True,
        )
        db.add_all([admin, doctor1, doctor2])
        db.flush()

        # ─── PATIENTS ─────────────────────────────────────────────────
        patients_data = [
            {
                "full_name": "Ana Sofia Reyes Vargas",
                "date_of_birth": date(1985, 3, 15),
                "gender": "female",
                "blood_type": "O+",
                "national_id": "7654321",
                "phone": "+591 70012345",
                "address": "Av. Busch 234, Cochabamba",
                "emergency_contact_name": "Roberto Reyes",
                "emergency_contact_phone": "+591 70098765",
            },
            {
                "full_name": "Miguel Angel Torres Paz",
                "date_of_birth": date(1972, 7, 22),
                "gender": "male",
                "blood_type": "A+",
                "national_id": "4521678",
                "phone": "+591 67234567",
                "address": "Calle Potosi 890, La Paz",
                "emergency_contact_name": "Carmen Torres",
                "emergency_contact_phone": "+591 67345678",
            },
            {
                "full_name": "Valentina Cruz Jimenez",
                "date_of_birth": date(1998, 11, 8),
                "gender": "female",
                "blood_type": "B-",
                "national_id": "9876543",
                "phone": "+591 76543210",
                "address": "Zona Norte, Santa Cruz",
                "emergency_contact_name": "Luis Cruz",
                "emergency_contact_phone": "+591 76654321",
            },
            {
                "full_name": "Jorge Luis Mamani Quispe",
                "date_of_birth": date(1960, 4, 30),
                "gender": "male",
                "blood_type": "AB+",
                "national_id": "1234567",
                "phone": "+591 71112233",
                "address": "Barrio San Pedro, El Alto",
                "emergency_contact_name": "Rosa Mamani",
                "emergency_contact_phone": "+591 71223344",
            },
            {
                "full_name": "Camila Beatriz Flores Sandoval",
                "date_of_birth": date(2001, 9, 12),
                "gender": "female",
                "blood_type": "A-",
                "national_id": "5551234",
                "phone": "+591 72223344",
                "address": "Av. America, Sucre",
                "emergency_contact_name": "Patricia Flores",
                "emergency_contact_phone": "+591 72334455",
            },
        ]

        patients = []
        for pd in patients_data:
            p = Patient(**pd, qr_token=uuid.uuid4())
            db.add(p)
            patients.append(p)
        db.flush()

        # ─── CONSULTATIONS ─────────────────────────────────────────────
        consultations_data = [
            # Patient 0 - Ana
            (patients[0], doctor1, date(2024, 1, 10), "Dolor de cabeza intenso", "Migraña crónica", "G43.0", "Clínica Los Andes", "Paciente refiere episodios frecuentes. Se prescribe tratamiento preventivo."),
            (patients[0], doctor2, date(2024, 3, 5), "Control rutinario", "Hipertensión arterial leve", "I10", "Hospital San Juan", "PA 140/90. Se ajusta medicación."),
            (patients[0], doctor1, date(2024, 6, 20), "Revisión anual", "Paciente estable, sin complicaciones", "Z00.0", "Clínica Los Andes", "Todos los parámetros dentro de rango normal."),
            # Patient 1 - Miguel
            (patients[1], doctor2, date(2024, 2, 14), "Dolor torácico al esfuerzo", "Angina estable", "I20.9", "Hospital San Juan", "ECG sin cambios. Prueba de esfuerzo programada."),
            (patients[1], doctor1, date(2024, 4, 28), "Seguimiento cardíaco", "Cardiopatía isquémica controlada", "I25.1", "Clínica Los Andes", "Respuesta favorable al tratamiento."),
            # Patient 2 - Valentina
            (patients[2], doctor1, date(2024, 5, 3), "Erupciones cutáneas", "Dermatitis atópica", "L20.9", "Clínica Los Andes", "Reacción alérgica severa. Antihistamínicos prescritos."),
            (patients[2], doctor1, date(2024, 7, 15), "Control dermatológico", "Dermatitis atópica en remisión", "L20.9", "Clínica Los Andes", "Mejora significativa con tratamiento."),
            # Patient 3 - Jorge
            (patients[3], doctor2, date(2024, 1, 22), "Niveles altos de glucosa", "Diabetes mellitus tipo 2", "E11.9", "Hospital San Juan", "HbA1c 8.2%. Se inicia insulinoterapia."),
            (patients[3], doctor2, date(2024, 3, 18), "Control diabético", "DM2 descompensada", "E11.65", "Hospital San Juan", "Ajuste de dosis de insulina necesario."),
            (patients[3], admin, date(2024, 6, 5), "Pie diabético incipiente", "Úlcera plantar grado 1", "E11.621", "Hospital Central", "Curación diaria, antibióticos sistémicos."),
            # Patient 4 - Camila
            (patients[4], doctor1, date(2024, 8, 10), "Dolor lumbar", "Lumbalgia mecánica", "M54.5", "Clínica Los Andes", "Fisioterapia recomendada, AINES."),
        ]

        for p, doc, dt, complaint, diag, code, inst, notes in consultations_data:
            c = Consultation(
                patient_id=p.id,
                doctor_id=doc.id,
                date=dt,
                institution=inst,
                chief_complaint=complaint,
                diagnosis=diag,
                diagnosis_code=code,
                notes=notes,
            )
            db.add(c)

        # ─── MEDICATIONS ───────────────────────────────────────────────
        meds_data = [
            (patients[0], admin, "Propranolol", "40mg", "1 vez al día", date(2024, 1, 10), None, True, "Profilaxis migraña"),
            (patients[0], doctor2, "Amlodipino", "5mg", "1 vez al día", date(2024, 3, 5), None, True, "Hipertensión"),
            (patients[1], doctor2, "Ácido Acetilsalicílico", "100mg", "1 vez al día", date(2024, 2, 14), None, True, "Antiagregante plaquetario"),
            (patients[1], doctor2, "Atorvastatina", "20mg", "1 vez al día en noche", date(2024, 2, 14), None, True, "Control colesterol"),
            (patients[1], doctor1, "Metoprolol", "25mg", "2 veces al día", date(2024, 4, 28), None, True, "Cardioprotector"),
            (patients[2], doctor1, "Loratadina", "10mg", "1 vez al día", date(2024, 5, 3), date(2024, 6, 3), False, "Antihistamínico"),
            (patients[2], doctor1, "Betametasona crema", "0.05%", "2 veces al día sobre área afectada", date(2024, 5, 3), None, True, "Dermatitis"),
            (patients[3], doctor2, "Insulina Glargina", "20 UI", "1 vez al día nocturna", date(2024, 1, 22), None, True, "DM2"),
            (patients[3], doctor2, "Metformina", "850mg", "2 veces al día con alimentos", date(2024, 1, 22), None, True, "DM2"),
            (patients[3], admin, "Amoxicilina + Ácido Clavulánico", "875/125mg", "3 veces al día", date(2024, 6, 5), date(2024, 6, 15), False, "Infección pie diabético"),
            (patients[4], doctor1, "Ibuprofeno", "400mg", "3 veces al día con alimentos", date(2024, 8, 10), date(2024, 8, 25), False, "Lumbalgia"),
        ]

        for p, doc, name, dose, freq, start, end, active, notes in meds_data:
            m = Medication(
                patient_id=p.id,
                prescribed_by=doc.id,
                name=name,
                dose=dose,
                frequency=freq,
                start_date=start,
                end_date=end,
                is_active=active,
                notes=notes,
            )
            db.add(m)

        # ─── LAB RESULTS ───────────────────────────────────────────────
        labs_data = [
            (patients[0], doctor2, "Hemograma completo", "Normal", "", "Ver rango normal", date(2024, 3, 5), "Lab Central"),
            (patients[0], doctor2, "Presión arterial", "138/88", "mmHg", "120/80", date(2024, 3, 5), "Clínica Los Andes"),
            (patients[1], doctor2, "Colesterol total", "245", "mg/dL", "<200", date(2024, 2, 14), "BioLab SCZ"),
            (patients[1], doctor2, "LDL", "162", "mg/dL", "<130", date(2024, 2, 14), "BioLab SCZ"),
            (patients[1], doctor2, "Troponina I", "0.02", "ng/mL", "<0.04", date(2024, 2, 14), "BioLab SCZ"),
            (patients[3], doctor2, "Glucosa en ayunas", "185", "mg/dL", "70-100", date(2024, 1, 22), "Lab Universitario"),
            (patients[3], doctor2, "HbA1c", "8.2", "%", "<7.0", date(2024, 1, 22), "Lab Universitario"),
            (patients[3], doctor2, "Creatinina", "1.1", "mg/dL", "0.7-1.2", date(2024, 3, 18), "Lab Universitario"),
            (patients[4], doctor1, "Rayos X columnar lumbar", "Hernia L4-L5 leve", "", "Sin compresión radicular", date(2024, 8, 10), "Radiología Central"),
        ]

        for p, doc, test, val, unit, ref, dt, lab in labs_data:
            l = LabResult(
                patient_id=p.id,
                requested_by=doc.id,
                test_name=test,
                result_value=val,
                unit=unit,
                reference_range=ref,
                date=dt,
                lab_name=lab,
            )
            db.add(l)

        # ─── ALLERGIES ─────────────────────────────────────────────────
        allergies_data = [
            (patients[0], "Penicilina", "Urticaria generalizada", "severe", date(2018, 5, 10), "Confirmado en prueba cutanea"),
            (patients[1], "Contraste yodado", "Anafilaxia", "anaphylactic", date(2020, 8, 3), "Requirio adrenalina. Contraindicado contraste yodado IV"),
            (patients[2], "Mariscos", "Angioedema facial", "severe", date(2023, 12, 1), "Evitar completamente"),
            (patients[2], "Polen gramineas", "Rinitis alergica", "mild", date(2022, 4, 15), "Estacional"),
            (patients[3], "Sulfamidas", "Erupcion cutanea", "moderate", date(2015, 3, 20), ""),
            (patients[4], "AINES", "Gastritis aguda", "mild", date(2023, 6, 10), "Tomar con protector gastrico"),
        ]

        for p, allergen, reaction, severity, confirmed, notes in allergies_data:
            a = Allergy(
                patient_id=p.id,
                allergen=allergen,
                reaction_type=reaction,
                severity=severity,
                confirmed_date=confirmed,
                notes=notes,
            )
            db.add(a)

        db.commit()
        print("[OK] Database seeded successfully!")
        print("\nCredentials:")
        print("  Admin:    admin@hospital.bo / Admin1234!")
        print("  Doctor 1: doctor1@clinica.bo / Doctor1234!")
        print("  Doctor 2: doctor2@clinica.bo / Doctor1234!")
        print(f"\n{len(patients)} patients created with full medical records.")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
