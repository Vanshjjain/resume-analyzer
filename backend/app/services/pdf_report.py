import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from typing import Dict, Any, List

def generate_pdf_report_bytes(
    user_name: str,
    resume_name: str,
    analysis: Dict[str, Any],
    roles: List[Dict[str, Any]],
    skills: Dict[str, Any],
    questions: List[Dict[str, Any]]
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#64748B'),
        spaceAfter=30
    )
    
    h1_style = ParagraphStyle(
        'HeadingSection',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SubHeadingSection',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor('#334155'),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#334155'),
        spaceAfter=8,
        leading=14
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    score_style = ParagraphStyle(
        'ScoreText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=36,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=10
    )

    story = []
    
    # --- Title Page / Header ---
    story.append(Paragraph("AI Resume Analysis & Career Report", title_style))
    story.append(Paragraph(f"Candidate: {user_name}  |  Resume: {resume_name}", subtitle_style))
    story.append(Spacer(1, 15))
    
    # --- ATS Score Section ---
    story.append(Paragraph("1. ATS Performance Score", h1_style))
    ats_score = analysis.get("ats_score", 0)
    story.append(Paragraph(f"{ats_score} / 100", score_style))
    
    # Category Scores Table
    cat_scores = analysis.get("category_scores", {})
    table_data = [["Evaluation Criteria", "Score"]]
    for cat, score in cat_scores.items():
        table_data.append([cat.replace("_", " ").capitalize(), f"{score}%"])
        
    t = Table(table_data, colWidths=[250, 100])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.HexColor('#0F172A')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))
    
    # Suggestions / Feedback
    story.append(Paragraph("ATS Feedback & Improvement Checklist:", h2_style))
    feedback = analysis.get("feedback", {})
    suggestions = feedback.get("suggestions", [])
    if suggestions:
        for sug in suggestions:
            story.append(Paragraph(f"&bull; {sug}", bullet_style))
    else:
        story.append(Paragraph("No critical issues found. Great job!", body_style))
        
    story.append(Spacer(1, 15))
    
    # Missing sections / keywords
    missing_kws = feedback.get("missing_keywords", [])
    if missing_kws:
        story.append(Paragraph(f"<b>Missing Keywords:</b> {', '.join(missing_kws)}", body_style))
        
    story.append(PageBreak())
    
    # --- Job Recommendations ---
    story.append(Paragraph("2. Career Fit & Job Recommendations", h1_style))
    story.append(Paragraph("Top matching career tracks based on parsed skills & achievements:", body_style))
    
    for r in roles[:3]:
        story.append(Paragraph(f"<b>{r.get('role_name')}</b> - {r.get('match_percentage')}% Match", h2_style))
        story.append(Paragraph(f"<i>Fit Context:</i> {r.get('fit_reason')}", body_style))
        missing = r.get("missing_skills", [])
        if missing:
            story.append(Paragraph(f"<b>Missing Skills:</b> {', '.join(missing[:5])}", body_style))
        story.append(Spacer(1, 10))
        
    story.append(PageBreak())
    
    # --- Skill Gap Analysis ---
    story.append(Paragraph("3. Skill Gap Analysis", h1_style))
    target_role = skills.get("target_role", "Target Role")
    story.append(Paragraph(f"Targeting Role: <b>{target_role}</b>", h2_style))
    story.append(Paragraph(f"Estimated training path duration: <b>{skills.get('estimated_time', 'N/A')}</b>", body_style))
    
    curr = skills.get("current_skills", [])
    miss = skills.get("missing_skills", [])
    
    story.append(Paragraph(f"<b>Current Skills matching role:</b> {', '.join(curr) if curr else 'None detected'}", body_style))
    story.append(Paragraph(f"<b>Skills needing development:</b> {', '.join(miss) if miss else 'None'}", body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Recommended Resources & Courses:", h2_style))
    resources = skills.get("learning_resources", [])
    for idx, res in enumerate(resources[:4]):
        story.append(Paragraph(f"<b>{idx+1}. {res.get('skill')}</b>: {res.get('course')}", bullet_style))
        
    story.append(PageBreak())
    
    # --- Interview Prep ---
    story.append(Paragraph("4. Recommended Interview Preparation Questions", h1_style))
    story.append(Paragraph("Tailored interview prompts generated specifically for your profile:", body_style))
    
    for q in questions[:4]:
        story.append(Paragraph(f"<b>Category:</b> {q.get('category')} | <b>Difficulty:</b> {q.get('difficulty')}", h2_style))
        story.append(Paragraph(f"<b>Q:</b> {q.get('question')}", body_style))
        story.append(Paragraph(f"<i>Suggested Answer Structure:</i> {q.get('sample_answer')}", body_style))
        story.append(Paragraph(f"<i>Evaluation Tip:</i> {q.get('evaluation_tips')}", body_style))
        story.append(Spacer(1, 12))
        
    # Build Document
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
