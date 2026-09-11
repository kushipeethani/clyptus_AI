
import json
import os
import re
from typing import Optional, Dict, Any, List

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


# ============================================================
# GROQ CONFIGURATION
# ============================================================

DEFAULT_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)

SUPPORTED_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "qwen/qwen3.8-27b",
    "groq/compound-mini",
    "groq/compound",
]


# ============================================================
# GROQ CLIENT
# ============================================================

def get_groq_client(api_key: Optional[str] = None) -> OpenAI:
    """
    Returns an authenticated Groq client using its OpenAI-compatible API.

    Priority:
    1. API key passed directly
    2. GROQ_API_KEY from .env
    """

    key = api_key or os.getenv("GROQ_API_KEY")

    if not key or key.strip() == "":
        raise ValueError(
            "Groq API key is missing. "
            "Please set GROQ_API_KEY in your .env file."
        )

    return OpenAI(
        api_key=key.strip(),
        base_url="https://api.groq.com/openai/v1",
        timeout=90.0,
        max_retries=1,
    )


# ============================================================
# AVAILABLE MODELS
# ============================================================

def get_available_models(client: OpenAI) -> List[str]:
    """
    Query Groq for models currently available.
    """

    try:
        data = client.models.list().data
        return [m.id for m in data]
    except Exception:
        return SUPPORTED_MODELS


# ============================================================
# EXTRACT SKILLS AND KEYWORDS
# ============================================================

def extract_skills_and_keywords(
    job_description: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Extract technical skills and keywords from a job description
    using a Grok model.

    Falls back to regex extraction if the API fails.
    """

    try:
        client = get_groq_client(api_key)

        prompt = f"""Analyze this job description.

Extract:
1. Important technical skills
2. Important keywords

Return ONLY valid JSON in this exact format:

{{
    "skills": ["skill1", "skill2"],
    "keywords": ["keyword1", "keyword2"]
}}

Job Description:
{job_description}
"""

        response = client.chat.completions.create(
            model=DEFAULT_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError(
                "Groq returned an empty response."
            )

        return json.loads(content)

    except Exception:

        # ====================================================
        # FALLBACK REGEX EXTRACTION
        # ====================================================

        common_tech = [
            "python",
            "react",
            "fastapi",
            "typescript",
            "javascript",
            "docker",
            "kubernetes",
            "aws",
            "sql",
            "postgresql",
            "mongodb",
            "node",
            "ci/cd",
            "git",
            "machine learning",
            "rest api",
            "graphql",
            "tailwind"
        ]

        jd_lower = job_description.lower()

        found_skills = [
            skill
            for skill in common_tech
            if skill in jd_lower
        ]

        words = re.findall(
            r"\b[A-Za-z]{3,}\b",
            job_description
        )

        keywords = list(
            set(
                [
                    word
                    for word in words
                    if word.isupper() or len(word) > 6
                ]
            )
        )[:10]

        return {
            "skills": found_skills or [
                "general engineering",
                "problem solving"
            ],
            "keywords": keywords or [
                "collaboration",
                "architecture",
                "development"
            ]
        }


def _generate_calibrated_fallback_kit(
    job_title: str,
    job_description: str,
    candidate_name: str,
    candidate_resume: str,
    candidate_experience: float,
    exp_tier: str
) -> Dict[str, Any]:
    """Generates an algorithmic interview kit with concise questions (1-2 lines) and answers (2-3 points)."""
    extracted = extract_skills_and_keywords(job_description)
    skills = extracted.get("skills", ["Python", "FastAPI", "React", "System Architecture", "SQL"])
    primary_skill = skills[0].title() if skills else "Core Engineering"
    second_skill = skills[1].title() if len(skills) > 1 else "System Design"

    if candidate_experience < 3:
        q1 = f"How do you implement API endpoints in {primary_skill} and validate incoming request data?"
        a1 = f"• Use framework schema validators (like Pydantic in FastAPI) to sanitize and type-check payloads automatically.\n• Implement centralized exception handlers to return standard HTTP status codes (400 for bad input, 404 for missing resources).\n• Write unit tests with mock fixtures to verify positive and edge-case payload validation."
        
        q2 = f"In your projects with {second_skill}, how do you structure components and handle state effectively?"
        a2 = f"• Modularize components by separating UI presentation from state/business logic.\n• Manage local state with hooks and elevate shared state only when sibling components require it.\n• Handle loading, error, and empty states gracefully to maintain good user experience."
        
        q3 = f"What steps do you take when debugging an unexpected runtime error or crash in production?"
        a3 = f"• Check structured server logs and stack traces to isolate the exact failing line and inputs.\n• Reproduce the issue locally with a targeted test case replicating production conditions.\n• Deploy a fix with automated regression tests and verify resolution in staging before release."
        
        q4 = f"How do you prioritize your daily tasks when working on a new feature with tight deadlines?"
        a4 = f"• Break down requirements into small verifiable deliverables starting with core MVP functionality.\n• Communicate blockers early during standups to prevent workflow bottlenecks.\n• Follow code standards and automated linting to avoid accumulating avoidable rework."

    elif candidate_experience < 6:
        q1 = f"How do you optimize {primary_skill} service performance and prevent database N+1 query bottlenecks?"
        a1 = f"• Use query eager loading / joins and add composite database indexes on frequently filtered columns.\n• Implement Redis caching with TTL expiration for read-heavy and computationally expensive endpoints.\n• Profile database queries using APM tools to monitor p95 latency and slow query logs."
        
        q2 = f"Based on your resume experience in {second_skill}, how did you design data flow and component reusability?"
        a2 = f"• Designed modular, reusable abstractions following single-responsibility principles.\n• Utilized custom hooks and optimized memoization to prevent unnecessary re-renders.\n• Established consistent error boundaries and contract types across client-server boundaries."
        
        q3 = f"For a {job_title} role, how do you handle service failures and retry mechanisms gracefully?"
        a3 = f"• Implement circuit breaker patterns and exponential backoff with jitter on external API dependencies.\n• Use dead-letter queues (DLQs) in message brokers to isolate unprocessable events.\n• Ensure all mutations and webhook handlers are strictly idempotent via unique request keys."
        
        q4 = f"How do you balance shipping features quickly against managing technical debt?"
        a4 = f"• Negotiate MVP scope with product managers while maintaining non-negotiable test coverage.\n• Document technical debt explicitly in the backlog with estimated effort and business risks.\n• Dedicate 15-20% of sprint capacity to refactoring and performance enhancements."

    else:
        q1 = f"How would you architect a scalable, high-throughput {primary_skill} platform for {job_title}?"
        a1 = f"• Decouple compute and storage using event-driven architectures with Kafka/RabbitMQ for asynchronous processing.\n• Apply multi-tier caching (Edge CDN, distributed Redis cluster) with write-through/cache-aside strategies.\n• Implement horizontal auto-scaling and database sharding/read-replicas to sustain peak traffic spikes."
        
        q2 = f"Your resume highlights leading {second_skill} systems. What major architectural tradeoff did you decide on?"
        a2 = f"• Chose eventual consistency over strict two-phase locking to achieve 99.99% system availability.\n• Reduced p99 latency by 45% while establishing automated reconciliation jobs to resolve state discrepancies.\n• Validated design through canary rollouts, distributed tracing, and automated chaos testing."
        
        q3 = f"How do you safely decompose a monolithic system into microservices without downtime?"
        a3 = f"• Apply the Strangler Fig pattern with an API gateway routing traffic incrementally by domain context.\n• Synchronize legacy and new databases bi-directionally using Change Data Capture (CDC).\n• Validate new services using dark traffic/shadow reads before cutting over primary traffic."
        
        q4 = f"As a senior leader, how do you align engineering standards across multiple distributed teams?"
        a4 = f"• Establish clear RFC design doc reviews and automated CI/CD quality gates for linting, security, and tests.\n• Foster mentorship and knowledge sharing through regular architecture reviews and blameless post-mortems.\n• Align technical roadmap milestones directly with organizational business objectives."

    questions = [
        {
            "id": "q1",
            "category": "JD Technical",
            "difficulty": exp_tier,
            "question": q1,
            "answer": a1,
            "rationale": f"Evaluates core technical competency in {primary_skill} for the {job_title} position.",
            "whatToLookFor": [
                "Depth of technical mechanics and practical hands-on syntax",
                "Understanding of efficiency and reliability considerations",
                "Application of industry best practices"
            ],
            "followUpProbe": "What metrics would you monitor in production to ensure this remains reliable?"
        },
        {
            "id": "q2",
            "category": "Resume Deep-Dive",
            "difficulty": exp_tier,
            "question": q2,
            "answer": a2,
            "rationale": "Verifies practical implementation experience from candidate's resume.",
            "whatToLookFor": [
                "Clear explanation of personal contribution vs team effort",
                "Awareness of alternatives considered and reasons for choices",
                "Measurable outcomes and lessons learned"
            ],
            "followUpProbe": "What would you change if you had to build that system again today?"
        },
        {
            "id": "q3",
            "category": "Experience & Architecture",
            "difficulty": exp_tier,
            "question": q3,
            "answer": a3,
            "rationale": f"Calibrated for {exp_tier} level to assess problem-solving and architectural depth.",
            "whatToLookFor": [
                "Systematic diagnostic approach and mitigation strategies",
                "Understanding failure modes and resiliency patterns",
                "Balancing complexity with long-term maintainability"
            ],
            "followUpProbe": "How do you test this scenario before deploying to production?"
        },
        {
            "id": "q4",
            "category": "Behavioral & Leadership",
            "difficulty": exp_tier,
            "question": q4,
            "answer": a4,
            "rationale": "Assesses execution discipline, communication, and engineering maturity.",
            "whatToLookFor": [
                "Constructive cross-functional collaboration",
                "Proactive risk management and clear communication",
                "Commitment to sustainable engineering quality"
            ],
            "followUpProbe": "Can you share a specific time when this approach prevented a project delay?"
        }
    ]

    return {
        "jobTitle": job_title,
        "candidateName": candidate_name,
        "candidateExperience": candidate_experience,
        "matchedScore": min(95, max(65, int(70 + candidate_experience * 3))),
        "summary": f"Assessment kit for {candidate_name} applying for {job_title}. Calibrated to {candidate_experience} years of experience ({exp_tier}) based on resume skills and role specifications.",
        "questions": questions,
        "used_model": "Algorithmic Engine (Calibrated)"
    }


def _format_clean_answer(raw_answer: Any) -> str:
    """Ensures the answer is strictly 2 to 3 concise bullet points without introductory or concluding text."""
    if isinstance(raw_answer, list):
        items = [
            re.sub(r"^([0-9]+[\.\)]|[-*•])\s*", "", str(x)).strip()
            for x in raw_answer if str(x).strip()
        ]
        items = [
            i for i in items 
            if not re.search(r"^(an ideal answer|the candidate would|the candidate should|pick a concrete example|here are|candidate explains)", i, re.I)
        ]
        items = items[:3]
        if not items:
            items = ["Address key technical requirements and architectural trade-offs.", "Highlight concrete implementation details and test coverage."]
        return "\n".join(f"• {item}" for item in items)

    text = str(raw_answer or "").strip()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    
    points = []
    for line in lines:
        cleaned = re.sub(r"^([0-9]+[\.\)]|[-*•])\s*", "", line).strip()
        # Filter out meta/introductory/outro sentences
        if re.search(r"^(an ideal answer|the candidate would|the candidate should|pick a concrete example|here are|candidate explains|in this scenario|the candidate must)", cleaned, re.I):
            continue
        if cleaned:
            # Clean bold headers: e.g. "**Design phase** – " -> "Design phase: "
            cleaned = re.sub(r"\*\*([^*]+)\*\*\s*–?\s*", r"\1: ", cleaned)
            points.append(cleaned)

    if not points:
        # Fallback: split by sentences if no bullet lines found
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
        points = [
            s for s in sentences 
            if not re.search(r"^(an ideal answer|the candidate would|the candidate should|in summary)", s, re.I)
        ]

    # Limit to maximum 3 points, minimum 2
    points = points[:3]
    if len(points) == 1 and text:
        # if only one long sentence, try to split
        sub_sentences = [s.strip() for s in re.split(r";\s*|\.\s+", points[0]) if s.strip()]
        if len(sub_sentences) >= 2:
            points = sub_sentences[:3]

    if not points:
        points = ["Provide concrete technical architecture and trade-offs.", "Demonstrate practical error handling and production monitoring."]

    return "\n".join(f"• {p}" for p in points)


def _clean_single_line_question(raw_q: str) -> str:
    """Ensures question is a single clean line without newlines or redundant preamble."""
    q = str(raw_q or "").strip()
    q = " ".join(q.split())
    q = q.strip('"\'`')
    # If the question contains multi-sentence prefix like "Your resume highlights X. How would you...", keep the main question
    if re.search(r"^(Your resume (highlights|mentions|shows)|Based on your background)\b.*?[.?!]\s+", q, re.I):
        # Keep just the actual direct question part if it's long
        parts = re.split(r"(?<=[.?!])\s+", q, maxsplit=1)
        if len(parts) == 2 and len(q) > 110:
            q = parts[1]
    return q


def generate_interview_kit_llm(
    job_title: str,
    job_description: str,
    candidate_name: str,
    candidate_resume: str,
    candidate_experience: float,
    api_key: Optional[str] = None,
    model: str = DEFAULT_MODEL
) -> Dict[str, Any]:
    """
    Generate a tailored, calibrated interview kit using Groq LLM.
    
    Strict constraints:
    - Questions: Strictly ONE SINGLE LINE (short, direct, concise).
    - Answers: Exactly 2 to 3 concise bullet points with clear technical substance.
    - Tailored to: Candidate resume details and target job description.
    - Difficulty: Calibrated precisely to candidate's years of experience.
    """

    # ========================================================
    # EXPERIENCE CALIBRATION
    # ========================================================

    exp_years = float(candidate_experience)

    if exp_years >= 8:
        exp_tier = "Lead / Architect (8+ Yrs)"
        focus_guideline = (
            "Difficulty Level: LEAD / ARCHITECT (High Complexity).\n"
            "Focus on: High-level system architecture, distributed scalability, multi-service resilience, "
            "technical trade-offs, and engineering leadership."
        )
    elif exp_years >= 5:
        exp_tier = "Senior (5-8 Yrs)"
        focus_guideline = (
            "Difficulty Level: SENIOR (Advanced).\n"
            "Focus on: Deep technical mastery, concurrency, system design, failure handling, "
            "performance optimization, and production reliability."
        )
    elif exp_years >= 3:
        exp_tier = "Mid-Level (3-5 Yrs)"
        focus_guideline = (
            "Difficulty Level: MID-LEVEL (Moderate).\n"
            "Focus on: Clean code architecture, API design, real-world debugging, "
            "standard patterns, and independent feature delivery."
        )
    else:
        exp_tier = "Junior (0-2 Yrs)"
        focus_guideline = (
            "Difficulty Level: JUNIOR / ENTRY (Foundational).\n"
            "Focus on: Core language mechanics, fundamental syntax, basic troubleshooting, "
            "essential libraries, and structured problem-solving."
        )

    # If Groq client cannot be initialized due to missing API key, provide calibrated fallback
    try:
        client = get_groq_client(api_key)
    except Exception:
        return _generate_calibrated_fallback_kit(
            job_title, job_description, candidate_name, candidate_resume, candidate_experience, exp_tier
        )

    # ========================================================
    # SYSTEM PROMPT
    # ========================================================

    system_prompt = f"""You are an expert Technical Interviewer and Hiring Bar Raiser.

Generate an interview assessment kit based on the Candidate's Resume, the Target Job Role, and Experience Level.

Target Role: {job_title}
Candidate Name: {candidate_name}
Experience: {candidate_experience} Years ({exp_tier})

Seniority Calibration:
{focus_guideline}

CRITICAL RULES (STRICT ADHERENCE REQUIRED):
1. QUESTIONS MUST BE A SINGLE LINE ONLY:
   - Each question MUST be ONE short, direct question sentence on a SINGLE line.
   - Do NOT write long preambles, introductory context, or multi-sentence paragraphs.
   - Example Good: "How do you optimize FastAPI endpoints and database queries under high concurrent traffic?"
   - Example Bad: "Your resume highlights X where you worked on Y. In this scenario, describe how you would..."

2. ANSWERS MUST HAVE EXACTLY 2 TO 3 BULLET POINTS ONLY:
   - Provide strictly 2 or 3 concise bullet points (starting with "• ").
   - NEVER write introductory sentences (e.g. "An ideal answer would pick a concrete example...").
   - NEVER write concluding summaries (e.g. "The candidate should emphasize...").
   - Total bullet points must be 2 or 3 max.

3. ALIGNMENT: Questions must directly reflect the candidate's resume technologies and target job role.
4. DIFFICULTY: Calibrated to {exp_tier}.

CATEGORIES (4 questions total):
- "JD Technical"
- "Resume Deep-Dive"
- "Experience & Architecture"
- "Behavioral & Leadership"

Return ONLY valid JSON in this exact structure:
{{
  "jobTitle": "{job_title}",
  "candidateName": "{candidate_name}",
  "candidateExperience": {candidate_experience},
  "matchedScore": 85,
  "summary": "2-3 sentence executive summary of match and interview focus.",
  "questions": [
    {{
      "id": "q1",
      "category": "JD Technical",
      "difficulty": "{exp_tier}",
      "question": "Single line direct question here?",
      "answer": "• Key technical point 1\\n• Key technical point 2\\n• Key technical point 3",
      "rationale": "Short 1-line rationale.",
      "whatToLookFor": [
        "Key evaluation point 1",
        "Key evaluation point 2",
        "Key evaluation point 3"
      ],
      "followUpProbe": "Short 1-line follow-up probe."
    }}
  ]
}}
"""

    # ========================================================
    # USER PROMPT
    # ========================================================

    user_prompt = f"""Target Role:
{job_title}

Job Description Requirements:
{job_description}

Candidate Name:
{candidate_name}

Candidate Experience:
{candidate_experience} years

Candidate Resume / Background:
{candidate_resume}
"""

    # ========================================================
    # CALL GROQ
    # ========================================================

    selected_model = model or DEFAULT_MODEL
    if "llama" in selected_model:
        selected_model = DEFAULT_MODEL

    try:
        response = client.chat.completions.create(
            model=selected_model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.15,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content

        if not content:
            raise RuntimeError("Groq returned an empty response.")

        data = json.loads(content)
        
        # Post-process all questions and answers to guarantee strict adherence
        if "questions" in data and isinstance(data["questions"], list):
            for q in data["questions"]:
                q["question"] = _clean_single_line_question(q.get("question", ""))
                q["answer"] = _format_clean_answer(q.get("answer", ""))

        data["used_model"] = selected_model
        return data

    except Exception as e:
        # If API call fails at runtime, fall back gracefully
        fallback = _generate_calibrated_fallback_kit(
            job_title, job_description, candidate_name, candidate_resume, candidate_experience, exp_tier
        )
        for q in fallback.get("questions", []):
            q["question"] = _clean_single_line_question(q.get("question", ""))
            q["answer"] = _format_clean_answer(q.get("answer", ""))
        return fallback




