import re
import uuid
from typing import Dict, List, Set, Any, Tuple
from app.utils.text import (
    normalize_term,
    tokenize_words,
    contains_quantifiable_metric,
    starts_with_action_verb,
)

class ATSScoringEngine:
    """
    Deterministic ATS Compatibility Scoring Engine.
    Maximum Score: 100 points
      - Category 1: Job-Relevant Skills (35 points)
      - Category 2: Experience & Evidence Quality (25 points)
      - Category 3: Resume Structure & Parsing (20 points)
      - Category 4: Readability & Contact Details (20 points)
    """

    def __init__(
        self,
        max_skills_pts: float = 35.0,
        max_experience_pts: float = 25.0,
        max_structure_pts: float = 20.0,
        max_readability_pts: float = 20.0,
    ):
        self.max_skills_pts = max_skills_pts
        self.max_experience_pts = max_experience_pts
        self.max_structure_pts = max_structure_pts
        self.max_readability_pts = max_readability_pts

    def score(
        self,
        resume_data: Dict[str, Any],
        parsed_job: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        findings: List[Dict[str, Any]] = []

        # -------------------------------------------------------------
        # Gather normalized resume skills & evidence corpus
        # -------------------------------------------------------------
        contact = resume_data.get("contact", {}) or {}
        summary = resume_data.get("summary", "") or ""
        tech_skills_raw = resume_data.get("technicalSkills", []) or []
        tools_raw = resume_data.get("toolsAndPlatforms", []) or []
        soft_skills_raw = resume_data.get("softSkills", []) or []
        work_exp = resume_data.get("workExperience", []) or []
        projects = resume_data.get("projects", []) or []
        education = resume_data.get("education", []) or []
        certifications = resume_data.get("certifications", []) or []
        page_target = resume_data.get("pageTarget", 1) or 1

        # Normalized Resume Skills Set
        all_resume_skills_raw = set(tech_skills_raw + tools_raw + soft_skills_raw)
        resume_skills_normalized: Set[str] = {normalize_term(s) for s in all_resume_skills_raw if s.strip()}

        # Experience & Projects Highlight Corpus (for evidence checking)
        experience_corpus = ""
        total_bullets = 0
        action_verb_bullet_count = 0
        quantified_bullet_count = 0

        for job in work_exp:
            for bullet in job.get("highlights", []) or []:
                if bullet.strip():
                    total_bullets += 1
                    experience_corpus += " " + bullet
                    has_verb, _ = starts_with_action_verb(bullet)
                    if has_verb:
                        action_verb_bullet_count += 1
                    if contains_quantifiable_metric(bullet):
                        quantified_bullet_count += 1

        for proj in projects:
            for bullet in proj.get("bullets", []) or []:
                if bullet.strip():
                    total_bullets += 1
                    experience_corpus += " " + bullet
                    has_verb, _ = starts_with_action_verb(bullet)
                    if has_verb:
                        action_verb_bullet_count += 1
                    if contains_quantifiable_metric(bullet):
                        quantified_bullet_count += 1

        evidence_words = set(tokenize_words(experience_corpus + " " + summary))

        # -------------------------------------------------------------
        # 1. Job-Relevant Skills (35 Points)
        # -------------------------------------------------------------
        skills_score = 0.0
        matched_skills: List[Dict[str, Any]] = []
        missing_skills: List[str] = []

        if parsed_job and (parsed_job.get("required_skills") or parsed_job.get("preferred_skills")):
            req_skills = [normalize_term(s) for s in parsed_job.get("required_skills", [])]
            pref_skills = [normalize_term(s) for s in parsed_job.get("preferred_skills", [])]
            all_target_skills = list(dict.fromkeys(req_skills + pref_skills))  # deduplicate preserving order

            req_weight = 25.0
            pref_weight = 10.0

            matched_req_count = 0
            for skill in req_skills:
                # Direct match or alias in resume skills or directly within evidence text
                is_in_skills = skill in resume_skills_normalized
                is_in_evidence = skill in evidence_words or normalize_term(skill) in evidence_words

                if is_in_skills and is_in_evidence:
                    status = "clearly_demonstrated"
                    matched_req_count += 1
                    matched_skills.append({
                        "skill": skill,
                        "matchedAs": skill,
                        "status": status,
                    })
                elif is_in_skills or is_in_evidence:
                    status = "weakly_supported"
                    matched_req_count += 0.6  # partial credit
                    matched_skills.append({
                        "skill": skill,
                        "matchedAs": skill,
                        "status": status,
                    })
                else:
                    missing_skills.append(skill)

            matched_pref_count = 0
            for skill in pref_skills:
                is_in_skills = skill in resume_skills_normalized
                is_in_evidence = skill in evidence_words
                if is_in_skills or is_in_evidence:
                    matched_pref_count += 1
                    matched_skills.append({
                        "skill": skill,
                        "matchedAs": skill,
                        "status": "clearly_demonstrated" if (is_in_skills and is_in_evidence) else "weakly_supported",
                    })
                else:
                    missing_skills.append(skill)

            # Calculate Skills Score
            if req_skills:
                skills_score += (min(matched_req_count, len(req_skills)) / len(req_skills)) * req_weight
            else:
                skills_score += req_weight

            if pref_skills:
                skills_score += (min(matched_pref_count, len(pref_skills)) / len(pref_skills)) * pref_weight
            else:
                skills_score += pref_weight

            # Findings for Skills
            if missing_skills:
                top_missing = missing_skills[:4]
                impact = min(len(top_missing) * 4, 15)
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "skills",
                    "severity": "critical" if len(missing_skills) > 3 else "warning",
                    "title": f"Missing {len(missing_skills)} Required / Preferred Skills",
                    "detail": f"The job posting explicitly looks for: {', '.join(top_missing)}. If you have hands-on experience with these, add them to your skills and experience bullets.",
                    "evidence": f"Target requirements: {', '.join(top_missing)}",
                    "suggested_action": f"Incorporate authentic experience with {top_missing[0]} if you possess it. Do not fabricate.",
                    "estimated_score_impact": impact,
                })

            weak_skills = [m["skill"] for m in matched_skills if m["status"] == "weakly_supported"]
            if weak_skills:
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "skills",
                    "severity": "suggestion",
                    "title": f"Weakly Supported Skills: {', '.join(weak_skills[:3])}",
                    "detail": "These skills appear in your skills list but are not mentioned inside your work experience accomplishments.",
                    "suggested_action": f"Provide concrete project or job bullets explaining how you applied {weak_skills[0]}.",
                    "estimated_score_impact": 4,
                })
        else:
            # General assessment when no JD is provided
            if len(resume_skills_normalized) >= 8:
                skills_score = 35.0
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "skills",
                    "severity": "positive",
                    "title": "Robust Technical Skills Portfolio",
                    "detail": f"Resume contains {len(resume_skills_normalized)} categorized technical competencies.",
                    "estimated_score_impact": 0,
                })
            elif len(resume_skills_normalized) >= 4:
                skills_score = 22.0
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "skills",
                    "severity": "suggestion",
                    "title": "Expand Technical Competencies",
                    "detail": f"Only {len(resume_skills_normalized)} skills listed. Include standard databases, platforms, and testing tools.",
                    "suggested_action": "Add key frameworks and databases you work with.",
                    "estimated_score_impact": 8,
                })
            else:
                skills_score = 10.0
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "skills",
                    "severity": "critical",
                    "title": "Critically Low Skills Count",
                    "detail": "ATS parsers heavily index the skills section for keyword extraction.",
                    "suggested_action": "Add your primary programming languages, cloud tools, and databases.",
                    "estimated_score_impact": 20,
                })

        # -------------------------------------------------------------
        # 2. Experience & Evidence Quality (25 Points)
        # -------------------------------------------------------------
        experience_score = 0.0

        # Sub-criterion A: Work Experience Depth (up to 10 pts)
        if len(work_exp) >= 2:
            experience_score += 10.0
        elif len(work_exp) == 1:
            experience_score += 6.0
        else:
            findings.append({
                "id": str(uuid.uuid4()),
                "category": "experience",
                "severity": "critical",
                "title": "No Work Experience Listed",
                "detail": "ATS parsers prioritize professional work experience and chronological history.",
                "suggested_action": "Add your current or past software roles or relevant internships.",
                "estimated_score_impact": 10,
            })

        # Sub-criterion B: Action Verbs (up to 8 pts)
        if total_bullets > 0:
            action_verb_ratio = action_verb_bullet_count / total_bullets
            verb_points = round(min(action_verb_ratio * 10, 8.0), 1)
            experience_score += verb_points

            if action_verb_ratio < 0.6:
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "experience",
                    "severity": "warning",
                    "title": "Weak Action Verbs in Bullets",
                    "detail": f"Only {action_verb_bullet_count} of {total_bullets} bullet points begin with a decisive action verb (e.g. 'Architected', 'Implemented').",
                    "suggested_action": "Rewrite passive bullets with active past-tense verbs using the AI Assistant.",
                    "estimated_score_impact": 5,
                })
        else:
            findings.append({
                "id": str(uuid.uuid4()),
                "category": "experience",
                "severity": "warning",
                "title": "No Accomplishment Bullets",
                "detail": "Role descriptions lack specific bulleted accomplishments.",
                "suggested_action": "Add 2-4 bullet points per position describing achievements.",
                "estimated_score_impact": 8,
            })

        # Sub-criterion C: Quantifiable Impact (up to 7 pts)
        if total_bullets > 0:
            metric_ratio = quantified_bullet_count / total_bullets
            metric_points = round(min(metric_ratio * 12, 7.0), 1)
            experience_score += metric_points

            if quantified_bullet_count < 2:
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "experience",
                    "severity": "warning",
                    "title": "Low Quantifiable Evidence",
                    "detail": "Recruiters and senior ATS matchers look for concrete numbers, scale, and performance indicators (e.g., 'reduced latency by 35%', '10M+ events/day').",
                    "suggested_action": "Add real percentages, team sizes, dollar amounts, or query speed improvements.",
                    "estimated_score_impact": 5,
                })
            else:
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "experience",
                    "severity": "positive",
                    "title": "Quantified Results Present",
                    "detail": f"Found {quantified_bullet_count} bullets with quantifiable metrics and data points.",
                    "estimated_score_impact": 0,
                })

        # -------------------------------------------------------------
        # 3. Resume Structure & Parsing Compatibility (20 Points)
        # -------------------------------------------------------------
        structure_score = 0.0

        # Sub-criterion A: Standard Section Headers (8 pts)
        recognized_sections = 0
        if work_exp:
            recognized_sections += 1
        if education:
            recognized_sections += 1
        if tech_skills_raw or tools_raw:
            recognized_sections += 1
        if summary.strip():
            recognized_sections += 1

        structure_score += min((recognized_sections / 4.0) * 8.0, 8.0)

        # Sub-criterion B: Chronological Date Parsing (6 pts)
        has_dates = True
        for job in work_exp:
            if not job.get("startDate") or (not job.get("endDate") and not job.get("current")):
                has_dates = False
                break
        
        if has_dates and work_exp:
            structure_score += 6.0
        elif not work_exp:
            structure_score += 2.0
        else:
            findings.append({
                "id": str(uuid.uuid4()),
                "category": "structure",
                "severity": "warning",
                "title": "Incomplete Employment Dates",
                "detail": "Some positions miss valid start or end dates. ATS timeline parsers may flag incomplete records.",
                "suggested_action": "Include Month Year (e.g., 'May 2021 – Present') for all roles.",
                "estimated_score_impact": 4,
            })

        # Sub-criterion C: ATS Single-Column Layout & Simplicity (6 pts)
        # ATS template is single-column, no tables
        structure_score += 6.0
        findings.append({
            "id": str(uuid.uuid4()),
            "category": "structure",
            "severity": "positive",
            "title": "ATS-Safe Linear Hierarchy",
            "detail": "Single-column linear layout prevents multi-column reading order confusion in ATS parsers.",
            "estimated_score_impact": 0,
        })

        # -------------------------------------------------------------
        # 4. Readability & Contact Details (20 Points)
        # -------------------------------------------------------------
        readability_score = 0.0

        # Sub-criterion A: Contact Essentials (10 pts)
        has_name = bool(contact.get("fullName", "").strip())
        has_email = "@" in contact.get("email", "")
        has_phone = bool(contact.get("phone", "").strip())
        has_location = bool(contact.get("location", "").strip())

        contact_pts = 0.0
        if has_name:
            contact_pts += 3.0
        if has_email:
            contact_pts += 3.0
        if has_phone:
            contact_pts += 2.0
        if has_location:
            contact_pts += 2.0

        readability_score += contact_pts

        if not (has_name and has_email and has_phone):
            findings.append({
                "id": str(uuid.uuid4()),
                "category": "readability",
                "severity": "critical",
                "title": "Missing Essential Contact Details",
                "detail": "Recruiters cannot contact candidates missing name, valid email, or phone number.",
                "suggested_action": "Ensure full name, phone number, and professional email are filled out.",
                "estimated_score_impact": 6,
            })

        # Sub-criterion B: Page Target & Conciseness (5 pts)
        # Total words count check
        total_words = len(tokenize_words(
            summary + " " + experience_corpus + " " + " ".join(tech_skills_raw)
        ))
        if page_target == 1:
            if 150 <= total_words <= 650:
                readability_score += 5.0
            elif total_words > 650:
                readability_score += 2.5
                findings.append({
                    "id": str(uuid.uuid4()),
                    "category": "readability",
                    "severity": "warning",
                    "title": "High Word Density for 1-Page Resume",
                    "detail": f"Resume contains ~{total_words} words. This risks overflowing 1 page or requiring micro fonts.",
                    "suggested_action": "Trim wordy bullets and keep bullet points between 25-45 words each.",
                    "estimated_score_impact": 3,
                })
            else:
                readability_score += 2.0
        else:
            # 2 page target
            if total_words >= 350:
                readability_score += 5.0
            else:
                readability_score += 3.0

        # Sub-criterion C: Summary Polish (5 pts)
        if len(summary.strip()) >= 50:
            readability_score += 5.0
        else:
            readability_score += 1.0
            findings.append({
                "id": str(uuid.uuid4()),
                "category": "readability",
                "severity": "suggestion",
                "title": "Missing or Short Professional Summary",
                "detail": "A targeted 3-4 sentence professional summary primes both human reviewers and ATS semantic classifiers.",
                "suggested_action": "Write a concise summary highlighting your specialty and core strengths.",
                "estimated_score_impact": 4,
            })

        # -------------------------------------------------------------
        # Total Overall Score
        # -------------------------------------------------------------
        total_raw = skills_score + experience_score + structure_score + readability_score
        overall_score = max(0, min(100, int(round(total_raw))))

        # Sort findings by estimated impact descending
        findings.sort(key=lambda x: x.get("estimated_score_impact", 0), reverse=True)

        # Summary text
        if overall_score >= 80:
            summary_text = f"Strong ATS Compatibility ({overall_score}/100). The resume demonstrates relevant skills and conforms to ATS parsing standards."
        elif overall_score >= 60:
            summary_text = f"Moderate Compatibility ({overall_score}/100). Notable keyword coverage, but evidence quality and missing requirements need refinement."
        else:
            summary_text = f"Low Compatibility ({overall_score}/100). Significant requirement gaps, missing bullet points, or incomplete contact details detected."

        return {
            "overall_score": overall_score,
            "skills_score": round(min(skills_score, self.max_skills_pts), 1),
            "experience_score": round(min(experience_score, self.max_experience_pts), 1),
            "structure_score": round(min(structure_score, self.max_structure_pts), 1),
            "readability_score": round(min(readability_score, self.max_readability_pts), 1),
            "summary": summary_text,
            "findings": findings,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
        }

ats_scorer = ATSScoringEngine()
