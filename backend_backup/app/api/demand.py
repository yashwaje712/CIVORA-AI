from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.db.database import get_db
from app.models.demand import DemandRecord


router = APIRouter(
    prefix="/api/demand",
    tags=["Demand Intelligence"],
)


@router.get("/summary")
def get_demand_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    results = (
        db.query(
            DemandRecord.category,
            func.count(DemandRecord.id).label("count"),
        )
        .group_by(DemandRecord.category)
        .order_by(func.count(DemandRecord.id).desc())
        .all()
    )

    return {
        "status": "success",
        "total_requests": sum(
            item.count for item in results
        ),
        "categories": [
            {
                "category": item.category,
                "count": item.count,
            }
            for item in results
        ],
    }