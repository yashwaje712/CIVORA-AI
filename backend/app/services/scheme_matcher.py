from app.data.schemes import SCHEMES
from app.services.situation_engine import analyze_situation


def normalize_text(text: str) -> str:
    return text.lower().strip()


def find_matching_schemes(
    situation: str,
    profile=None
):
    if not situation or not situation.strip():
        return []

    situation_analysis = analyze_situation(
        situation
    )

    detected_needs = situation_analysis.get(
        "needs",
        []
    )

    if not detected_needs:
        return []

    search_text = normalize_text(
        situation
    )

    matches = []

    # -----------------------------------------------------
    # SPECIALIST NEED BOOSTS
    # -----------------------------------------------------

    specialist_boosts = {
        "artisan": 8,
        "street_vending": 8,
        "agriculture": 6,
        "health": 6,
        "education": 5,
        "housing": 5,
        "small_business": 5,
        "skill_training": 4,
        "employment": 3,
        "financial_difficulty": 2,
    }

    # -----------------------------------------------------
    # DIRECT SPECIALIST KEYWORDS
    # -----------------------------------------------------

    direct_specialist_keywords = {

        "artisan": [
            "artisan",
            "artisans",
            "craftsman",
            "craftsmen",
            "craftsperson",
            "traditional artisan",
            "traditional craft",
            "handicraft",
        ],

        "street_vending": [
            "street vendor",
            "street vendors",
            "street vending",
            "vendor",
            "vendors",
            "hawker",
            "hawkers",
            "thela",
            "stall",
        ],

        "agriculture": [
            "farmer",
            "farming",
            "agriculture",
            "agricultural",
            "crop",
            "crops",
            "cultivation",
            "kisan",
        ],

        "health": [
            "hospital",
            "treatment",
            "medical",
            "healthcare",
            "doctor",
            "medicine",
        ],

        "education": [
            "student",
            "school",
            "college",
            "university",
            "scholarship",
            "education",
            "study",
            "studying",
        ],

        "housing": [
            "house",
            "housing",
            "home",
            "homeless",
            "shelter",
            "rent",
        ],

        "small_business": [
            "small business",
            "small shop",
            "business owner",
            "own business",
            "entrepreneur",
            "self employment",
            "self-employed",
        ],
    }

    # -----------------------------------------------------
    # SCHEME MATCHING
    # -----------------------------------------------------

    for scheme in SCHEMES:

        supported_needs = scheme.get(
            "supported_needs",
            []
        )

        # -------------------------------------------------
        # 1. EXACT NEED MATCHING
        # -------------------------------------------------

        matched_needs = [
            need
            for need in detected_needs
            if need in supported_needs
        ]

        # -------------------------------------------------
        # 2. PM SVANIDHI CONTEXT FILTER
        # -------------------------------------------------

        # PM SVANidhi is specifically for street vendors.
        # Do not recommend it for generic financial difficulty.

        if (
            scheme.get("name") == "PM SVANidhi"
            and "street_vending" not in detected_needs
        ):
            continue

        if not matched_needs:
            continue

        # -------------------------------------------------
        # 3. KEYWORD MATCHING
        # -------------------------------------------------

        matched_keywords = []

        for keyword in scheme.get(
            "keywords",
            []
        ):

            keyword_text = normalize_text(
                keyword
            )

            if not keyword_text:
                continue

            if keyword_text in search_text:
                matched_keywords.append(
                    keyword
                )

        matched_keywords = list(
            dict.fromkeys(
                matched_keywords
            )
        )

        # -------------------------------------------------
        # 4. BASE SCORE
        # -------------------------------------------------

        score = 0

        # Every exact need match is strong evidence.
        score += len(matched_needs) * 10

        # Every matching keyword adds supporting evidence.
        score += len(matched_keywords) * 2

        # -------------------------------------------------
        # 5. SPECIALIST NEED BOOST
        # -------------------------------------------------

        for need in matched_needs:

            score += specialist_boosts.get(
                need,
                0
            )

        # -------------------------------------------------
        # 6. DIRECT KEYWORD BOOST
        # -------------------------------------------------

        # If the user explicitly mentions a
        # specialist identity/activity,
        # give the scheme extra weight.

        for need, keywords in direct_specialist_keywords.items():

            if need not in matched_needs:
                continue

            for keyword in keywords:

                if normalize_text(
                    keyword
                ) in search_text:

                    score += 5
                    break

        # -------------------------------------------------
        # 7. MULTI-NEED BONUS
        # -----------------------------------------------------

        # A scheme matching several detected needs
        # receives additional relevance weight.

        if len(matched_needs) >= 3:

            score += 6

        elif len(matched_needs) == 2:

            score += 3

        # -------------------------------------------------
        # 8. BUILD MATCH RESULT
        # -------------------------------------------------

        matches.append(
            {
                "scheme": scheme,
                "score": score,
                "matched_keywords": matched_keywords,
                "matched_needs": matched_needs,
            }
        )

    # -----------------------------------------------------
    # 9. SORT BY RELEVANCE
    # -----------------------------------------------------

    matches.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    # -----------------------------------------------------
    # 10. RETURN CLEAN RESULTS
    # -----------------------------------------------------

    results = []

    for item in matches:

        scheme = item["scheme"].copy()

        scheme["match_score"] = (
            item["score"]
        )

        scheme["matched_keywords"] = (
            item["matched_keywords"]
        )

        scheme["matched_needs"] = (
            item["matched_needs"]
        )

        results.append(
            scheme
        )

    return results