from typing import Any, Dict, List, Optional


NSP_OTR_URL = (
    "https://scholarships.gov.in/otrapplication/#/login-page"
)


def build_next_best_action(
    situation: str,
    schemes: Optional[List[Dict[str, Any]]] = None,
    documents: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    CIVORA Next Best Action Engine.

    Determines the most useful next citizen action from:
    - citizen situation
    - matched schemes
    - document readiness

    This is an assistance recommendation only.
    It is NOT an official eligibility decision.
    """

    situation = (situation or "").strip()
    schemes = schemes or []
    documents = documents or []

    # ---------------------------------------------------------
    # No analysis / no scheme available
    # ---------------------------------------------------------

    if not situation or not schemes:
        return {
            "status": "waiting",
            "active": False,
            "title": "Describe your situation",
            "description": (
                "Tell CIVORA what is happening so the intelligence "
                "engine can identify your needs and relevant "
                "government assistance."
            ),
            "steps": [
                "Describe your situation",
                "Let CIVORA detect your needs",
                "Review relevant government assistance",
            ],
            "action": "Start Intelligence",
            "action_type": "analyze",
            "target": "assistance-finder",
            "scheme": None,
        }

    # ---------------------------------------------------------
    # Select primary matched scheme
    # ---------------------------------------------------------

    primary_scheme = schemes[0]

    scheme_name = (
        primary_scheme.get("name")
        or primary_scheme.get("scheme")
        or "matched government scheme"
    )

    official_url = (
        primary_scheme.get("url")
        or primary_scheme.get("official_url")
        or "https://www.myscheme.gov.in/"
    )

    matched_needs = primary_scheme.get(
        "matched_needs"
    ) or []

    # ---------------------------------------------------------
    # Analyse document signals
    # ---------------------------------------------------------

    ready_count = 0
    missing_count = 0

    for document in documents:
        if not isinstance(document, dict):
            continue

        status = str(
            document.get("status", "")
        ).lower().strip()

        if status in {
            "ready",
            "available",
            "verified",
        }:
            ready_count += 1

        elif status in {
            "missing",
            "not_available",
            "required",
        }:
            missing_count += 1

    document_count = len(documents)

    # ---------------------------------------------------------
    # Document action
    # ---------------------------------------------------------

    if missing_count > 0:

        document_action = {
            "title": "Prepare missing documents",
            "description": (
                f"CIVORA found {missing_count} document signal"
                f"{'s' if missing_count != 1 else ''} "
                "that may need attention before moving forward."
            ),
            "action": "Review Documents",
            "action_type": "document_check",
            "target": "document-readiness",
        }

    elif document_count > 0 and ready_count == document_count:

        document_action = {
            "title": "Documents are ready for review",
            "description": (
                "Your currently available document signals are marked "
                "as ready. Verify the final scheme-specific requirements "
                "before applying."
            ),
            "action": "Review Documents",
            "action_type": "document_check",
            "target": "document-readiness",
        }

    else:

        document_action = {
            "title": "Review required documents",
            "description": (
                "Review the documents required by the matched scheme "
                "before moving toward application."
            ),
            "action": "Review Documents",
            "action_type": "document_check",
            "target": "document-readiness",
        }

    # ---------------------------------------------------------
    # Special action for National Scholarship Portal
    # ---------------------------------------------------------

    if (
        "National Scholarship Portal" in scheme_name
        or scheme_name == "NSP"
    ):

        if missing_count > 0:

            return {
                "status": "ready",
                "active": True,
                "title": "Prepare your documents first",
                "description": (
                    "CIVORA identified the National Scholarship Portal "
                    "as a potential match. Some document signals need "
                    "attention before moving toward the NSP application."
                ),
                "steps": [
                    "Review missing document signals",
                    "Prepare the required documents",
                    "Generate your 14-digit NSP OTR",
                    "Check scholarships available for Academic Year 2026-27",
                    "Verify the latest requirements on the official NSP portal",
                ],
                "action": document_action["action"],
                "action_type": document_action["action_type"],
                "target": document_action["target"],
                "scheme": {
                    "name": scheme_name,
                    "url": official_url,
                    "matched_needs": matched_needs,
                },
            }

        return {
            "status": "ready",
            "active": True,
            "title": "Get your NSP OTR first",
            "description": (
                "CIVORA identified the National Scholarship Portal as a "
                "potential match. Your current document signals are ready "
                "for review. The next practical step is to generate your "
                "One Time Registration (OTR), then review scholarship "
                "options and eligibility for Academic Year 2026-27."
            ),
            "steps": [
                "Generate your 14-digit NSP OTR",
                "Check scholarships available for Academic Year 2026-27",
                "Review your document readiness",
                "Verify the latest requirements on the official NSP portal",
            ],
            "action": "Generate NSP OTR",
            "action_type": "external_url",
            "target": NSP_OTR_URL,
            "scheme": {
                "name": scheme_name,
                "url": official_url,
                "matched_needs": matched_needs,
            },
        }

    # ---------------------------------------------------------
    # Generic matched-scheme action
    # ---------------------------------------------------------

    if missing_count > 0:

        return {
            "status": "ready",
            "active": True,
            "title": f"Prepare documents for {scheme_name}",
            "description": (
                f"CIVORA identified {scheme_name} as a potential match. "
                "Some document signals need attention before you move "
                "toward the application process."
            ),
            "steps": [
                f"Review {scheme_name} eligibility",
                "Prepare missing documents",
                "Verify the latest requirements on the official government portal",
            ],
            "action": "Review Documents",
            "action_type": "document_check",
            "target": "document-readiness",
            "scheme": {
                "name": scheme_name,
                "url": official_url,
                "matched_needs": matched_needs,
            },
        }

    # ---------------------------------------------------------
    # Generic ready-scheme action
    # ---------------------------------------------------------

    return {
        "status": "ready",
        "active": True,
        "title": f"Review {scheme_name}",
        "description": (
            f"CIVORA identified {scheme_name} as a potential match "
            "for your situation. Review the eligibility requirements, "
            "confirm document readiness and verify the latest "
            "information on the official government portal."
        ),
        "steps": [
            f"Review {scheme_name} eligibility",
            "Review your document readiness",
            "Verify the latest requirements on the official government portal",
        ],
        "action": "Open Official Portal",
        "action_type": "external_url",
        "target": official_url,
        "scheme": {
            "name": scheme_name,
            "url": official_url,
            "matched_needs": matched_needs,
        },
    }