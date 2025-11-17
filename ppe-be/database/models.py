from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class DetectionRecord(Base):
    __tablename__ = "detection_records"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    image_path = Column(String, nullable=True)
    result_json = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    alert = Column(Boolean, default=False)
    acknowledge = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
