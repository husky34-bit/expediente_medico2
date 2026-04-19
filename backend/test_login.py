#!/usr/bin/env python
import sys
sys.path.insert(0, '/app')

from app.database import SessionLocal
from app.models.usuario import Usuario
from app.core.security import verify_password

db = SessionLocal()
try:
    user = db.query(Usuario).filter(Usuario.email == 'admin@hospital.bo').first()
    if user:
        print(f"User found: {user.email}")
        print(f"Estado: {user.estado}")
        print(f"Password hash: {user.password_hash[:30]}...")
        
        result = verify_password('Admin1234!', user.password_hash)
        print(f"Verify 'Admin1234!': {result}")
        
        result2 = verify_password('Doctor1234!', user.password_hash)
        print(f"Verify 'Doctor1234!': {result2}")
    else:
        print("User not found")
finally:
    db.close()