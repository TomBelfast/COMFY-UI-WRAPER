
import sqlite3
conn = sqlite3.connect("app.db")
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM gallery WHERE user_id = 1;")
print(f"Gallery count for User 1: {cursor.fetchone()[0]}")
cursor.execute("SELECT id, filename FROM gallery WHERE user_id = 1 LIMIT 5;")
print(f"Latest items: {cursor.fetchall()}")
conn.close()
