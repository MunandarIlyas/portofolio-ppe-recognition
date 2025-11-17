# hapus_data.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import DetectionRecord, Base  # sesuaikan path sesuai proyekmu

# ===============================
# ====== DATABASE CONFIG ========
# ===============================
DATABASE_URL = "sqlite:///./ppe.db"  # path ke database SQLite
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

# ===============================
# ===== MAIN SCRIPT ============
# ===============================
def hapus_semua_data():
    db = SessionLocal()
    try:
        deleted_count = db.query(DetectionRecord).delete()
        db.commit()
        print(f"✅ Berhasil menghapus {deleted_count} record dari tabel DetectionRecord.")
    except Exception as e:
        print("❌ Terjadi kesalahan:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    hapus_semua_data()
