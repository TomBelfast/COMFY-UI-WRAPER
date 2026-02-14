
import sqlite3
import os

db_path = "/root/APLIKACJE/COMFY-UI-WRAPER/app.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT id, username, password_hash FROM users;")
print(cursor.fetchall())
conn.close()
