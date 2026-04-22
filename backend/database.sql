-- Habilitar extensión para funciones criptográficas (opcional en versiones nuevas, pero buena práctica)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- A. Módulo de Acceso y Seguridad
-- =========================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    permisos JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Preparado para el string resultante de Argon2/Bcrypt
    role_id INT NOT NULL,
    mfa_secret VARCHAR(255),
    intentos_fallidos INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Bloqueado', 'Inactivo')),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nombre_completo VARCHAR(255),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- =========================================
-- B. Perfiles y Entidades
-- =========================================

CREATE TABLE centros_medicos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    codigo_institucional VARCHAR(50) UNIQUE NOT NULL,
    direccion TEXT NOT NULL
);

CREATE TABLE personal_salud (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL UNIQUE,
    centro_id INT NOT NULL,
    matricula_profesional VARCHAR(100) UNIQUE NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    CONSTRAINT fk_personal_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_personal_centro FOREIGN KEY (centro_id) REFERENCES centros_medicos(id) ON DELETE RESTRICT
);

CREATE TABLE pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE, -- Opcional, por si el paciente tiene acceso al sistema
    dni_pasaporte VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero_biologico VARCHAR(20) NOT NULL,
    tipo_sangre VARCHAR(10),
    alergias TEXT,
    contacto_emergencia_nombre VARCHAR(255),
    contacto_emergencia_tel VARCHAR(50),
    qr_token VARCHAR(255) UNIQUE,
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =========================================
-- C. Expediente Clínico Universal
-- =========================================

CREATE TABLE consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    medico_id UUID NOT NULL,
    centro_id INT NOT NULL,
    motivo_consulta TEXT NOT NULL,
    diagnostico_cie10 VARCHAR(10) NOT NULL,
    tratamiento TEXT,
    notas_privadas TEXT, -- Recomendable cifrar desde el backend (aplicación) antes de guardar
    fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consulta_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_consulta_medico FOREIGN KEY (medico_id) REFERENCES personal_salud(id) ON DELETE RESTRICT,
    CONSTRAINT fk_consulta_centro FOREIGN KEY (centro_id) REFERENCES centros_medicos(id) ON DELETE RESTRICT
);

-- =========================================
-- E. Medicamentos y Laboratorios
-- =========================================

CREATE TABLE medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    prescrito_por UUID NOT NULL,
    nombre_medicamento VARCHAR(255) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    esta_activo BOOLEAN DEFAULT TRUE,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_medicamento_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_medicamento_medico FOREIGN KEY (prescrito_por) REFERENCES personal_salud(id) ON DELETE RESTRICT
);

CREATE TABLE resultados_laboratorio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL,
    solicitado_por UUID NOT NULL,
    nombre_prueba VARCHAR(255) NOT NULL,
    valor_resultado VARCHAR(255) NOT NULL,
    unidad VARCHAR(50),
    rango_referencia VARCHAR(100),
    fecha_prueba DATE NOT NULL,
    laboratorio_nombre VARCHAR(255),
    archivo_url VARCHAR(255),
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lab_paciente FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_lab_medico FOREIGN KEY (solicitado_por) REFERENCES personal_salud(id) ON DELETE RESTRICT
);

-- =========================================
-- D. Auditoría (Seguridad Crítica)
-- =========================================

CREATE TABLE logs_acceso (
    id BIGSERIAL PRIMARY KEY,
    usuario_id UUID NOT NULL,
    accion VARCHAR(255) NOT NULL,
    paciente_afectado_id UUID,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET, -- Tipo de dato nativo de PostgreSQL para IPs (IPv4/IPv6)
    user_agent TEXT,
    CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE NO ACTION,
    CONSTRAINT fk_log_paciente FOREIGN KEY (paciente_afectado_id) REFERENCES pacientes(id) ON DELETE NO ACTION
);

-- =========================================
-- Trigger para hacer logs_acceso Inmutable
-- =========================================

-- 1. Crear la función que rechaza las modificaciones
CREATE OR REPLACE FUNCTION prevenir_modificacion_logs()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Violación de seguridad: La modificación o eliminación de registros en la tabla de auditoría (logs_acceso) está estrictamente prohibida.';
END;
$$ LANGUAGE plpgsql;

-- 2. Asignar el trigger a la tabla para que se ejecute antes de UPDATE o DELETE
CREATE TRIGGER trg_logs_acceso_inmutable
BEFORE UPDATE OR DELETE ON logs_acceso
FOR EACH ROW
EXECUTE FUNCTION prevenir_modificacion_logs();
