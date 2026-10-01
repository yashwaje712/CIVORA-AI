from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.citizen_profile import CitizenProfile


router = APIRouter(
    prefix="/api/profile",
    tags=["Citizen Profile"]
)


class CitizenProfileRequest(BaseModel):
    age: int | None = None
    state: str | None = None
    occupation: str | None = None
    annual_income: int | None = None
    category: str | None = None
    gender: str | None = None
    citizen_status: str | None = None


@router.get("")
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = (
        db.query(CitizenProfile)
        .filter(
            CitizenProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        return {
            "status": "success",
            "profile": None,
        }

    return {
        "status": "success",
        "profile": {
            "age": profile.age,
            "state": profile.state,
            "occupation": profile.occupation,
            "annual_income": profile.annual_income,
            "category": profile.category,
            "gender": profile.gender,
            "citizen_status": profile.citizen_status,
        },
    }


@router.post("")
def save_profile(
    data: CitizenProfileRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    profile = (
        db.query(CitizenProfile)
        .filter(
            CitizenProfile.user_id == current_user.id
        )
        .first()
    )

    if profile:
        profile.age = data.age
        profile.state = data.state
        profile.occupation = data.occupation
        profile.annual_income = data.annual_income
        profile.category = data.category
        profile.gender = data.gender
        profile.citizen_status = data.citizen_status

    else:
        profile = CitizenProfile(
            user_id=current_user.id,
            age=data.age,
            state=data.state,
            occupation=data.occupation,
            annual_income=data.annual_income,
            category=data.category,
            gender=data.gender,
            citizen_status=data.citizen_status,
        )

        db.add(profile)

    db.commit()
    db.refresh(profile)

    return {
        "status": "success",
        "message": "Citizen profile saved successfully.",
        "profile": {
            "age": profile.age,
            "state": profile.state,
            "occupation": profile.occupation,
            "annual_income": profile.annual_income,
            "category": profile.category,
            "gender": profile.gender,
            "citizen_status": profile.citizen_status,
        },
    }