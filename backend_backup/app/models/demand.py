from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from app.db.database import Base


class DemandRecord(Base):
    __tablename__ = "demand_records"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )