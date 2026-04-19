#!/usr/bin/env python
import sys
import urllib.request
import urllib.parse

print("1. Verificando if container frontend puede alcanzar backend...")
try:
    req = urllib.request.Request("http://backend:8000/docs")
    with urllib.request.urlopen(req, timeout=5) as r:
        print(f"   [OK] Backend responde: {r.status}")
except Exception as e:
    print(f"   [ERROR] No puede alcanzar backend: {e}")

print("\n2. Probando login...")
data = urllib.parse.urlencode({"username": "admin@hospital.bo", "password": "Admin1234!"})
data = data.encode('utf-8')
req = urllib.request.Request("http://backend:8000/api/auth/login", data=data, method="POST")
req.add_header("Content-Type", "application/x-www-form-urlencoded")
try:
    with urllib.request.urlopen(req, timeout=10) as response:
        result = response.read().decode()
        print(f"   [OK] Login exitoso: {result[:100]}...")
except urllib.error.HTTPError as e:
    print(f"   [ERROR] HTTP {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"   [ERROR]: {e}")