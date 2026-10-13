import io
from typing import Dict, Any, Tuple
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from pypdf import PdfReader

class PDFGenerationService:
    """
    ATS-Compliant Vector PDF Generation Service using ReportLab.
    Produces 100% selectable, unflattened vector text on standard A4 paper.
    Dynamically applies validated ResumeStyling parameters (colors, fonts, margins, order).
    Includes automated text extraction verification QA.
    """

    @staticmethod
    def generate_pdf(resume_data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()

        # Extract Styling configuration with robust fallbacks
        styling = resume_data.get("styling", {}) or {}

        # 1. Margins
        margin_size = styling.get("marginSize", "normal")
        margin_pts = 36  # Default 0.5 in
        if margin_size == "narrow":
            margin_pts = 26
        elif margin_size == "wide":
            margin_pts = 48

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            leftMargin=margin_pts,
            rightMargin=margin_pts,
            topMargin=margin_pts,
            bottomMargin=margin_pts,
        )

        styles = getSampleStyleSheet()

        # 2. Colors
        heading_color_hex = styling.get("headingColor", "#0f172a")
        accent_color_hex = styling.get("accentColor", "#2563eb")
        body_color_hex = styling.get("bodyColor", "#1e293b")

        # 3. Fonts (Map to ReportLab standard vector postscript fonts)
        font_family = styling.get("fontFamily", "inter").lower()
        if font_family in ["georgia", "garamond", "merriweather"]:
            base_font = "Times-Roman"
            bold_font = "Times-Bold"
            italic_font = "Times-Italic"
        else:
            base_font = "Helvetica"
            bold_font = "Helvetica-Bold"
            italic_font = "Helvetica-Oblique"

        # 4. Font Scaling & Leading
        font_scale = styling.get("fontScale", "normal")
        font_size_pt = styling.get("fontSizePt")

        if font_size_pt is not None:
            body_size = float(font_size_pt)
            body_lead = round(body_size * 1.35, 1)
            heading_size = round(body_size * 1.25, 1)
            heading_lead = round(heading_size * 1.25, 1)
            name_size = round(body_size * 1.9, 1)
            name_lead = round(name_size * 1.25, 1)
            space_after_sec = 3 if body_size <= 9.0 else (4 if body_size <= 11.0 else 5)
        elif font_scale == "compact":
            name_size, name_lead = 16, 19
            heading_size, heading_lead = 9.5, 12
            body_size, body_lead = 8.0, 10.5
            space_after_sec = 3
        elif font_scale == "spacious":
            name_size, name_lead = 20, 24
            heading_size, heading_lead = 11.5, 14
            body_size, body_lead = 9.0, 12.0
            space_after_sec = 5
        else:
            name_size, name_lead = 18, 22
            heading_size, heading_lead = 10.5, 13
            body_size, body_lead = 8.5, 11.5
            space_after_sec = 4

        # 5. Alignment
        header_align = styling.get("headerAlignment", "center")
        if header_align == "left":
            alignment_code = 0
        elif header_align == "right":
            alignment_code = 2
        else:
            alignment_code = 1

        body_align = styling.get("bodyAlignment", "left")
        if body_align == "right":
            body_alignment_code = 2
        elif body_align == "center":
            body_alignment_code = 1
        elif body_align == "justify":
            body_alignment_code = 4
        else:
            body_alignment_code = 0

        # Typography Styles
        name_style = ParagraphStyle(
            "ATS_Name",
            parent=styles["Normal"],
            fontName=bold_font,
            fontSize=name_size,
            leading=name_lead,
            alignment=alignment_code,
            textColor=colors.HexColor(heading_color_hex),
            spaceAfter=3,
        )

        contact_style = ParagraphStyle(
            "ATS_Contact",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=body_size,
            leading=body_lead,
            alignment=alignment_code,
            textColor=colors.HexColor("#475569"),
            spaceAfter=6,
        )

        heading_style_choice = styling.get("headingStyle", "bold_uppercase")
        heading_prefix = ""
        if heading_style_choice == "accent_bar":
            heading_prefix = f'<font color="{accent_color_hex}">▌</font> '

        section_heading_style = ParagraphStyle(
            "ATS_Heading",
            parent=styles["Normal"],
            fontName=bold_font,
            fontSize=heading_size,
            leading=heading_lead,
            alignment=body_alignment_code if body_alignment_code in [0, 1, 2] else 0,
            textColor=colors.HexColor(heading_color_hex),
            spaceBefore=5,
            spaceAfter=2,
        )

        body_style = ParagraphStyle(
            "ATS_Body",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=body_size,
            leading=body_lead,
            alignment=body_alignment_code,
            textColor=colors.HexColor(body_color_hex),
            spaceAfter=2,
        )

        subheading_style = ParagraphStyle(
            "ATS_Subheading",
            parent=styles["Normal"],
            fontName=bold_font,
            fontSize=heading_size - 1,
            leading=heading_lead - 1,
            textColor=colors.HexColor(heading_color_hex),
        )

        bullet_style_choice = styling.get("bulletStyle", "disc")
        bullet_symbol = "•"
        if bullet_style_choice == "hyphen":
            bullet_symbol = "-"
        elif bullet_style_choice == "square":
            bullet_symbol = "▪"
        elif bullet_style_choice == "circle":
            bullet_symbol = "○"

        bullet_style = ParagraphStyle(
            "ATS_Bullet",
            parent=styles["Normal"],
            fontName=base_font,
            fontSize=body_size,
            leading=body_lead,
            alignment=body_alignment_code,
            textColor=colors.HexColor(body_color_hex),
            leftIndent=12 if body_alignment_code == 0 else 0,
            firstLineIndent=-8 if body_alignment_code == 0 else 0,
            spaceAfter=1.5,
        )

        divider_style = styling.get("dividerStyle", "solid")

        def add_divider():
            if divider_style == "none":
                return Spacer(1, 2)
            elif divider_style == "thick":
                return HRFlowable(width="100%", thickness=1.2, color=colors.HexColor(heading_color_hex), spaceAfter=3)
            elif divider_style == "dashed":
                return HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#94a3b8"), spaceAfter=3, dash=[3, 3])
            else:
                return HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#cbd5e1"), spaceAfter=3)

        story = []

        # -------------------------------------------------------------
        # Header: Name & Contact Info
        # -------------------------------------------------------------
        contact = resume_data.get("contact", {}) or {}
        full_name = contact.get("fullName", "").strip() or "CANDIDATE NAME"
        story.append(Paragraph(full_name.upper(), name_style))

        headline = contact.get("headline", "").strip()
        if headline:
            headline_style = ParagraphStyle(
                "ATS_Headline",
                parent=styles["Normal"],
                fontName=bold_font,
                fontSize=body_size + 1,
                leading=body_lead + 1,
                alignment=alignment_code,
                textColor=colors.HexColor(accent_color_hex),
                spaceAfter=3,
            )
            story.append(Paragraph(headline, headline_style))

        contact_parts = []
        if contact.get("email"):
            contact_parts.append(contact.get("email"))
        if contact.get("phone"):
            contact_parts.append(contact.get("phone"))
        if contact.get("location"):
            contact_parts.append(contact.get("location"))
        if contact.get("linkedin"):
            contact_parts.append(contact.get("linkedin"))
        if contact.get("github"):
            contact_parts.append(contact.get("github"))
        if contact.get("portfolio"):
            contact_parts.append(contact.get("portfolio"))

        if contact_parts:
            story.append(Paragraph(" • ".join(contact_parts), contact_style))

        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor(accent_color_hex), spaceAfter=5))

        # -------------------------------------------------------------
        # Render Sections in Specified Section Order
        # -------------------------------------------------------------
        default_order = ["summary", "skills", "experience", "projects", "education", "certifications", "leadership", "languages"]
        order = styling.get("sectionOrder") or default_order

        # Section Render Functions
        def render_summary():
            summary = resume_data.get("summary", "").strip()
            if not summary:
                return
            h_text = "PROFESSIONAL SUMMARY" if heading_style_choice == "bold_uppercase" else "Professional Summary"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            story.append(Paragraph(summary, body_style))
            story.append(Spacer(1, space_after_sec))

        def render_skills():
            tech_skills = resume_data.get("technicalSkills", []) or []
            tools = resume_data.get("toolsAndPlatforms", []) or []
            soft_skills = resume_data.get("softSkills", []) or []
            if not (tech_skills or tools or soft_skills):
                return
            h_text = "TECHNICAL & PROFESSIONAL SKILLS" if heading_style_choice == "bold_uppercase" else "Technical & Professional Skills"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            if tech_skills:
                story.append(Paragraph(f"<b>Languages & Frameworks:</b> {', '.join(tech_skills)}", body_style))
            if tools:
                story.append(Paragraph(f"<b>Tools, Cloud & Databases:</b> {', '.join(tools)}", body_style))
            if soft_skills:
                story.append(Paragraph(f"<b>Core Competencies:</b> {', '.join(soft_skills)}", body_style))
            story.append(Spacer(1, space_after_sec))

        def render_experience():
            work_exp = resume_data.get("workExperience", []) or []
            if not work_exp:
                return
            h_text = "WORK EXPERIENCE" if heading_style_choice == "bold_uppercase" else "Work Experience"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            for job in work_exp:
                pos = job.get("position", "")
                comp = job.get("company", "")
                loc = job.get("location", "")
                start = job.get("startDate", "")
                end = "Present" if job.get("current") else job.get("endDate", "")

                header_text = f"<b>{pos}</b> | {comp}" + (f", {loc}" if loc else "")
                date_text = f"<i>{start} – {end}</i>" if start else ""
                story.append(Paragraph(f"{header_text} &nbsp;&nbsp;&nbsp;&nbsp; {date_text}", subheading_style))

                for bullet in job.get("highlights", []) or []:
                    if bullet.strip():
                        story.append(Paragraph(f"{bullet_symbol} {bullet.strip()}", bullet_style))
                story.append(Spacer(1, 2))
            story.append(Spacer(1, space_after_sec))

        def render_projects():
            projects = resume_data.get("projects", []) or []
            if not projects:
                return
            h_text = "KEY PROJECTS" if heading_style_choice == "bold_uppercase" else "Key Projects"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            for proj in projects:
                name = proj.get("name", "")
                role = proj.get("role", "")
                tech_list = proj.get("technologies", []) or []
                tech_str = f" [{', '.join(tech_list)}]" if tech_list else ""
                p_header = f"<b>{name}</b>" + (f" ({role})" if role else "") + tech_str
                story.append(Paragraph(p_header, subheading_style))

                for bullet in proj.get("bullets", []) or []:
                    if bullet.strip():
                        story.append(Paragraph(f"{bullet_symbol} {bullet.strip()}", bullet_style))
                story.append(Spacer(1, 2))
            story.append(Spacer(1, space_after_sec))

        def render_education():
            education = resume_data.get("education", []) or []
            if not education:
                return
            h_text = "EDUCATION" if heading_style_choice == "bold_uppercase" else "Education"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            for edu in education:
                degree = edu.get("degree", "")
                field = edu.get("fieldOfStudy", "")
                inst = edu.get("institution", "")
                start = edu.get("startDate", "")
                end = edu.get("endDate", "")
                gpa = edu.get("gpa", "")

                edu_title = f"<b>{degree}</b>" + (f" in {field}" if field else "")
                edu_inst = f"{inst}" + (f" | GPA: {gpa}" if gpa else "")
                dates = f"{start} – {end}" if start else ""
                story.append(Paragraph(f"{edu_title} | {edu_inst} &nbsp;&nbsp;&nbsp;&nbsp; <i>{dates}</i>", body_style))
            story.append(Spacer(1, space_after_sec))

        def render_certifications():
            certs = resume_data.get("certifications", []) or []
            if not certs:
                return
            h_text = "CERTIFICATIONS" if heading_style_choice == "bold_uppercase" else "Certifications"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            for cert in certs:
                c_name = cert.get("name", "")
                issuer = cert.get("issuer", "")
                date = cert.get("issueDate", "")
                story.append(Paragraph(f"<b>{c_name}</b> — {issuer} " + (f"({date})" if date else ""), body_style))
            story.append(Spacer(1, space_after_sec))

        def render_leadership():
            acts = resume_data.get("leadershipAndActivities", []) or []
            if not acts:
                return
            h_text = "LEADERSHIP & ACTIVITIES" if heading_style_choice == "bold_uppercase" else "Leadership & Activities"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            for act in acts:
                story.append(Paragraph(f"<b>{act.get('title')}</b> {act.get('subtitle', '')}", body_style))
            story.append(Spacer(1, space_after_sec))

        def render_languages():
            langs = resume_data.get("languages", []) or []
            if not langs:
                return
            h_text = "LANGUAGES" if heading_style_choice == "bold_uppercase" else "Languages"
            story.append(Paragraph(f"{heading_prefix}{h_text}", section_heading_style))
            story.append(add_divider())
            story.append(Paragraph(", ".join(langs), body_style))
            story.append(Spacer(1, space_after_sec))

        dispatch = {
            "summary": render_summary,
            "skills": render_skills,
            "experience": render_experience,
            "projects": render_projects,
            "education": render_education,
            "certifications": render_certifications,
            "leadership": render_leadership,
            "languages": render_languages,
        }

        # Render sections according to ordered keys
        for key in order:
            if key in dispatch:
                dispatch[key]()

        # Build document
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @classmethod
    def verify_pdf_extractability(cls, pdf_bytes: bytes, expected_name: str) -> Tuple[bool, str, int]:
        """
        Automated QA: Verifies that the PDF contains selectable text, extractable name,
        and parses into clean plain text via PyPDF.
        Returns: (is_valid, extracted_text_snippet, page_count)
        """
        try:
            reader = PdfReader(io.BytesIO(pdf_bytes))
            page_count = len(reader.pages)
            full_text = ""
            for page in reader.pages:
                extracted = page.extract_text() or ""
                full_text += extracted + "\n"

            if expected_name.lower() not in full_text.lower():
                return False, f"Candidate name '{expected_name}' not found in extracted PDF text.", page_count

            return True, full_text[:200], page_count
        except Exception as e:
            return False, f"PDF extraction failed with error: {str(e)}", 0

pdf_service = PDFGenerationService()
