import re


SITUATION_PATTERNS = {
    "employment": [
        "job",
        "jobless",
        "unemployed",
        "employment",
        "work",
        "career",
        "job search",
        "looking for work",
        "lost my job",
        "lost job",
    ],

    "skill_training": [
        "skill",
        "skills",
        "training",
        "skill training",
        "vocational training",
        "learn a skill",
        "learn skills",
    ],

    "education": [
        "student",
        "school",
        "college",
        "university",
        "education",
        "study",
        "studying",
        "tuition",
        "fees",
        "scholarship",
    ],

    "agriculture": [
        "farmer",
        "farming",
        "agriculture",
        "agricultural",
        "crop",
        "crops",
        "cultivation",
        "farm",
        "kisan",
    ],

    "health": [
        "health",
        "medical",
        "hospital",
        "treatment",
        "medicine",
        "doctor",
        "disease",
        "illness",
        "healthcare",
    ],

    "financial_difficulty": [
        "poor",
        "low income",
        "financial problem",
        "financial difficulty",
        "financially difficult",
        "no income",
        "little income",
        "money problem",
        "cannot afford",
        "cannot pay",
        "struggling financially",
        "need financial support",
        "financial support",
    ],

    "housing": [
        "house",
        "housing",
        "home",
        "rent",
        "homeless",
        "shelter",
        "housing problem",
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
        "small stall",
    ],

    "small_business": [
        "small business",
        "small shop",
        "small business owner",
        "business owner",
        "small entrepreneur",
        "self employment",
        "self-employment",
        "own business",
        "start a business",
        "starting a business",
    ],

    "artisan": [
        "artisan",
        "artisans",
        "craftsman",
        "craftsmen",
        "craftsperson",
        "traditional artisan",
        "traditional craft",
        "handicraft",
        "carpenter",
        "tailor",
        "barber",
        "potter",
        "mason",
        "goldsmith",
        "blacksmith",
        "cobbler",
        "washerman",
        "locksmith",
        "boat maker",
        "toy maker",
        "fishing net maker",
    ],
}


CATEGORY_NAMES = {
    "employment": "Employment",
    "skill_training": "Skill Training",
    "education": "Education",
    "agriculture": "Agriculture",
    "health": "Health",
    "financial_difficulty": "Financial Support",
    "housing": "Housing",
    "street_vending": "Street Vending",
    "small_business": "Small Business",
    "artisan": "Artisan & Traditional Trade",
}


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


def detect_needs(situation: str):
    text = normalize_text(situation)

    detected_needs = []

    for need, patterns in SITUATION_PATTERNS.items():
        for pattern in patterns:
            pattern_normalized = normalize_text(pattern)

            if pattern_normalized in text:
                detected_needs.append(need)
                break

    return detected_needs


def build_reason(need: str):
    reasons = {
        "employment": (
            "Your situation indicates a need related to employment "
            "or finding work."
        ),

        "skill_training": (
            "Your situation indicates a possible need for skill "
            "development or training."
        ),

        "education": (
            "Your situation indicates a need related to education, "
            "study or student support."
        ),

        "agriculture": (
            "Your situation indicates a need related to farming "
            "or agriculture."
        ),

        "health": (
            "Your situation indicates a need related to healthcare "
            "or medical support."
        ),

        "financial_difficulty": (
            "Your situation indicates possible financial difficulty "
            "or a need for financial support."
        ),

        "housing": (
            "Your situation indicates a possible housing or "
            "shelter-related need."
        ),

        "street_vending": (
            "Your situation indicates that you may be a street "
            "vendor or involved in street vending."
        ),

        "small_business": (
            "Your situation indicates a possible need related to "
            "running, starting or supporting a small business."
        ),

        "artisan": (
            "Your situation indicates that you may be an artisan "
            "or traditional craftsperson."
        ),
    }

    return reasons.get(
        need,
        "Your situation may relate to this assistance category."
    )


def analyze_situation(situation: str):
    cleaned_text = normalize_text(situation)

    if not cleaned_text:
        return {
            "situation": "",
            "needs": [],
            "categories": [],
            "reasons": [],
        }

    detected_needs = detect_needs(cleaned_text)

    categories = [
        CATEGORY_NAMES[need]
        for need in detected_needs
    ]

    reasons = [
        {
            "need": need,
            "category": CATEGORY_NAMES[need],
            "reason": build_reason(need),
        }
        for need in detected_needs
    ]

    return {
        "situation": situation.strip(),
        "needs": detected_needs,
        "categories": categories,
        "reasons": reasons,
    }