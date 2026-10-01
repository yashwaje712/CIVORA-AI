from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.services.situation_engine import analyze_situation
from app.services.scheme_matcher import find_matching_schemes
from app.services.next_best_action import build_next_best_action
from app.services.document_readiness import build_document_readiness
from app.db.database import get_db
from app.models.demand import DemandRecord
from app.models.citizen_profile import CitizenProfile


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


def build_scheme_reason(
    matched_needs,
    situation
):
    readable_needs = [
        NEED_NAMES.get(
            need,
            need
        )
        for need in matched_needs
    ]

    if not readable_needs:
        return (
            "This scheme may be relevant based on "
            "the situation you described."
        )

    if len(readable_needs) == 1:
        return (
            f"You mentioned that your situation involves "
            f"{readable_needs[0]}. This scheme is associated "
            f"with {readable_needs[0]} support, so it may be "
            f"relevant to explore."
        )

    return (
        "You mentioned that your situation involves "
        + ", ".join(readable_needs[:-1])
        + " and "
        + readable_needs[-1]
        + ". This scheme is associated with these "
        "assistance needs, so it may be relevant to explore."
    )


def build_profile_indicators(profile):
    """
    Builds profile-information indicators.

    These indicators show which profile information
    is available to CIVORA AI.

    They are NOT government eligibility decisions.
    """

    if not profile:
        return []

    indicators = []

    if profile.age is not None:
        indicators.append({
            "label": "Age information available",
            "status": "available"
        })

    if profile.state:
        indicators.append({
            "label": "State information available",
            "status": "available"
        })

    if profile.occupation:
        indicators.append({
            "label": "Occupation information available",
            "status": "available"
        })

    if profile.annual_income is not None:
        indicators.append({
            "label": "Income information available",
            "status": "available"
        })

    if profile.category:
        indicators.append({
            "label": "Category information available",
            "status": "available"
        })

    if profile.gender:
        indicators.append({
            "label": "Gender information available",
            "status": "available"
        })

    if profile.citizen_status:
        indicators.append({
            "label": "Special status information available",
            "status": "available"
        })

    return indicators


def get_match_strength(
    match_score,
    matched_needs
):
    """
    Converts internal match information into
    a simple explanation for the citizen.

    Match strength is based on the number of
    assistance needs actually matched by this scheme.

    This is a relevance indicator only.
    It is NOT government eligibility or approval.
    """

    need_count = len(matched_needs)

    if need_count >= 3:
        return {
            "level": "Strong Match",
            "description": (
                "This scheme matches multiple "
                "assistance needs identified in "
                "your situation."
            ),
        }

    if need_count == 2:
        return {
            "level": "Relevant Match",
            "description": (
                "This scheme matches more than one "
                "assistance need identified in "
                "your situation."
            ),
        }

    return {
        "level": "Possible Match",
        "description": (
            "This scheme matches an assistance need "
            "identified in your situation."
        ),
    }


@router.post("/analyze")
def analyze_situation_api(
    data: AssistanceRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    situation = data.situation.strip()

    # -------------------------------------------------
    # 1. EMPTY SITUATION CHECK
    # -------------------------------------------------

    if not situation:
        return {
            "message": "Please enter your situation.",
            "status": "error",
        }

    # -------------------------------------------------
    # 2. LOAD CITIZEN PROFILE
    # -------------------------------------------------

    profile = (
        db.query(CitizenProfile)
        .filter(
            CitizenProfile.user_id
            == current_user.id
        )
        .first()
    )

    # -------------------------------------------------
    # 3. BUILD PROFILE INDICATORS
    # -------------------------------------------------

    profile_indicators = build_profile_indicators(
        profile
    )

    # -------------------------------------------------
    # 4. ANALYZE CITIZEN SITUATION
    # -------------------------------------------------

    situation_analysis = analyze_situation(
        situation
    )

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

    # -------------------------------------------------
    # 5. FIND MATCHING GOVERNMENT SCHEMES
    # -------------------------------------------------

    matched_schemes = find_matching_schemes(
        situation,
        profile=profile
    )

    schemes = []

    # -------------------------------------------------
    # 6. BUILD SCHEME RESULTS
    # -------------------------------------------------

    for scheme in matched_schemes:

        matched_needs = scheme.get(
            "matched_needs",
            []
        )

        matched_keywords = scheme.get(
            "matched_keywords",
            []
        )

        match_score = scheme.get(
            "match_score",
            0
        )

        reason = build_scheme_reason(
            matched_needs,
            situation
        )

        match_strength = get_match_strength(
            match_score,
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

                "match_score": match_score,

                "match_strength": match_strength,

                "matched_needs": matched_needs,

                "matched_keywords": matched_keywords,

                "why_relevant": reason,
            }
        )

    # -------------------------------------------------
    # 7. BUILD ASSISTANCE CATEGORY
    # -------------------------------------------------

    if categories:
        category = (
            f"{categories[0]} Assistance"
        )
    else:
        category = "General Assistance"

    # -------------------------------------------------
    # 8. BUILD POTENTIAL ASSISTANCE
    # -------------------------------------------------

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

    # -------------------------------------------------
    # 9. GENERAL DOCUMENT INFORMATION
    # -------------------------------------------------

    documents = [
        "Identity proof",
        "Address proof",
        "Relevant supporting documents",
    ]

    # -------------------------------------------------
    # 10. GENERAL ELIGIBILITY INFORMATION
    # -------------------------------------------------

    eligibility = [
        "Personal circumstances",
        "Applicable scheme eligibility criteria",
        "Applicable government rules",
    ]

    # -------------------------------------------------
    # 11. DOCUMENT READINESS ENGINE
    # -------------------------------------------------

    required_documents = []

    if schemes:
        required_documents = schemes[0].get(
            "documents",
            []
        )

    document_readiness = build_document_readiness(
        required_documents=required_documents,
        available_documents=[],
    )

    # -------------------------------------------------
    # 12. SAVE ANONYMIZED DEMAND CATEGORY
    # -------------------------------------------------

    demand_record = DemandRecord(
        category=category
    )

    db.add(
        demand_record
    )

    db.commit()

    # -------------------------------------------------
    # 13. PROFILE SUMMARY
    # -------------------------------------------------

    profile_summary = None

    if profile:

        profile_summary = {
            "age": profile.age,
            "state": profile.state,
            "occupation": profile.occupation,
            "annual_income": profile.annual_income,
            "category": profile.category,
            "gender": profile.gender,
            "citizen_status": profile.citizen_status,
        }

    # -------------------------------------------------
    # 14. NEXT BEST ACTION ENGINE
    # -------------------------------------------------

    next_best_action = build_next_best_action(
        situation=situation,
        schemes=schemes,
        documents=[
            {
                "name": document,
                "status": "available",
            }
            for document in documents
        ],
    )

    # -------------------------------------------------
    # 15. OFFICIAL SOURCE
    # -------------------------------------------------

    official_source = None

    if schemes:
        official_source = schemes[0].get("url")

    # -------------------------------------------------
    # 16. FINAL RESPONSE
    # -------------------------------------------------

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

        "document_readiness": document_readiness,

        "eligibility": eligibility,

        "profile_used": profile_summary,

        "profile_indicators": profile_indicators,

        "official_source": official_source,

        "next_best_action": next_best_action,

        "status": "analysis_completed",
    }