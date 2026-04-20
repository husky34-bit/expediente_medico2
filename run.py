"""
  Expediente Clinico Universal -- Launcher
  Ejecuta: python run.py
"""
import io
import sys
# Forzar UTF-8 en stdout/stderr (necesario en Windows con cp1252)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
else:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import subprocess
import os
import time
import shutil

# ─── Colores ANSI ──────────────────────────────────────────────────────────────
R  = "\033[91m"   # rojo
G  = "\033[92m"   # verde
Y  = "\033[93m"   # amarillo
B  = "\033[94m"   # azul
C  = "\033[96m"   # cyan
W  = "\033[97m"   # blanco
DIM = "\033[2m"
RESET = "\033[0m"
BOLD  = "\033[1m"

HERE = os.path.dirname(os.path.abspath(__file__))


# ─── Helpers ───────────────────────────────────────────────────────────────────
def banner():
    os.system("cls" if os.name == "nt" else "clear")
    print(f"""
{C}+----------------------------------------------------------+
|  {W}{BOLD}Expediente Clinico Universal  --  Launcher{RESET}{C}              |
|  {DIM}Sistema de historial medico accesible via QR{RESET}{C}             |
+----------------------------------------------------------+{RESET}
""")


def info(msg: str):
    print(f"  {B}[i]{RESET}  {msg}")


def ok(msg: str):
    print(f"  {G}[OK]{RESET}  {msg}")


def warn(msg: str):
    print(f"  {Y}[!]{RESET}  {msg}")


def err(msg: str):
    print(f"  {R}[X]{RESET}  {msg}")


def step(n: int, total: int, msg: str):
    print(f"\n{C}[{n}/{total}]{RESET} {BOLD}{msg}{RESET}")


def run(cmd: list, cwd: str = HERE, capture: bool = False, timeout: int = 300):
    """Ejecuta un comando y devuelve (returncode, stdout)."""
    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=capture,
        text=True,
        timeout=timeout,
    )
    return result.returncode, result.stdout if capture else ""


def run_stream(cmd: list, cwd: str = HERE):
    """Ejecuta un comando mostrando la salida en tiempo real."""
    proc = subprocess.Popen(cmd, cwd=cwd)
    proc.communicate()
    return proc.returncode


def docker_available() -> bool:
    """Verifica si el daemon Docker está activo."""
    try:
        rc, _ = run(["docker", "info"], capture=True, timeout=10)
        return rc == 0
    except Exception:
        return False


def wait_for_docker(max_wait: int = 90) -> bool:
    """Espera hasta que Docker Desktop arranque."""
    info(f"Esperando que Docker Desktop arranque (máx. {max_wait}s)…")
    for i in range(max_wait):
        if docker_available():
            return True
        time.sleep(1)
        if i % 10 == 9:
            info(f"  {i+1}s / {max_wait}s…")
    return False


def start_docker_desktop():
    """Intenta iniciar Docker Desktop en Windows."""
    candidates = [
        r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
        r"C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Docker\Docker Desktop.exe"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            info(f"Iniciando Docker Desktop: {path}")
            subprocess.Popen([path], shell=False)
            return True
    return False


def check_port_free(port: int) -> bool:
    """Devuelve True si el puerto está libre."""
    try:
        import socket
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(1)
            return s.connect_ex(("127.0.0.1", port)) != 0
    except Exception:
        return True


def wait_for_port(port: int, host: str = "127.0.0.1", timeout: int = 120) -> bool:
    """Espera hasta que un puerto esté escuchando."""
    import socket
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                return True
        except (OSError, ConnectionRefusedError):
            time.sleep(2)
    return False


def containers_running() -> bool:
    """Verifica si los contenedores ya están corriendo."""
    try:
        rc, out = run(
            ["docker", "compose", "ps", "--services", "--filter", "status=running"],
            capture=True,
        )
        services = {s.strip() for s in out.splitlines() if s.strip()}
        return {"db", "backend", "frontend"}.issubset(services)
    except Exception:
        return False


def db_already_seeded() -> bool:
    """Comprueba si la base de datos ya tiene datos."""
    try:
        rc, out = run(
            ["docker", "compose", "exec", "-T", "backend",
             "python", "-c",
             "from app.database import SessionLocal; from app.models.user import User; "
             "db=SessionLocal(); n=db.query(User).count(); db.close(); print(n)"],
            capture=True,
        )
        return rc == 0 and out.strip().isdigit() and int(out.strip()) > 0
    except Exception:
        return False


# ─── Pasos ─────────────────────────────────────────────────────────────────────
TOTAL_STEPS = 5


def step1_docker():
    step(1, TOTAL_STEPS, "Verificar Docker")
    if docker_available():
        ok("Docker Desktop ya está corriendo")
        return

    warn("Docker Desktop no está activo, intentando iniciar…")
    started = start_docker_desktop()

    if not started:
        err("No se encontró Docker Desktop instalado.")
        print(f"""
  {Y}¿Docker no instalado?  Descárgalo de:{RESET}
  {C}https://www.docker.com/products/docker-desktop/{RESET}

  Instálalo, inícialo manualmente y vuelve a ejecutar {W}python run.py{RESET}.
""")
        sys.exit(1)

    if not wait_for_docker(max_wait=90):
        err("Docker Desktop tardó demasiado en arrancar.")
        err("Inícialo manualmente y vuelve a ejecutar el script.")
        sys.exit(1)

    ok("Docker Desktop está listo")


def step2_build():
    step(2, TOTAL_STEPS, "Construir y levantar contenedores (docker compose up --build)")
    env_path = os.path.join(HERE, ".env")
    env_example = os.path.join(HERE, ".env.example")
    if not os.path.exists(env_path) and os.path.exists(env_example):
        info("Archivo .env no encontrado. Creando a partir de .env.example...")
        shutil.copy(env_example, env_path)
        ok("Archivo .env creado automáticamente.")

    info("Esto puede tardar varios minutos la primera vez…\n")

    if containers_running():
        ok("Los contenedores ya están corriendo — saltando build")
        return

    rc = run_stream(["docker", "compose", "up", "--build", "-d"])
    if rc != 0:
        err("Error al levantar los contenedores. Revisa el log anterior.")
        sys.exit(1)
    ok("Contenedores levantados en modo detached")


def step3_wait_db():
    step(3, TOTAL_STEPS, "Esperar que la base de datos esté lista")
    info("Esperando PostgreSQL en el puerto 5432…")
    if wait_for_port(5432, timeout=90):
        ok("PostgreSQL está escuchando")
    else:
        warn("Tiempo de espera agotado — continuando de todas formas…")

    # Pausa extra: el healthcheck de docker puede tardar
    time.sleep(3)


def step4_migrate():
    step(4, TOTAL_STEPS, "Aplicar esquema de base de datos")
    ok("El esquema se aplica de forma automática vía init.sql en el contenedor.")


def step5_seed():
    step(5, TOTAL_STEPS, "Cargar datos de prueba (seed)")
    if db_already_seeded():
        ok("La base de datos ya tiene datos — saltando seed")
        return

    rc, _ = run(
        ["docker", "compose", "exec", "-T", "backend", "python", "seed.py"],
    )
    if rc != 0:
        warn("El seed falló o ya estaba aplicado — continuando…")
    else:
        ok("Datos de prueba cargados exitosamente")


def print_summary():
    print(f"""
{G}==========================================================={RESET}
{BOLD}{G}  [OK]  SISTEMA LISTO!{RESET}
{G}==========================================================={RESET}

  {B}Frontend{RESET}         ->  {W}http://localhost:3000{RESET}
  {B}API Docs{RESET}         ->  {W}http://localhost:8000/docs{RESET}
  {B}API ReDoc{RESET}        ->  {W}http://localhost:8000/redoc{RESET}

  {C}Credenciales de demo:{RESET}
  {DIM}  Admin  {RESET}  admin@hospital.bo   /  {W}Admin1234!{RESET}
  {DIM}  Doctor {RESET}  doctor1@clinica.bo  /  {W}Doctor1234!{RESET}
  {DIM}  Doctor {RESET}  doctor2@clinica.bo  /  {W}Doctor1234!{RESET}

  {Y}Para detener el stack:{RESET}
    {C}docker compose down{RESET}

  {Y}Para ver logs en vivo:{RESET}
    {C}docker compose logs -f{RESET}
""")


def open_browser():
    """Abre el navegador en http://localhost:3000 cuando el frontend esté listo."""
    info("Esperando que el frontend arranque en el puerto 3000…")
    if wait_for_port(3000, timeout=60):
        ok("Frontend listo — abriendo navegador…")
        import webbrowser
        time.sleep(1)
        webbrowser.open("http://localhost:3000")
    else:
        warn("El frontend tardó en responder. Ábrelo manualmente en http://localhost:3000")


# ─── Menú interactivo ──────────────────────────────────────────────────────────
def menu():
    banner()
    print(f"  {W}Que deseas hacer?{RESET}\n")
    print(f"  {G}[1]{RESET} Iniciar todo el proyecto  {DIM}(recomendado){RESET}")
    print(f"  {B}[2]{RESET} Solo levantar contenedores  {DIM}(ya migrado){RESET}")
    print(f"  {Y}[3]{RESET} Solo aplicar migraciones y seed")
    print(f"  {R}[4]{RESET} Detener todos los contenedores")
    print(f"  {C}[5]{RESET} Ver logs en tiempo real")
    print(f"  {DIM}[0]{RESET} Salir\n")

    choice = input(f"  {C}Opcion: {RESET}").strip()
    return choice


def main():
    if not shutil.which("docker"):
        banner()
        err("No se encontró el comando 'docker' en el PATH.")
        print(f"\n  Descarga Docker Desktop desde:\n  {C}https://www.docker.com/products/docker-desktop/{RESET}\n")
        sys.exit(1)

    # Permite ejecutar con argumento directo: python run.py start
    arg = sys.argv[1].lower() if len(sys.argv) > 1 else None

    if arg == "start":
        choice = "1"
    elif arg == "down":
        choice = "4"
    elif arg == "logs":
        choice = "5"
    elif arg == "migrate":
        choice = "3"
    else:
        banner()
        choice = menu()

    if choice == "0":
        print(f"\n  {DIM}Hasta luego.{RESET}\n")
        sys.exit(0)

    elif choice == "1":
        banner()
        print(f"  {BOLD}Iniciando el stack completo…{RESET}\n")
        step1_docker()
        step2_build()
        step3_wait_db()
        step4_migrate()
        step5_seed()
        print_summary()
        open_browser()

    elif choice == "2":
        banner()
        step1_docker()
        step2_build()
        step3_wait_db()
        print_summary()
        open_browser()

    elif choice == "3":
        banner()
        step1_docker()
        step4_migrate()
        step5_seed()
        ok("Migraciones y seed completados.")

    elif choice == "4":
        banner()
        info("Deteniendo contenedores…")
        run_stream(["docker", "compose", "down"])
        ok("Contenedores detenidos.")

    elif choice == "5":
        banner()
        info("Mostrando logs (Ctrl+C para salir)…\n")
        try:
            run_stream(["docker", "compose", "logs", "-f", "--tail=50"])
        except KeyboardInterrupt:
            print(f"\n  {DIM}Logs cerrados.{RESET}\n")

    else:
        warn("Opción no válida.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n  {Y}Interrumpido por el usuario.{RESET}\n")
        sys.exit(0)
