# 🏥 Expediente Clínico Universal

Sistema de historial médico en la nube accesible mediante código QR. Permite a cualquier médico consultar el expediente completo de un paciente escaneando un código QR único.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS v3 |
| Backend | FastAPI (Python 3.11) + SQLAlchemy |
| Base de datos | PostgreSQL 15 |
| Auth | JWT (python-jose) |
| QR | qrcode (backend) + react-qr-code (frontend) |
| Contenedores | Docker + Docker Compose |

## 🚀 Inicio Rápido

### 1. Configurar variables de entorno

```bash
copy .env.example .env
```

> Edita `.env` si necesitas cambiar contraseñas o puertos.

### 2. Levantar todo el stack

```bash
docker compose up --build
```

### 3. Aplicar migraciones y cargar datos de prueba

En otra terminal (mientras el stack corre):

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python seed.py
```

### 4. Acceder a la aplicación

| Servicio | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **API Docs** | http://localhost:8000/docs |
| **API ReDoc** | http://localhost:8000/redoc |

## 🔑 Credenciales de Demo

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Admin | admin@hospital.bo | Admin1234! | admin |
| Doctora González | doctor1@clinica.bo | Doctor1234! | doctor |
| Dr. Mendoza | doctor2@clinica.bo | Doctor1234! | doctor |

## 📱 Flujo QR

1. Inicia sesión → Dashboard → Selecciona un paciente
2. En el panel derecho del expediente, verás el **código QR**
3. Descárgalo o escanéalo con cualquier smartphone
4. El QR lleva a `/public/{token}` — **sin necesidad de login**
5. Se muestra: tipo de sangre, alergias críticas, medicación activa, últimas 3 consultas

## 📋 Endpoints API

### Auth
- `POST /api/auth/login` — Login con email/password
- `GET /api/auth/me` — Usuario actual

### Pacientes (requiere JWT)
- `GET /api/patients?search=&page=&limit=` — Lista paginada
- `POST /api/patients` — Crear paciente
- `GET /api/patients/{id}` — Expediente completo
- `PUT /api/patients/{id}` — Actualizar datos
- `GET /api/patients/{id}/qr` — Imagen PNG del QR
- `POST /api/patients/{id}/qr-token` — Regenerar token QR

### Historial
- `POST /api/consultations` — Nueva consulta
- `GET /api/consultations/{patient_id}` — Historial
- `POST /api/medications` — Prescribir medicamento
- `PUT /api/medications/{id}` — Actualizar/discontinuar
- `POST /api/labs` — Agregar resultado de lab
- `POST /api/allergies` — Registrar alergia

### Público (sin auth)
- `GET /api/public/{qr_token}` — Perfil resumido del paciente

## 🗂️ Estructura del Proyecto

```
expediente-universal/
├── docker-compose.yml
├── .env.example
├── frontend/          # React + Vite + TailwindCSS
│   └── src/
│       ├── pages/     # Login, Dashboard, PatientProfile, PublicQR, ...
│       └── components/ # Layout, QRDisplay, AlertBadge, TimelineEntry, ...
└── backend/           # FastAPI + SQLAlchemy
    ├── app/
    │   ├── models/    # User, Patient, Consultation, Medication, ...
    │   ├── routers/   # auth, patients, consultations, public, ...
    │   └── core/      # security.py, qr_generator.py
    ├── alembic/       # Migraciones de base de datos
    └── seed.py        # Datos de prueba
```

## 🔒 Seguridad

- Autenticación JWT con expiración de 24h
- Contraseñas hasheadas con bcrypt
- La vista pública QR **no expone** datos sensibles completos
- Todos los accesos via QR se registran en `access_logs`
- CORS configurado para el frontend únicamente
