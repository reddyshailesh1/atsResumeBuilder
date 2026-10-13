import re
from typing import Dict, List, Set, Any
from app.utils.text import normalize_term

# Curated tech keywords catalog for deterministic parsing
TECH_CATALOG = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "sql", "bash", "shell",
    # Frameworks & Libraries
    "react", "react.js", "next.js", "vue", "angular", "node.js", "express", "django",
    "fastapi", "flask", "spring", "spring boot", "asp.net", "ruby on rails", "graphql", "rest api",
    # Databases & Caching
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "cassandra",
    "dynamodb", "sqlite", "snowflake", "bigquery",
    # Cloud & DevOps
    "aws", "amazon web services", "gcp", "azure", "docker", "kubernetes", "k8s", "terraform",
    "ci/cd", "github actions", "gitlab ci", "jenkins", "ansible", "helm",
    # Tools, Queues, Architectures
    "kafka", "rabbitmq", "celery", "microservices", "distributed systems", "git",
    "linux", "system design", "agile", "scrum", "automated testing", "pytest", "jest"
}

class JobDescriptionParser:
    @staticmethod
    def parse(raw_text: str) -> Dict[str, Any]:
        if not raw_text or not raw_text.strip():
            return {
                "required_skills": [],
                "preferred_skills": [],
                "tools_and_tech": [],
                "experience_years": 0,
                "responsibilities": [],
            }

        lines = raw_text.splitlines()
        text_lower = raw_text.lower()

        # 1. Experience Years Detection
        exp_years = 0
        exp_match = re.search(r"(\d+)\s*\+?\s*(?:-\s*\d+\s*)?years?", text_lower)
        if exp_match:
            try:
                exp_years = int(exp_match.group(1))
            except (ValueError, IndexError):
                exp_years = 0

        # 2. Section Partitioning (Required vs Preferred)
        required_section_text = ""
        preferred_section_text = ""
        current_section = "required"

        for line in lines:
            line_clean = line.strip().lower()
            if any(term in line_clean for term in ["preferred", "nice to have", "plus", "bonus", "desirable"]):
                current_section = "preferred"
            elif any(term in line_clean for term in ["requirements", "qualifications", "must have", "what you need", "who you are"]):
                current_section = "required"

            if current_section == "preferred":
                preferred_section_text += " " + line
            else:
                required_section_text += " " + line

        # 3. Extract technical keywords from text
        matched_required: Set[str] = set()
        matched_preferred: Set[str] = set()
        matched_tools: Set[str] = set()

        for tech in TECH_CATALOG:
            # Word boundary regex search
            pattern = r"(?<!\w)" + re.escape(tech) + r"(?!\w)"
            norm = normalize_term(tech)

            if re.search(pattern, required_section_text, re.IGNORECASE):
                matched_required.add(norm)
            elif re.search(pattern, preferred_section_text, re.IGNORECASE):
                matched_preferred.add(norm)
            elif re.search(pattern, text_lower, re.IGNORECASE):
                matched_required.add(norm)

        # Distinguish tools vs core languages
        tools_set = {"docker", "kubernetes", "aws", "gcp", "azure", "git", "terraform", "ci/cd", "redis", "kafka", "pytest"}
        for skill in list(matched_required | matched_preferred):
            if skill in tools_set:
                matched_tools.add(skill)

        # Responsibilities sample lines
        resp_bullets: List[str] = []
        for line in lines:
            line_s = line.strip()
            if (line_s.startswith("-") or line_s.startswith("•") or line_s.startswith("*")) and len(line_s) > 15:
                resp_bullets.append(re.sub(r"^[-•*]\s*", "", line_s))

        return {
            "required_skills": sorted(list(matched_required)),
            "preferred_skills": sorted(list(matched_preferred)),
            "tools_and_tech": sorted(list(matched_tools)),
            "experience_years": exp_years,
            "responsibilities": resp_bullets[:5],
        }

jd_parser = JobDescriptionParser()
