
import bcrypt

hashed = b"$2b$12$a3BFk8eq4iK/dUOtOE2blunkEj3We1o2.ZFTr.5FgLvpA2/gUGpbq"
password = b"Tomasz123!" # guessing common stuff or looking for what he might have typed

def check(pwd):
    print(f"Checking '{pwd}': {bcrypt.checkpw(pwd.encode(), hashed)}")

check("Tomasz123!")
check("password")
check("tomasz")
