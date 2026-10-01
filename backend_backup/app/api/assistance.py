from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.services.situation_engine import analyze_situation
from app.services.scheme_matcher import find_matching_schemes
from app.db.database import get_db
from app.models.demand import DemandRecord


router = APIRouter(
    prefix="/api/assistance",
    tags=["Assistance"]
)


class AssistanceRequest(BaseModel):
    situation: str


NEED_NAMES = {
    "employment": "employment",
    "skill_training": "skill training",
    "education": "education",
    "agriculture": "agriculture",
    "health": "healthcare",
    "financial_difficulty": "financial support",
    "housing": "housing",
    "street_vending": "street vending",
    "small_business": "small business",
    "artisan": "artisan and traditional trade",
}


def build_scheme_reason(matched_needs):
    readable_needs = [
        NEED_NAMES.get(need, need)
        for need in matched_needs
    ]

    if not readable_needs:
        return (
            "This scheme may be relevant based on "
            "the situation you described."
        )

    if len(readable_needs) == 1:
        return (
            "This scheme may be relevant because your "
            f"situation indicates {readable_needs[0]}."
        )

    return (
        "This scheme may be relevant because your "
        "situation indicates "
        + ", ".join(readable_needs[:-1])
        + " and "
        + readable_needs[-1]
        + "."
    )


@router.post("/analyze")
def analyze_situation_api(
    data: AssistanceRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    situation = data.situation.strip()

    if not situation:
        return {
            "message": "Please enter your situation.",
            "status": "error",
        }

    situation_analysis = analyze_situation(situation)

    detected_needs = situation_analysis.get(
        "needs",
        []
    )

    categories = situation_analysis.get(
        "categories",
        []
    )

    reasons = situation_analysis.get(
        "reasons",
        []
    )

    matched_schemes = find_matching_schemes(
        situation
    )

    schemes = []

    for scheme in matched_schemes:
        matched_needs = scheme.get(
            "matched_needs",
            []
        )

        matched_keywords = scheme.get(
            "matched_keywords",
            []
        )

        reason = build_scheme_reason(
            matched_needs
        )

        schemes.append(
            {
                "name": scheme.get(
                    "name",
                    "Government Scheme"
                ),
                "source": scheme.get(
                    "source",
                    "myScheme"
                ),
                "url": scheme.get(
                    "official_url",
                    "https://www.myscheme.gov.in/"
                ),
                "note": scheme.get(
                    "description",
                    "This scheme may be relevant "
                    "based on the situation provided."
                ),
                "eligibility": scheme.get(
                    "eligibility",
                    []
                ),
                "documents": scheme.get(
                    "documents",
                    []
                ),
                "match_score": scheme.get(
                    "match_score",
                    0
                ),
                "matched_needs": matched_needs,
                "matched_keywords": matched_keywords,
                "why_relevant": reason,
            }
        )

    if categories:
        category = (
            f"{categories[0]} Assistance"
        )
    else:
        category = "General Assistance"

    if categories:
        potential_assistance = [
            f"{category_name} assistance"
            for category_name in categories
        ]
    else:
        potential_assistance = [
            "Government scheme discovery",
            "Citizen support services",
        ]

    documents = [
        "Identity proof",
        "Address proof",
        "Relevant supporting documents",
    ]

    eligibility = [
        "Personal circumstances",
        "Applicable scheme eligibility criteria",
        "Applicable government rules",
    ]

    demand_record = DemandRecord(
        category=category
    )

    db.add(demand_record)
    db.commit()

    return {
        "message": (
            "CIVORA AI successfully analyzed "
            "your situation!"
        ),
        "category": category,
        "situation": situation,
        "detected_needs": detected_needs,
        "detected_categories": categories,
        "situation_reasons": reasons,
        "potential_assistance": potential_assistance,
        "schemes": schemes,
        "documents": documents,
        "eligibility": eligibility,
        "official_source": (
            "https://www.myscheme.gov.in/"
        ),
        "status": "analysis_completed",
    }