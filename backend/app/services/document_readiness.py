from typing import Any, Dict, List, Optional


def build_document_readiness(
    required_documents: Optional[List[str]] = None,
    available_documents: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    CIVORA Document Readiness Engine.

    Compares documents required by a matched government scheme
    with documents currently available from the citizen profile/session.

    This is a readiness indicator only.
    It is NOT an official eligibility or document-verification decision.
    """

    required_documents = required_documents or []
    available_documents = available_documents or []

    required_normalized = {
        str(document).strip().lower(): str(document).strip()
        for document in required_documents
        if str(document).strip()
    }

    available_normalized = {
        str(document).strip().lower(): str(document).strip()
        for document in available_documents
        if str(document).strip()
    }

    ready = []
    missing = []
    review = []

    for normalized_name, display_name in required_normalized.items():
        if normalized_name in available_normalized:
            ready.append({
                "name": display_name,
                "status": "ready",
            })
        else:
            missing.append({
                "name": display_name,
                "status": "missing",
            })

    total_required = len(required_normalized)
    total_ready = len(ready)

    if total_required == 0:
        readiness_level = "Not Available"
        readiness_message = (
            "Document requirements are not available yet. "
            "Check the official scheme source for the latest requirements."
        )
    elif total_ready == total_required:
        readiness_level = "Ready"
        readiness_message = (
            "The available document information covers the currently "
            "listed document requirements. Verify the latest requirements "
            "on the official government portal before applying."
        )
    elif total_ready > 0:
        readiness_level = "Partially Ready"
        readiness_message = (
            "Some document requirements appear to be available, "
            "but additional documents or verification may still be needed."
        )
    else:
        readiness_level = "Documents Needed"
        readiness_message = (
            "The currently available document information does not cover "
            "the listed requirements. Review and prepare the required documents."
        )

    return {
        "status": "success",
        "readiness_level": readiness_level,
        "message": readiness_message,
        "total_required": total_required,
        "total_ready": total_ready,
        "ready": ready,
        "missing": missing,
        "review": review,
        "disclaimer": (
            "Document readiness is an informational indicator. "
            "Final document requirements and acceptance are determined "
            "by the applicable government scheme or authority."
        ),
    }