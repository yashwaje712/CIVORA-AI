from fastapi import APIRouter

from app.services.verified_sources import (
    get_verified_sources,
    is_verified_source,
)


router = APIRouter(
    prefix="/api/verified",
    tags=["Verified Sources"],
)


@router.get("/sources")
def verified_sources():
    return {
        "status": "success",
        "count": len(get_verified_sources()),
        "sources": get_verified_sources(),
    }


@router.get("/check")
def check_source(url: str):
    verified = is_verified_source(url)

    return {
        "url": url,
        "verified": verified,
        "status": "verified" if verified else "unverified",
    }