
from database import SessionLocal, User, AppConfig
import json

db = SessionLocal()
try:
    users = db.query(User).all()
    print("USERS:")
    for u in users:
        print(f"ID: {u.id}, Username: {u.username}, Display: {u.display_name}, ComfyURL: {u.comfyui_url}")
    
    configs = db.query(AppConfig).all()
    print("\nCONFIGS:")
    for c in configs:
        print(f"Key: {c.key}, Value: {c.value}, UserID: {c.user_id}")
finally:
    db.close()
