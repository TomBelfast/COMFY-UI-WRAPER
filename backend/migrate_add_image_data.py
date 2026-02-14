
import sqlite3
import os
from loguru import logger

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(PROJECT_ROOT, 'app.db')

def run_migration():
    logger.info(f"Running image_data migration on {DB_PATH}")
    if not os.path.exists(DB_PATH):
        logger.error(f"Database file not found: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(gallery)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if "image_data" not in columns:
            cursor.execute("ALTER TABLE gallery ADD COLUMN image_data TEXT")
            logger.success("Added 'image_data' column to 'gallery' table")
        else:
            logger.info("Column 'image_data' already exists in 'gallery' table")

        conn.commit()
        logger.success("Migration completed successfully")
    except Exception as e:
        conn.rollback()
        logger.error(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
