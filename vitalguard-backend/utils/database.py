"""
Database layer with env-configurable providers (in-memory/MongoDB).
Set DATABASE_PROVIDER=mongo in .env to switch.
"""

from datetime import datetime
from typing import List, Optional
import uuid
import os
import logging
from dotenv import load_dotenv
load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_PROVIDER = os.getenv("DATABASE_PROVIDER", "inmemory")
logger.info(f"📊 Database provider: {DATABASE_PROVIDER}")

if DATABASE_PROVIDER == "mongo":
    # ─────────────────────────────────────────────────────────────────────────────
    # MONGODB
    # ─────────────────────────────────────────────────────────────────────────────
    from pymongo import MongoClient
    
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = MongoClient(MONGO_URI)
    db = client["healthguard"]
    collection = db["records"]
    
    def save_record(record: dict) -> str:
        record["_id"] = str(uuid.uuid4())
        record["timestamp"] = record.get("timestamp", datetime.utcnow()).isoformat()
        result = collection.insert_one(record)
        return str(result.inserted_id)
    
    def get_records(user_id: str, limit: int = 50) -> List[dict]:
        cursor = collection.find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
        return [dict(r) for r in cursor]
    
    def get_all_records(limit: int = 100) -> List[dict]:
        cursor = collection.find().sort("timestamp", -1).limit(limit)
        return [dict(r) for r in cursor]
    
    def clear_records(user_id: Optional[str] = None):
        if user_id:
            collection.delete_many({"user_id": user_id})
        else:
            collection.delete_many({})
else:
    # ─────────────────────────────────────────────────────────────────────────────
    # IN-MEMORY (default)
    # ─────────────────────────────────────────────────────────────────────────────
    _records: List[dict] = []
    
    def save_record(record: dict) -> str:
        record["id"] = str(uuid.uuid4())
        record["timestamp"] = record.get("timestamp", datetime.utcnow()).isoformat()
        _records.append(record)
        return record["id"]
    
    def get_records(user_id: str, limit: int = 50) -> List[dict]:
        user_records = [r for r in _records if r.get("user_id") == user_id]
        return list(reversed(user_records[-limit:]))  # newest first
    
    def get_all_records(limit: int = 100) -> List[dict]:
        return list(reversed(_records[-limit:]))
    
    def clear_records(user_id: Optional[str] = None):
        global _records
        if user_id:
            _records = [r for r in _records if r.get("user_id") != user_id]
        else:
            _records = []


# ─────────────────────────────────────────────────────────────────────────────
# FIREBASE FIRESTORE (uncomment to use — pip install firebase-admin)
# ─────────────────────────────────────────────────────────────────────────────
# if DATABASE_PROVIDER == "firebase":
#     import firebase_admin
#     from firebase_admin import credentials, firestore
#     
#     cred = credentials.Certificate(os.getenv("FIREBASE_KEY_PATH", "firebase_key.json"))
#     firebase_admin.initialize_app(cred)
#     db = firestore.client()
#     
#     def save_record(record: dict) -> str:
#         record_id = str(uuid.uuid4())
#         record["id"] = record_id
#         db.collection("health_records").document(record_id).set(record)
#         return record_id
#     
#     def get_records(user_id: str, limit: int = 50) -> List[dict]:
#         docs = (db.collection("health_records")
#                 .where("user_id", "==", user_id)
#                 .order_by("timestamp", direction=firestore.Query.DESCENDING)
#                 .limit(limit).stream())
#         return [doc.to_dict() for doc in docs]

