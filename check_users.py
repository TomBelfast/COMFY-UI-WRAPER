
import sqlite3
import os

db_path = "/root/APLIKACJE/COMFY-UI-WRAPER/app.db"
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, username, display_name FROM users;")
        users = cursor.fetchall()
        print("Users in DB (id, username, display_name):")
        for u in users:
            print(u)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
