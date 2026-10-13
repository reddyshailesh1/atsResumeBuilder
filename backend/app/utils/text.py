import re
from typing import Dict, List, Set, Tuple

# Comprehensive dictionary of technical and domain synonyms
SYNONYM_MAP: Dict[str, str] = {
    # Languages & Frameworks
    "js": "javascript",
    "ts": "typescript",
    "py": "python",
    "golang": "go",
    "postgres": "postgresql",
    "psql": "postgresql",
    "mongo": "mongodb",
    "k8s": "kubernetes",
    "reactjs": "react",
    "react.js": "react",
    "vuejs": "vue",
    "vue.js": "vue",
    "nextjs": "next.js",
    "nodejs": "node.js",
    "node": "node.js",
    "amazon web services": "aws",
    "google cloud platform": "gcp",
    "google cloud": "gcp",
    "microsoft azure": "azure",
    "restful": "rest api",
    "rest": "rest api",
    "rest apis": "rest api",
    "graphql": "graphql",
    "ci cd": "ci/cd",
    "continuous integration": "ci/cd",
    "continuous deployment": "ci/cd",
    "docker containers": "docker",
    "micro services": "microservices",
    "distributed systems": "distributed systems",
    "oop": "object-oriented programming",
    "tdd": "test-driven development",
    "unit test": "automated testing",
    "unit testing": "automated testing",
    "pytest": "automated testing",
}

# Strong action verbs for resumes
STRONG_ACTION_VERBS: Set[str] = {
    "accelerated", "achieved", "analyzed", "architected", "automated", "built",
    "championed", "collaborated", "compiled", "composed", "configured", "constructed",
    "consolidated", "converted", "created", "decreased", "delivered", "deployed",
    "designed", "developed", "devised", "diminished", "directed", "doubled",
    "drove", "eliminated", "enabled", "engineered", "enhanced", "established",
    "evaluated", "executed", "expanded", "expedited", "fabricated", "facilitated",
    "formulated", "generated", "guided", "implemented", "improved", "increased",
    "initiated", "instituted", "integrated", "invented", "launched", "lead",
    "led", "leveraged", "managed", "maximized", "mentored", "migrated",
    "minimized", "modernized", "monitored", "negotiated", "optimized", "orchestrated",
    "overhauled", "oversaw", "pioneered", "planned", "produced", "programmed",
    "quadrupled", "re-engineered", "rebuilt", "reduced", "refactored", "resolved",
    "restructured", "revamped", "scaled", "simplified", "spearheaded", "standardized",
    "streamlined", "strengthened", "surpassed", "trained", "transformed", "tripled",
    "upgraded", "validated", "yielded"
}

def normalize_term(term: str) -> str:
    cleaned = re.sub(r"[^\w\s\.\+#/-]", "", term.lower()).strip()
    return SYNONYM_MAP.get(cleaned, cleaned)

def tokenize_words(text: str) -> List[str]:
    return [w.lower() for w in re.findall(r"\b[a-zA-Z0-9_\+#\.\/-]+\b", text)]

def contains_quantifiable_metric(text: str) -> bool:
    # Look for numbers, percentages, currency, multipliers (e.g. 20%, $5M, 10x, 50,000 users)
    patterns = [
        r"\b\d+%",                          # 25%
        r"[\$€£]\s*\d+",                    # $100k
        r"\b\d+\s*(?:k|m|b|million|billion|thousand)\b",  # 10M
        r"\b\d+x\b",                        # 3x
        r"\b\d{2,}\b",                      # numbers with 2+ digits: 40, 500, 1000
    ]
    for pattern in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def starts_with_action_verb(text: str) -> Tuple[bool, str]:
    words = re.findall(r"\b[a-zA-Z-]+\b", text.strip())
    if not words:
        return False, ""
    first_word = words[0].lower()
    if first_word in STRONG_ACTION_VERBS:
        return True, first_word
    # Also check if ends with 'ed'
    if first_word.endswith("ed") and len(first_word) > 4:
        return True, first_word
    return False, first_word
