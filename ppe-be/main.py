from fastapi import FastAPI, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from ultralytics import YOLO
import numpy as np
import cv2
import os
import json
from tempfile import TemporaryDirectory
from pdf2image import convert_from_bytes

# ==========================================================
# === DATABASE SETUP =======================================
# ==========================================================
DATABASE_URL = "sqlite:///./ppe.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
from database.models import Base, DetectionRecord

Base.metadata.create_all(bind=engine)


# ==========================================================
# === FASTAPI SETUP ========================================
# ==========================================================
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         
    allow_credentials=True,         
    allow_methods=["*"],            
    allow_headers=["*"],            
)

# === static uploads folder ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# === YOLO model ===
MODEL_PATH = os.path.join(BASE_DIR, "predict", "best.pt")
model = YOLO(MODEL_PATH)


# ==========================================================
# === DEPENDENCY ===========================================
# ==========================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================================
# === DETECT & SAVE ENDPOINT ===============================
# ==========================================================
REQUIRED_ITEMS = ["shoes", "vest", "helmet"]  # item wajib

@app.post("/detect")
async def detect(file: UploadFile, db: Session = Depends(get_db)):
    file_bytes = await file.read()
    filename = file.filename.lower()
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Simpan file
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Deteksi format file
    if filename.endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp")):
        np_arr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        images = [img]
    elif filename.endswith(".pdf"):
        with TemporaryDirectory() as temp_dir:
            pages = convert_from_bytes(file_bytes, dpi=200, fmt="jpeg", output_folder=temp_dir)
            images = [cv2.cvtColor(np.array(p), cv2.COLOR_RGB2BGR) for p in pages]
    else:
        raise HTTPException(status_code=400, detail="File tidak didukung.")

    all_results = []
    description_list = []
    alert_flag = False

    for idx, img in enumerate(images):
        results = model.predict(source=img, conf=0.5)
        detections = []
        detected_names = set()  # untuk menyimpan item yang terdeteksi

        for box in results[0].boxes:
            x1, y1, x2, y2 = map(float, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            name = results[0].names[cls_id].lower()  # lowercase supaya konsisten
            detections.append({
                "name": name,
                "confidence": conf,
                "box": [x1, y1, x2, y2]
            })
            description_list.append(name)
            detected_names.add(name)

        # ⚡ Alert true jika ada item wajib yang hilang
        if any(item not in detected_names for item in REQUIRED_ITEMS):
            alert_flag = True

        all_results.append({"page": idx + 1, "detections": detections})

    # Jika alert false berarti semua item lengkap → acknowledge true
    acknowledge_flag = not alert_flag

    # Simpan ke database
    record = DetectionRecord(
        filename=filename,
        image_path=f"/uploads/{filename}",
        result_json=json.dumps(all_results),
        description=json.dumps(description_list),
        alert=alert_flag,
        acknowledge=acknowledge_flag,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "filename": record.filename,
        "image_url": f"http://localhost:8000{record.image_path}",
        "alert": record.alert,
        "acknowledge": record.acknowledge,
        "description": description_list,
        "results": all_results,
    }


# ==========================================================
# === ENDPOINT TAMBAHAN ====================================
# ==========================================================
@app.get("/detect")
def list_records(db: Session = Depends(get_db)):
    """Ambil semua hasil deteksi"""
    records = db.query(DetectionRecord).order_by(DetectionRecord.created_at.desc()).all()
    return records


@app.put("/detect/{record_id}/ack")
def acknowledge_record(record_id: int, db: Session = Depends(get_db)):
    """Tandai hasil sudah diakui / acknowledged"""
    record = db.query(DetectionRecord).filter(DetectionRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record tidak ditemukan")
    record.acknowledge = True
    db.commit()
    return {"message": "Record acknowledged", "id": record.id}
