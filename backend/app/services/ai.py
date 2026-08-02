import os
import json
import re
from typing import Dict, Any, List, Optional
from openai import OpenAI
from app.core.config import settings

# Initialize OpenAI Client (if key is set)
client = None
if settings.OPENAI_API_KEY:
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        print(f"Failed to initialize OpenAI client: {e}")

# Heuristic list of Action Verbs
ACTION_VERBS = [
    "led", "designed", "developed", "implemented", "managed", "created", "architected",
    "improved", "optimized", "increased", "reduced", "delivered", "coordinated", "collaborated",
    "integrated", "engineered", "streamlined", "accelerated", "deployed", "scaled", "automated"
]

# Common tech roles and their skills for recommendations/gaps
ROLE_SKILLS = {
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Angular", "Vue", "Redux", "Tailwind CSS", "Vite", "Next.js"],
    "Backend Developer": ["Python", "Node.js", "Express", "Django", "Flask", "FastAPI", "Go", "Java", "SQL", "PostgreSQL", "MongoDB", "REST API", "Docker"],
    "Full Stack Developer": ["React", "TypeScript", "Node.js", "Express", "FastAPI", "SQL", "PostgreSQL", "Git", "Docker", "AWS", "Tailwind CSS"],
    "Software Engineer": ["C++", "Java", "C#", "Go", "Python", "SQL", "Git", "Data Structures", "Algorithms", "Docker", "Linux"],
    "AI Engineer": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "spaCy", "OpenAI", "LLMs", "LangChain", "SQL"],
    "Machine Learning Engineer": ["Python", "R", "Scikit-Learn", "TensorFlow", "PyTorch", "MLOps", "Docker", "Kubernetes", "Data Analysis", "SQL"],
    "Data Analyst": ["Python", "R", "SQL", "Excel", "Tableau", "Power BI", "Pandas", "NumPy", "Data Visualization", "Statistics"],
    "Data Scientist": ["Python", "R", "SQL", "Machine Learning", "Statistics", "Pandas", "NumPy", "Scikit-Learn", "Deep Learning", "Data Analysis"],
    "DevOps Engineer": ["Linux", "Git", "Docker", "Kubernetes", "AWS", "Azure", "CI/CD", "Jenkins", "Terraform", "Ansible", "Bash", "Prometheus"],
    "QA Engineer": ["Selenium", "Cypress", "Postman", "Jest", "Manual Testing", "Automation Testing", "SQL", "Git", "Python", "QA Methodologies"]
}

# ----------------- Helper Heuristics (Deterministic Fallback) -----------------
def heuristic_ats_score(parsed_data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    # Calculate category scores
    formatting = 100
    sections = 100
    keywords = 0
    readability = 90
    grammar = 95
    action_verbs_score = 0
    experience_quality = 70
    project_quality = 70

    missing_sections = []
    missing_keywords = []
    suggestions = []

    # Check sections completeness
    critical_sections = ["skills", "education", "experience", "projects"]
    for sec in critical_sections:
        if not parsed_data.get(sec) or len(parsed_data.get(sec)) == 0:
            sections -= 25
            missing_sections.append(sec.capitalize())
            suggestions.append(f"Add a dedicated '{sec.capitalize()}' section to your resume.")

    # Check optional sections
    optional_sections = ["certifications", "languages", "achievements"]
    for sec in optional_sections:
        if not parsed_data.get(sec) or len(parsed_data.get(sec)) == 0:
            suggestions.append(f"Consider adding a '{sec.capitalize()}' section to stand out.")

    # Keywords score (based on skill count)
    skill_count = len(parsed_data.get("skills", []))
    if skill_count >= 10:
        keywords = 95
    elif skill_count >= 5:
        keywords = 75
    else:
        keywords = 45
        missing_keywords.extend(["Docker", "AWS", "TypeScript", "FastAPI", "CI/CD"])
        suggestions.append("Add relevant technology keywords corresponding to modern software engineering roles (e.g. AWS, CI/CD, TypeScript).")

    # Action Verbs check
    text_lower = raw_text.lower()
    verbs_found = [verb for verb in ACTION_VERBS if verb in text_lower]
    if len(verbs_found) >= 8:
        action_verbs_score = 100
    elif len(verbs_found) >= 4:
        action_verbs_score = 75
        suggestions.append("Incorporate more active power verbs in your job bullet points (e.g. 'Initiated', 'Architected', 'Automated').")
    else:
        action_verbs_score = 40
        suggestions.append("Your experience bullets seem passive. Rewrite descriptions starting each bullet point with a strong action verb.")

    # Quality of Experience & Projects
    exp_len = len(parsed_data.get("experience", []))
    if exp_len > 10:
        experience_quality = 90
    elif exp_len > 4:
        experience_quality = 80
    else:
        experience_quality = 60
        suggestions.append("Elaborate on your previous employment, detailing specific responsibilities and deliverables.")

    proj_len = len(parsed_data.get("projects", []))
    if proj_len > 5:
        project_quality = 90
    elif proj_len > 2:
        project_quality = 80
    else:
        project_quality = 55
        suggestions.append("Add 1-2 more engineering projects showcasing your hands-on coding and systems skills.")

    # Formatting and grammar heuristic checks
    if len(raw_text) > 8000:
        formatting -= 15
        suggestions.append("Your resume text is very long. Condense it to keep it under 2 pages (ideally 1 page for less than 5 years of experience).")
    
    if not parsed_data.get("email") or not parsed_data.get("phone"):
        formatting -= 20
        suggestions.append("Ensure your primary contact information (Email and Phone) is visible at the very top of your resume.")

    if not parsed_data.get("linkedin") or not parsed_data.get("github"):
        formatting -= 10
        suggestions.append("Include links to your professional profiles, such as LinkedIn and GitHub, to verify your background and work.")

    # Calculate overall ATS score
    ats_score = int(
        (formatting * 0.15) +
        (sections * 0.20) +
        (keywords * 0.20) +
        (readability * 0.10) +
        (grammar * 0.10) +
        (action_verbs_score * 0.10) +
        (experience_quality * 0.075) +
        (project_quality * 0.075)
    )
    ats_score = min(max(ats_score, 10), 100)

    return {
        "ats_score": ats_score,
        "category_scores": {
            "formatting": formatting,
            "sections": sections,
            "keywords": keywords,
            "readability": readability,
            "grammar": grammar,
            "action_verbs": action_verbs_score,
            "experience_quality": experience_quality,
            "project_quality": project_quality
        },
        "feedback": {
            "suggestions": suggestions,
            "missing_sections": missing_sections,
            "missing_keywords": missing_keywords
        }
    }

# ----------------- Public AI Service Interface -----------------

def analyze_resume_ats(parsed_data: Dict[str, Any], raw_text: str) -> Dict[str, Any]:
    if client:
        try:
            prompt = f"""
            Analyze the following resume parsed details and raw text for ATS compatibility.
            Return a JSON object containing:
            1. 'ats_score': an integer from 0 to 100.
            2. 'category_scores': dictionary with keys 'formatting', 'sections', 'keywords', 'readability', 'grammar', 'action_verbs', 'experience_quality', 'project_quality'.
            3. 'feedback': dictionary with keys 'suggestions' (list of strings), 'missing_sections' (list of strings), 'missing_keywords' (list of strings).

            Resume Parsed Data:
            {json.dumps(parsed_data)}

            Resume Text:
            {raw_text[:4000]}
            """
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert ATS (Applicant Tracking System) parser and resume optimizer. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"OpenAI analysis failed: {e}. Falling back to heuristics...")

    return heuristic_ats_score(parsed_data, raw_text)


def rewrite_resume_section(section_type: str, text: str) -> Dict[str, Any]:
    if client:
        try:
            prompt = f"""
            As an expert career coach, rewrite the following resume {section_type} text.
            Optimize it to sound professional, highlight measurable accomplishments, and add strong action verbs.
            Return a JSON object containing:
            1. 'rewritten_text': the optimized description
            2. 'action_verbs_added': list of new action verbs included
            3. 'improvements_made': list of key adjustments made
            
            Text:
            "{text}"
            """
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional resume writer. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"OpenAI rewriting failed: {e}. Falling back to template...")

    # Heuristic Fallback Rewrite
    improvements = ["Swapped weak verbs with high-impact industry verbs.", "Strengthened phrasing for professional delivery."]
    verbs = ["Optimized", "Architected", "Spearheaded"]
    
    clean_text = text.strip()
    if section_type.lower() == "summary":
        rewritten = f"Result-driven professional with hands-on experience spearheading key engineering deliverables. Adept at optimizing system performance, streamlining developer workflows, and building scalable cloud-native architectures."
    elif section_type.lower() == "project":
        rewritten = f"Spearheaded development of a high-performance scalable solution. Optimized microservices database queries, reducing response latencies by 35%. Implemented robust CI/CD pipelines to streamline deployments."
        verbs.extend(["Optimized", "Implemented"])
        improvements.append("Added quantified metrics (35% latency reduction) for measurable achievements.")
    else:  # Experience
        rewritten = f"Architected and deployed responsive enterprise features utilizing best-practice design patterns. Led a cross-functional agile squad of 4 developers to build, test, and release critical modules. Streamlined database indexing and API payloads, driving a 20% engagement boost."
        verbs.extend(["Architected", "Led", "Streamlined"])
        improvements.append("Defined team sizing metrics and highlighted collaborative leadership.")

    return {
        "rewritten_text": rewritten,
        "action_verbs_added": list(set(verbs)),
        "improvements_made": improvements
    }


def compare_resumes(parsed1: Dict[str, Any], parsed2: Dict[str, Any]) -> Dict[str, Any]:
    skills1 = set(parsed1.get("skills", []))
    skills2 = set(parsed2.get("skills", []))

    added_skills = list(skills2 - skills1)
    removed_skills = list(skills1 - skills2)
    common_skills = list(skills1 & skills2)

    score_1 = heuristic_ats_score(parsed1, str(parsed1))["ats_score"]
    score_2 = heuristic_ats_score(parsed2, str(parsed2))["ats_score"]

    better_resume = "Resume 1" if score_1 >= score_2 else "Resume 2"
    improvements = []
    if score_2 > score_1:
        improvements.append(f"Resume 2 is stronger because it lists {len(added_skills)} additional core skills: {', '.join(added_skills[:5])}.")
    else:
        improvements.append(f"Resume 1 has higher ATS readiness due to wider section coverage and keyword matching.")

    return {
        "score_1": score_1,
        "score_2": score_2,
        "added_skills": added_skills,
        "removed_skills": removed_skills,
        "common_skills": common_skills,
        "better_resume": better_resume,
        "suggested_improvements": improvements
    }


def match_job_description(parsed_data: Dict[str, Any], jd: str) -> Dict[str, Any]:
    if not jd:
        return {
            "match_percentage": 0,
            "ats_compatibility": 0,
            "missing_keywords": [],
            "missing_technical_skills": [],
            "suggestions": ["Please enter a job description to perform matching."]
        }

    if client:
        try:
            prompt = f"""
            Analyze the similarity between the parsed resume and the job description.
            Return a JSON object with:
            1. 'match_percentage': an integer from 0 to 100.
            2. 'ats_compatibility': an integer from 0 to 100.
            3. 'missing_keywords': list of key terms/words in JD missing in resume text.
            4. 'missing_technical_skills': list of tech skills missing.
            5. 'suggestions': list of recommendations for resume optimization.

            Resume Skills: {json.dumps(parsed_data.get('skills', []))}
            Job Description: {jd[:4000]}
            """
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional technical recruiter. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"OpenAI job match failed: {e}. Falling back to heuristics...")

    # Heuristic match
    skills = [s.lower() for s in parsed_data.get("skills", [])]
    jd_lower = jd.lower()

    # Find keywords in JD
    all_target_skills = []
    for role, role_skills in ROLE_SKILLS.items():
        all_target_skills.extend(role_skills)
    all_target_skills = list(set(all_target_skills))

    matched_skills = []
    missing_skills = []

    for skill in all_target_skills:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, jd_lower):
            if skill.lower() in skills:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)

    # Score calculation
    total_needed = len(matched_skills) + len(missing_skills)
    match_percentage = 40
    if total_needed > 0:
        match_percentage = int((len(matched_skills) / total_needed) * 100)
    
    match_percentage = min(max(match_percentage, 25), 95)
    ats_comp = min(max(match_percentage - 5, 20), 92)

    suggestions = []
    if missing_skills:
        suggestions.append(f"Incorporate missing core skills like {', '.join(missing_skills[:3])} into your skills section.")
    suggestions.append("Tailor your professional summary to echo the responsibilities highlighted in the job description.")
    suggestions.append("Modify project descriptions to utilize identical technologies listed in the requirements.")

    return {
        "match_percentage": match_percentage,
        "ats_compatibility": ats_comp,
        "missing_keywords": missing_skills[:6],
        "missing_technical_skills": missing_skills[:5],
        "suggestions": suggestions
    }


def recommend_job_roles(parsed_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    # Compare resume skills with each role's skills
    skills = set([s.lower() for s in parsed_data.get("skills", [])])
    recommendations = []

    for role, role_skills in ROLE_SKILLS.items():
        role_skills_set = set([s.lower() for s in role_skills])
        overlap = skills & role_skills_set
        
        # Calculate fit percentage
        match_pct = 30
        if role_skills_set:
            match_pct = int((len(overlap) / len(role_skills_set)) * 100)
        match_pct = min(max(match_pct, 15), 95)

        missing = list(role_skills_set - skills)
        missing_formatted = [s.capitalize() for s in missing]

        fit_reason = f"Based on your resume, you have strong hands-on experience with key tools including {', '.join(list(overlap)[:3] or ['foundational tools'])}. This aligns well with the core responsibilities of a {role}."

        roadmap = {
            "phase_1": f"Master {', '.join(missing_formatted[:2]) or 'advanced architectures'}.",
            "phase_2": "Build 2 showcase portfolio projects integrating these tools.",
            "phase_3": "Obtain cloud certifications or complete specialized online credentials."
        }

        recommendations.append({
            "role_name": role,
            "match_percentage": match_pct,
            "fit_reason": fit_reason,
            "missing_skills": missing_formatted,
            "learning_roadmap": roadmap
        })

    # Sort by match percentage desc
    recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
    return recommendations[:5]  # top 5 recommendations


def analyze_skill_gap(parsed_data: Dict[str, Any], target_role: str) -> Dict[str, Any]:
    skills = set([s.lower() for s in parsed_data.get("skills", [])])
    
    # Get role skills or fallback to general tech skills
    role_skills = ROLE_SKILLS.get(target_role, ["Python", "SQL", "Git", "Docker", "REST API"])
    role_skills_set = set([s.lower() for s in role_skills])

    current_skills_found = list(skills & role_skills_set)
    missing_skills_found = list(role_skills_set - skills)

    current_formatted = [s.capitalize() for s in current_skills_found]
    missing_formatted = [s.capitalize() for s in missing_skills_found]

    if not missing_formatted:
        missing_formatted = ["System Architecture", "Kubernetes", "Advanced CI/CD"]

    priority_map = []
    resources = []
    
    for s in missing_formatted:
        priority_map.append(s)
        resources.append({
            "skill": s,
            "course": f"Complete Guide to {s} on Udemy/Coursera",
            "link": f"https://www.coursera.org/search?query={s}"
        })

    estimated_time = f"{len(missing_formatted) * 3} weeks"

    return {
        "target_role": target_role,
        "current_skills": current_formatted,
        "missing_skills": missing_formatted,
        "learning_priority": priority_map,
        "learning_resources": resources,
        "estimated_time": estimated_time
    }


def generate_interview_questions(parsed_data: Dict[str, Any], target_role: str) -> List[Dict[str, Any]]:
    # Create list of customized interview questions based on targets and parsed skills
    skills_str = ", ".join(parsed_data.get("skills", ["Software Engineering"]))
    
    questions = [
        {
            "target_role": target_role,
            "category": "HR",
            "question": f"Why are you interested in joining as a {target_role}, and how do your skills in {skills_str} qualify you?",
            "sample_answer": f"I have a passion for building scalable solutions. My background with {skills_str} equips me with the technical capacity to hit the ground running and add immediate value.",
            "difficulty": "Easy",
            "evaluation_tips": "Look for alignment between their skills and the job's core scope. Check for clear communication."
        },
        {
            "target_role": target_role,
            "category": "Behavioral",
            "question": "Can you describe a challenging engineering project you led and how you resolved technical roadblocks?",
            "sample_answer": "In my last project, we faced a major bottleneck in API loading times. I analyzed the database indexes, refactored raw query loops, and managed to speed up the process by 40% using asynchronous handlers.",
            "difficulty": "Medium",
            "evaluation_tips": "Look for use of the STAR method (Situation, Task, Action, Result) and strong personal accountability."
        },
        {
            "target_role": target_role,
            "category": "Technical",
            "question": f"How do you design for scalability and handles data caching in applications running {skills_str}?",
            "sample_answer": "I implement multi-level caching strategies. Using Redis for session/endpoint caching, combined with indexed database tables, keeps database read stresses minimized under high traffic load.",
            "difficulty": "Medium",
            "evaluation_tips": "Check for correct architecture terminologies (Redis, CDN, indexing, connection pooling)."
        },
        {
            "target_role": target_role,
            "category": "Coding",
            "question": "Write a function to find the longest common prefix string amongst an array of strings. What is its time complexity?",
            "sample_answer": "def longestCommonPrefix(strs):\n    if not strs: return ''\n    prefix = strs[0]\n    for s in strs[1:]:\n        while not s.startswith(prefix):\n            prefix = prefix[:-1]\n            if not prefix: return ''\n    return prefix\n\nTime complexity is O(S) where S is the sum of all characters in all strings.",
            "difficulty": "Hard",
            "evaluation_tips": "Ensure the candidate accounts for empty arrays, and identifies the correct space complexity O(1)."
        },
        {
            "target_role": target_role,
            "category": "System Design",
            "question": "Design a highly available resume uploading and analytical queue backend system that handles peak traffic spikes.",
            "sample_answer": "I would decouple the upload from the analysis using an asynchronous message broker (like RabbitMQ or AWS SQS). The file uploads directly to S3, writes metadata to PostgreSQL, pushes a task ID, and background workers process the files.",
            "difficulty": "Hard",
            "evaluation_tips": "Check for decouple structures, queues, background processing workers, and CDNs."
        }
    ]
    return questions
