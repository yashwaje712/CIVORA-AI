VERIFIED_GOVERNMENT_SOURCES = [
    {
        "name": "myScheme",
        "url": "https://www.myscheme.gov.in/",
        "description": (
            "Government of India platform for discovering "
            "government schemes and checking scheme details."
        ),
        "type": "official_government_portal",
    },
    {
        "name": "National Scholarship Portal",
        "url": "https://scholarships.gov.in/",
        "description": (
            "Official scholarship portal providing access to "
            "eligible scholarship schemes."
        ),
        "type": "official_government_portal",
    },
    {
        "name": "PM-DAKSH",
        "url": "https://www.myscheme.gov.in/schemes/pm-daksh",
        "description": (
            "Official PM-DAKSH scheme information including "
            "eligibility, benefits and required documents."
        ),
        "type": "official_scheme_page",
    },
    {
        "name": "Kisan Credit Card",
        "url": "https://www.myscheme.gov.in/schemes/kcc",
        "description": (
            "Official Kisan Credit Card scheme information."
        ),
        "type": "official_scheme_page",
    },
    {
        "name": "Ayushman Bharat PM-JAY",
        "url": "https://www.myscheme.gov.in/hi/schemes/ab-pmjay",
        "description": (
            "Official Ayushman Bharat PM-JAY scheme information."
        ),
        "type": "official_scheme_page",
    },
]


def get_verified_sources():
    return VERIFIED_GOVERNMENT_SOURCES


def is_verified_source(url: str) -> bool:
    return any(
        source["url"] == url
        for source in VERIFIED_GOVERNMENT_SOURCES
    )