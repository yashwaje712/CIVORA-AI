from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base


class CitizenProfile(Base):
    __tablename__ = "citizen_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False,
        index=True
    )

    age = Column(Integer, nullable=True)

    state = Column(
        String(100),
        nullable=True
    )

    occupation = Column(
        String(100),
        nullable=True
    )

    annual_income = Column(
        Integer,
        nullable=True
    )

    category = Column(
        String(50),
        nullable=True
    )

    gender = Column(
        String(30),
        nullable=True
    )

    citizen_status = Column(
        String(100),
        nullable=True
    )