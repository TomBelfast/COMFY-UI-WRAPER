
import sqlite3
conn = sqlite3.connect("app.db")
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM gallery WHERE user_id IS NULL;")
print(f"Orphaned images: {cursor.fetchone()[0]}")
conn.close()
