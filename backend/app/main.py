from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.assistance import router as assistance_router
from app.api.demand import router as demand_router
from app.api.verified import router as verified_router
from app.api.profile import router as profile_router

from app.db.database import Base, engine
from app.models.user import User
from app.models.demand import DemandRecord
from app.models.citizen_profile import CitizenProfile


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="CIVORA AI",
    description="Citizen Assistance Intelligence API",
    version="1.0.0",
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API Routers
app.include_router(auth_router)
app.include_router(assistance_router)
app.include_router(demand_router)
app.include_router(verified_router)
app.include_router(profile_router)


@app.get("/")
def root():
    return {
        "message": "CIVORA AI Backend is running!",
        "status": "success",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CIVORA AI Backend",
    }