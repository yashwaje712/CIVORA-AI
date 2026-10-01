from app.data.schemes import SCHEMES
from app.services.situation_engine import analyze_situation


def normalize_text(text: str) -> str:
    return text.lower().strip()


def find_matching_schemes(situation: str):
    if not situation or not situation.strip():
        return []

    situation_analysis = analyze_situation(situation)
    detected_needs = situation_analysis.get("needs", [])

    if not detected_needs:
        return []

    search_text = normalize_text(situation)
    matches = []

    for scheme in SCHEMES:
        supported_needs = scheme.get("supported_needs", [])

        matched_needs = [
            need
            for need in detected_needs
            if need in supported_needs
        ]

        matched_keywords = []

        for keyword in scheme.get("keywords", []):
            keyword_text = normalize_text(keyword)

            if keyword_text and keyword_text in search_text:
                matched_keywords.append(keyword)

        matched_keywords = list(dict.fromkeys(matched_keywords))

        # Strong matching:
        # A scheme must support at least one detected need.
        if not matched_needs:
            continue

        # Base score for each exact need match.
        score = len(matched_needs) * 5

        # Additional score for exact keywords from the situation.
        score += len(matched_keywords) * 2

        # Extra importance when the situation directly mentions
        # a specialist need such as artisan or street vending.
        if "artisan" in matched_needs:
            score += 3

        if "street_vending" in matched_needs:
            score += 3

        if "agriculture" in matched_needs:
            score += 2

        if "health" in matched_needs:
            score += 2

        matches.append(
            {
                "scheme": scheme,
                "score": score,
                "matched_keywords": matched_keywords,
                "matched_needs": matched_needs,
            }
        )

    matches.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    results = []

    for item in matches:
        scheme = item["scheme"].copy()

        scheme["match_score"] = item["score"]
        scheme["matched_keywords"] = item["matched_keywords"]
        scheme["matched_needs"] = item["matched_needs"]

        results.append(scheme)

    return results