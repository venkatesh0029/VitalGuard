"""
Security utilities: JWT authentication, encryption, password hashing
"""

from datetime import datetime, timedelta
from typing import Optional
import os
import logging
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from fastapi import HTTPException, status, Depends, Request
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ── Configuration ──────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-12345678")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Data encryption
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
cipher = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)

# ── Token Models ───────────────────────────────────────────────────────────
class TokenData(BaseModel):
    user_id: str
    exp: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ── JWT Functions ──────────────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug(f"✅ Token created for {data.get('sub')}")
    return encoded_jwt

def verify_access_token(request: Request) -> str:
    """Verify JWT token from Authorization header and return user_id"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise credentials_exception
    
    try:
        # Extract bearer token
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise credentials_exception
        
        token = parts[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        logger.debug(f"✅ Token verified for {user_id}")
        return user_id
    except JWTError as e:
        logger.warning(f"❌ Token validation failed: {e}")
        raise credentials_exception

# ── Password Functions ─────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

# ── Data Encryption ───────────────────────────────────────────────────────
def encrypt_field(value: str) -> str:
    """Encrypt a field value"""
    try:
        encrypted = cipher.encrypt(value.encode())
        return encrypted.decode()
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        return value

def decrypt_field(encrypted_value: str) -> str:
    """Decrypt a field value"""
    try:
        decrypted = cipher.decrypt(encrypted_value.encode())
        return decrypted.decode()
    except Exception as e:
        logger.error(f"Decryption failed: {e}")
        return encrypted_value

def encrypt_vitals(heart_rate: float, spo2: float, steps: int) -> dict:
    """Encrypt health vitals as JSON string"""
    import json
    data = json.dumps({"hr": heart_rate, "spo2": spo2, "st": steps})
    encrypted = cipher.encrypt(data.encode())
    return {"vitals_encrypted": encrypted.decode()}

def decrypt_vitals(encrypted_vitals: str) -> dict:
    """Decrypt health vitals from encrypted string"""
    import json
    try:
        decrypted = cipher.decrypt(encrypted_vitals.encode())
        return json.loads(decrypted.decode())
    except Exception as e:
        logger.error(f"Vitals decryption failed: {e}")
        return {"hr": 0, "spo2": 0, "st": 0}

# ── Security Headers ───────────────────────────────────────────────────────
def get_security_headers() -> dict:
    """Get standard security headers"""
    return {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Content-Security-Policy": "default-src 'self'",
    }
