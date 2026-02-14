
import sqlite3
conn = sqlite3.connect("app.db")
cursor = conn.cursor()
cursor.execute("SELECT id, filename, length(image_data) FROM gallery;")
rows = cursor.fetchall()
print("Images in DB:")
for r in rows:
    print(f"ID: {r[0]}, File: {r[1]}, Data Size: {r[2]} bytes")
conn.close()
