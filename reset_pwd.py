
import sqlite3
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

db_path = "app.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

new_pwd = "Tomasz2024!"
hashed = hash_password(new_pwd)

cursor.execute("UPDATE users SET password_hash = ? WHERE username = 'tomaszpasiekauk@gmail.com';", (hashed,))
conn.commit()
print(f"Password for 'tomaszpasiekauk@gmail.com' reset to '{new_pwd}'")
conn.close()
