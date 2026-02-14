
from database import SessionLocal, User
import sys

def debug_update():
    db = SessionLocal()
    try:
        # Find user ulka
        user = db.query(User).filter(User.username.like("%ulka%")).first()
        if not user:
            print("❌ User ulka not found!")
            return

        print(f"🧐 Current state for {user.username}: {user.comfyui_url}")

        # Try to update
        test_url = "http://100.100.100.100:8188"
        print(f"📝 Attempting to set URL to: {test_url}")
        
        user.comfyui_url = test_url
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ Update committed. New state in session: {user.comfyui_url}")
        
        # Verify persistence in a new session
        db.close()
        
        db2 = SessionLocal()
        user_verify = db2.query(User).filter(User.id == user.id).first()
        print(f"🕵️ Verified state in new session: {user_verify.comfyui_url}")
        
        if user_verify.comfyui_url == test_url:
            print("🎉 SUCCESS: Database persistence works!")
        else:
            print("💀 FAILURE: Data did not persist!")
            
    except Exception as e:
        print(f"💥 Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_update()
