#!/usr/bin/env python
import sys
import urllib.request
import urllib.parse
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.usuario import Usuario

db = SessionLocal()
try:
    user = db.query(Usuario).filter(Usuario.email == 'admin@hospital.bo').first()
    if user:
        print(f"[OK] Usuario encontrado en BD: {user.email}")
        print(f"     Estado: {user.estado}")
    else:
        print("[ERROR] Usuario NO encontrado en BD")

    print("\nProbando endpoint /docs...")
    try:
        r = urllib.request.urlopen("http://localhost:8000/docs", timeout=5)
        print(f"[OK] FastAPI respondiendo en puerto 8000 (status: {r.status})")
    except Exception as e:
        print(f"[ERROR] FastAPI no responde: {e}")

    print("\nProbando login...")
    try:
        data = urllib.parse.urlencode({"username": "admin@hospital.bo", "password": "Admin1234!"})
        data = data.encode('utf-8')
        req = urllib.request.Request("http://localhost:8000/api/auth/login", data=data, method="POST")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        with urllib.request.urlopen(req, timeout=10) as response:
            result = response.read().decode()
            print(f"[OK] Login exitoso: {result[:100]}...")
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Login falló: {e.code} - {e.reason}")
    except Exception as e:
        print(f"[ERROR] Login falló: {e}")
finally:
    db.close()