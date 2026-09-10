import json
import os
import re
import uuid

from Backend.database import get_db_connection
from Backend.embeddings import create_embedding
from Backend.pdf_parser import extract_text_from_pdf, extract_document_text


UPLOAD_FOLDER = "uploads/resumes"

KNOWN_SKILLS = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js",
    "FastAPI", "Django", "Flask", "SQL", "PostgreSQL", "MySQL",
    "MongoDB", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Machine Learning", "PyTorch", "TensorFlow", "Git", "REST API",
]


def extract_candidate_info(text):
    """
    Try to find the candidate's name and email from resume text.
    """

    lines = [line.strip() for line in text.splitlines() if line.strip()]

    name = lines[0] if lines else "Unknown"

    email_match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        text
    )

    email = email_match.group(0) if email_match else None

    return name, email


def extract_resume_metadata(text):
    normalized = text.lower()
    skills = [skill for skill in KNOWN_SKILLS if skill.lower() in normalized]
    experience_matches = re.findall(r"(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)", normalized)
    experience = max((float(value) for value in experience_matches), default=0)
    summary = " ".join(line.strip() for line in text.splitlines() if line.strip())[:600]
    return skills, experience, summary


def process_resume(file):
    """
    Process one resume and save it to the database.
    Supports PDF, DOCX, and TXT formats with robust error handling.
    """

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    raw_filename = file.filename or "resume.pdf"
    clean_filename = os.path.basename(raw_filename.strip().strip("\"'"))
    if not clean_filename:
        clean_filename = "resume.pdf"

    content = file.file.read()

    # Extract text from PDF, DOCX, or TXT
    resume_text = extract_document_text(clean_filename, content)

    if not resume_text:
        is_pdf_like = content.startswith(b"%PDF") or clean_filename.lower().endswith(".pdf")
        if is_pdf_like:
            raise ValueError(f"Could not extract readable text from '{clean_filename}'. Ensure the PDF contains selectable text.")
        raise ValueError(f"File '{clean_filename}' is not a valid PDF, DOCX, or TXT document.")

    # Determine extension and store file
    ext = os.path.splitext(clean_filename)[1].lower()
    if not ext:
        ext = ".pdf" if content.startswith(b"%PDF") else ".txt"
        clean_filename += ext

    stored_filename = f"{uuid.uuid4().hex}_{clean_filename}"
    file_path = os.path.join(UPLOAD_FOLDER, stored_filename)

    with open(file_path, "wb") as output_file:
        output_file.write(content)

    # Extract basic candidate information
    name, email = extract_candidate_info(resume_text)
    skills, experience, summary = extract_resume_metadata(resume_text)

    # Create embedding
    embedding = create_embedding(resume_text)

    # Save candidate
    connection = get_db_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO candidates
        (name, email, resume_filename, resume_text, embedding, skills, experience, summary, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        """,
        (
            name,
            email,
            stored_filename,
            resume_text,
            json.dumps(embedding),
            json.dumps(skills),
            experience,
            summary,
        )
    )

    candidate_id = cursor.lastrowid

    connection.commit()
    connection.close()

    return {
        "candidate_id": candidate_id,
        "filename": clean_filename,
        "name": name,
        "skills": skills,
        "experience": experience,
    }
