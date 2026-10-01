VERIFIED_GOVERNMENT_SOURCES = [
    {
        "name": "National Scholarship Portal (NSP)",
        "url": "https://scholarships.gov.in/",
        "description": (
            "Official National Scholarship Portal of the Government of India "
            "for accessing scholarship schemes and related services."
        ),
        "type": "official_government_portal",
    },
    {
        "name": "myScheme",
        "url": "https://www.myscheme.gov.in/",
        "description": (
            "Government of India platform for discovering government schemes "
            "and checking scheme details."
        ),
        "type": "official_government_portal",
    },
    {
        "name": "PM-DAKSH",
        "url": "https://www.myscheme.gov.in/schemes/pm-daksh",
        "description": (
            "Official PM-DAKSH scheme information including eligibility, "
            "benefits and required documents."
        ),
        "type": "official_scheme_page",
    },
    {
        "name": "Kisan Credit Card",
        "url": "https://www.myscheme.gov.in/schemes/kcc",
        "description": (
            "Official Kisan Credit Card scheme information including "
            "eligibility and applicable requirements."
        ),
        "type": "official_scheme_page",
    },
    {
        "name": "Ayushman Bharat - PM-JAY",
        "url": "https://www.myscheme.gov.in/hi/schemes/ab-pmjay",
        "description": (
            "Official Ayushman Bharat PM-JAY scheme information."
        ),
        "type": "official_scheme_page",
    },
    {
        "name": "PM SVANidhi",
        "url": "https://www.myscheme.gov.in/schemes/pm-svanidhi",
        "description": (
            "Official PM SVANidhi scheme information for eligible "
            "street-vendor related support."
        ),
        "type": "official_scheme_page",
    },
    {
        "name": "PM Vishwakarma",
        "url": "https://www.myscheme.gov.in/schemes/pm-vishwakarma",
        "description": (
            "Official PM Vishwakarma scheme information for eligible "
            "traditional artisans and craftspeople."
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