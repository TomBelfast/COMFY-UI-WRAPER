"""
Idempotent SQLite migration: adds users table and user_id columns.
Safe to run multiple times - checks before altering.
"""
import sqlite3
from loguru import logger
from database import DATABASE_URL

def get_db_path():
    return DATABASE_URL.replace("sqlite:///", "")

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def table_exists(cursor, table):
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
    return cursor.fetchone() is not None

def run_migration():
    db_path = get_db_path()
    logger.info(f"Running auth migration on {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # 1. Create users table
        if not table_exists(cursor, "users"):
            cursor.execute("""
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    display_name TEXT,
                    password_hash TEXT,
                    profile_pic TEXT,
                    tailscale_login TEXT UNIQUE,
                    comfyui_url TEXT,
                    is_admin BOOLEAN DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            logger.success("Created 'users' table")
        else:
            logger.info("Table 'users' already exists, skipping")

        # 2. Add user_id to config
        if not column_exists(cursor, "config", "user_id"):
            cursor.execute("ALTER TABLE config ADD COLUMN user_id INTEGER REFERENCES users(id)")
            logger.success("Added user_id to 'config'")

        # 3. Add user_id to presets
        if not column_exists(cursor, "presets", "user_id"):
            cursor.execute("ALTER TABLE presets ADD COLUMN user_id INTEGER REFERENCES users(id)")
            logger.success("Added user_id to 'presets'")

        # 4. Add user_id to gallery
        if not column_exists(cursor, "gallery", "user_id"):
            cursor.execute("ALTER TABLE gallery ADD COLUMN user_id INTEGER REFERENCES users(id)")
            logger.success("Added user_id to 'gallery'")

        conn.commit()
        logger.success("Auth migration completed successfully")
    except Exception as e:
        conn.rollback()
        logger.error(f"Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
