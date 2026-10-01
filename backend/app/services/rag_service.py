from app.data.schemes import SCHEMES
from app.services.verified_sources import is_verified_source


def search_verified_schemes(situation: str):
    situation = situation.lower().strip()

    results = []

    for scheme in SCHEMES:
        score = 0
        matched_keywords = []

        for keyword in scheme["keywords"]:
            if keyword.lower() in situation:
                score += 1
                matched_keywords.append(keyword)

        if score > 0 and is_verified_source(
            scheme["official_url"]
        ):
            results.append(
                {
                    "scheme": scheme,
                    "score": score,
                    "matched_keywords": matched_keywords,
                    "verified": True,
                }
            )

    results.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    return results