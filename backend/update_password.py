
from database import SessionLocal, User
from auth import hash_password
import sys

def update_user_password(username, new_password):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"❌ User {username} not found!")
            return

        print(f"🧐 Found user: {user.username}")
        print(f"📝 Updating password for {user.username}...")
        
        user.password_hash = hash_password(new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ Password updated successfully for {user.username}.")
            
    except Exception as e:
        print(f"💥 Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 update_password.py <username> <new_password>")
        sys.exit(1)
        
    username = sys.argv[1]
    new_password = sys.argv[2]
    update_user_password(username, new_password)
