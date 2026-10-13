import io
from typing import Dict, Any
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

class DocxGenerationService:
    @staticmethod
    def generate_docx(resume_data: Dict[str, Any]) -> bytes:
        doc = Document()

        # Set page margins (0.7 inch for ATS balance)
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(0.65)
            section.bottom_margin = Inches(0.65)
            section.left_margin = Inches(0.7)
            section.right_margin = Inches(0.7)

        contact = resume_data.get("contact", {})
        styling = resume_data.get("styling", {})
        summary = resume_data.get("summary", "")
        tech_skills = resume_data.get("technicalSkills", [])
        soft_skills = resume_data.get("softSkills", [])
        tools = resume_data.get("toolsAndPlatforms", [])
        experience = resume_data.get("workExperience", [])
        projects = resume_data.get("projects", [])
        education = resume_data.get("education", [])
        certifications = resume_data.get("certifications", [])

        # Default typography
        font_family = "Calibri"
        font_size_pt = float(styling.get("fontSizePt", 10.5))

        # Base style settings
        normal_style = doc.styles["Normal"]
        normal_style.font.name = font_family
        normal_style.font.size = Pt(font_size_pt)
        normal_style.font.color.rgb = RGBColor(0x11, 0x18, 0x27)

        # 1. Header: Full Name
        full_name = contact.get("fullName", "YOUR NAME").strip()
        name_p = doc.add_paragraph()
        name_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        name_p.paragraph_format.space_before = Pt(0)
        name_p.paragraph_format.space_after = Pt(2)
        run_name = name_p.add_run(full_name.upper())
        run_name.font.size = Pt(20)
        run_name.font.bold = True
        run_name.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        # Headline
        headline = contact.get("headline", "").strip()
        if headline:
            head_p = doc.add_paragraph()
            head_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            head_p.paragraph_format.space_before = Pt(0)
            head_p.paragraph_format.space_after = Pt(3)
            run_head = head_p.add_run(headline)
            run_head.font.size = Pt(11)
            run_head.font.bold = True
            run_head.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

        # Contact line
        contact_items = []
        if contact.get("email"):
            contact_items.append(contact["email"])
        if contact.get("phone"):
            contact_items.append(contact["phone"])
        if contact.get("location"):
            contact_items.append(contact["location"])
        if contact.get("linkedin"):
            contact_items.append(contact["linkedin"])
        if contact.get("github"):
            contact_items.append(contact["github"])
        if contact.get("portfolio"):
            contact_items.append(contact["portfolio"])

        if contact_items:
            cont_p = doc.add_paragraph()
            cont_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cont_p.paragraph_format.space_before = Pt(0)
            cont_p.paragraph_format.space_after = Pt(10)
            run_cont = cont_p.add_run("  •  ".join(contact_items))
            run_cont.font.size = Pt(9.5)
            run_cont.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

        def add_heading(title: str):
            h_p = doc.add_paragraph()
            h_p.paragraph_format.space_before = Pt(8)
            h_p.paragraph_format.space_after = Pt(3)
            h_p.paragraph_format.keep_with_next = True
            run = h_p.add_run(title.upper())
            run.font.bold = True
            run.font.size = Pt(11.5)
            run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

            # Add bottom border under heading for clean ATS section division
            pPr = h_p._p.get_or_add_pPr()
            pBdr = OxmlElement('w:pBdr')
            bottom = OxmlElement('w:bottom')
            bottom.set(qn('w:val'), 'single')
            bottom.set(qn('w:sz'), '6')
            bottom.set(qn('w:space'), '1')
            bottom.set(qn('w:color'), 'CBD5E1')
            pBdr.append(bottom)
            pPr.append(pBdr)

        # 2. Professional Summary
        if summary.strip():
            add_heading("Professional Summary")
            sp = doc.add_paragraph()
            sp.paragraph_format.space_before = Pt(2)
            sp.paragraph_format.space_after = Pt(6)
            s_run = sp.add_run(summary.strip())
            s_run.font.size = Pt(font_size_pt)

        # 3. Technical Skills
        if tech_skills or tools or soft_skills:
            add_heading("Technical & Professional Skills")
            if tech_skills:
                kp = doc.add_paragraph()
                kp.paragraph_format.space_before = Pt(1)
                kp.paragraph_format.space_after = Pt(2)
                r_label = kp.add_run("Languages & Frameworks: ")
                r_label.font.bold = True
                kp.add_run(", ".join(tech_skills))

            if tools:
                tp = doc.add_paragraph()
                tp.paragraph_format.space_before = Pt(1)
                tp.paragraph_format.space_after = Pt(2)
                r_label = tp.add_run("Tools, Cloud & Databases: ")
                r_label.font.bold = True
                tp.add_run(", ".join(tools))

            if soft_skills:
                skp = doc.add_paragraph()
                skp.paragraph_format.space_before = Pt(1)
                skp.paragraph_format.space_after = Pt(4)
                r_label = skp.add_run("Core Competencies: ")
                r_label.font.bold = True
                skp.add_run(", ".join(soft_skills))

        # 4. Work Experience
        if experience:
            add_heading("Work Experience")
            for exp in experience:
                comp_p = doc.add_paragraph()
                comp_p.paragraph_format.space_before = Pt(4)
                comp_p.paragraph_format.space_after = Pt(1)
                comp_p.paragraph_format.keep_with_next = True

                pos_run = comp_p.add_run(exp.get("position", ""))
                pos_run.font.bold = True
                pos_run.font.size = Pt(font_size_pt + 0.5)

                comp_p.add_run(f" | {exp.get('company', '')}")

                # Dates & Location
                date_str = f"{exp.get('startDate', '')} – {('Present' if exp.get('current') else exp.get('endDate', ''))}"
                loc_str = exp.get("location", "")
                meta_str = f" ({loc_str} • {date_str})" if loc_str else f" ({date_str})"
                meta_run = comp_p.add_run(meta_str)
                meta_run.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
                meta_run.font.size = Pt(9.5)

                highlights = exp.get("highlights", [])
                for hl in highlights:
                    if hl.strip():
                        bp = doc.add_paragraph(style="List Bullet")
                        bp.paragraph_format.space_before = Pt(1)
                        bp.paragraph_format.space_after = Pt(1.5)
                        bp.add_run(hl.strip())

        # 5. Projects
        if projects:
            add_heading("Key Projects")
            for proj in projects:
                proj_p = doc.add_paragraph()
                proj_p.paragraph_format.space_before = Pt(4)
                proj_p.paragraph_format.space_after = Pt(1)
                proj_p.paragraph_format.keep_with_next = True

                name_run = proj_p.add_run(proj.get("name", ""))
                name_run.font.bold = True
                name_run.font.size = Pt(font_size_pt + 0.5)

                techs = proj.get("technologies", [])
                if techs:
                    t_run = proj_p.add_run(f" [{', '.join(techs)}]")
                    t_run.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
                    t_run.font.size = Pt(9.5)

                bullets = proj.get("bullets", [])
                for b in bullets:
                    if b.strip():
                        bp = doc.add_paragraph(style="List Bullet")
                        bp.paragraph_format.space_before = Pt(1)
                        bp.paragraph_format.space_after = Pt(1.5)
                        bp.add_run(b.strip())

        # 6. Education
        if education:
            add_heading("Education")
            for edu in education:
                ed_p = doc.add_paragraph()
                ed_p.paragraph_format.space_before = Pt(3)
                ed_p.paragraph_format.space_after = Pt(2)
                ed_run = ed_p.add_run(f"{edu.get('degree', '')} – {edu.get('institution', '')}")
                ed_run.font.bold = True

                dates = f" ({edu.get('startDate', '')} – {edu.get('endDate', '')})"
                if edu.get("gpa"):
                    dates += f" • GPA: {edu.get('gpa')}"
                sub_run = ed_p.add_run(dates)
                sub_run.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)
                sub_run.font.size = Pt(9.5)

        # 7. Certifications
        if certifications:
            add_heading("Certifications & Credentials")
            for cert in certifications:
                cp = doc.add_paragraph(style="List Bullet")
                cp.paragraph_format.space_before = Pt(1)
                cp.paragraph_format.space_after = Pt(1.5)
                c_run = cp.add_run(f"{cert.get('name', '')} – {cert.get('issuer', '')}")
                c_run.font.bold = True
                if cert.get("issueDate"):
                    cp.add_run(f" ({cert.get('issueDate')})")

        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        return file_stream.getvalue()

    @staticmethod
    def generate_plain_text(resume_data: Dict[str, Any]) -> str:
        contact = resume_data.get("contact", {})
        lines = []

        # Name & Headline
        if contact.get("fullName"):
            lines.append(contact["fullName"].upper())
        if contact.get("headline"):
            lines.append(contact["headline"])

        # Contact
        c_parts = [contact.get(k) for k in ["email", "phone", "location", "linkedin", "github"] if contact.get(k)]
        if c_parts:
            lines.append(" | ".join(c_parts))
        lines.append("")

        # Summary
        summary = resume_data.get("summary", "")
        if summary.strip():
            lines.append("PROFESSIONAL SUMMARY")
            lines.append("-" * 30)
            lines.append(summary.strip())
            lines.append("")

        # Skills
        tech = resume_data.get("technicalSkills", [])
        tools = resume_data.get("toolsAndPlatforms", [])
        if tech or tools:
            lines.append("TECHNICAL SKILLS")
            lines.append("-" * 30)
            if tech:
                lines.append(f"Languages & Frameworks: {', '.join(tech)}")
            if tools:
                lines.append(f"Tools & Platforms: {', '.join(tools)}")
            lines.append("")

        # Experience
        exp = resume_data.get("workExperience", [])
        if exp:
            lines.append("WORK EXPERIENCE")
            lines.append("-" * 30)
            for item in exp:
                pos = item.get("position", "")
                comp = item.get("company", "")
                dates = f"{item.get('startDate', '')} - {item.get('endDate', 'Present')}"
                lines.append(f"{pos} | {comp} ({dates})")
                for hl in item.get("highlights", []):
                    if hl.strip():
                        lines.append(f"  * {hl.strip()}")
                lines.append("")

        # Projects
        projs = resume_data.get("projects", [])
        if projs:
            lines.append("KEY PROJECTS")
            lines.append("-" * 30)
            for p in projs:
                lines.append(f"{p.get('name', '')} [{', '.join(p.get('technologies', []))}]")
                for b in p.get("bullets", []):
                    if b.strip():
                        lines.append(f"  * {b.strip()}")
                lines.append("")

        # Education
        edu = resume_data.get("education", [])
        if edu:
            lines.append("EDUCATION")
            lines.append("-" * 30)
            for e in edu:
                lines.append(f"{e.get('degree', '')} - {e.get('institution', '')} ({e.get('startDate', '')} - {e.get('endDate', '')})")
            lines.append("")

        return "\n".join(lines)
