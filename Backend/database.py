import hashlib
import secrets
import sqlite3
from typing import Optional, Tuple

DATABASE_NAME = "recruitment.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection


def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique cryptographic salt."""
    if not salt:
        salt = secrets.token_hex(16)
    hash_bytes = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000,
    )
    return hash_bytes.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verify a plain password against the stored hash and salt."""
    computed_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, stored_hash)


def _add_column_if_missing(cursor, table, column_definition):
    """Apply additive migrations safely for existing local SQLite databases."""
    column_name = column_definition.split()[0]
    columns = {
        row["name"]
        for row in cursor.execute(f"PRAGMA table_info({table})").fetchall()
    }
    if column_name not in columns:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column_definition}")


def create_tables():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'recruiter',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed default recruiter account if no users exist
    cursor.execute("SELECT COUNT(*) AS count FROM users")
    if cursor.fetchone()["count"] == 0:
        demo_pwd_hash, demo_salt = hash_password("admin123")
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, salt, role)
            VALUES (?, ?, ?, ?, ?)
        """, ("Admin Recruiter", "admin@example.com", demo_pwd_hash, demo_salt, "recruiter"))

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            resume_filename TEXT NOT NULL,
            resume_text TEXT NOT NULL,
            embedding TEXT
        )
    """)

    # Keep existing databases usable while adding the fields the portal needs.
    _add_column_if_missing(cursor, "candidates", "status TEXT NOT NULL DEFAULT 'New'")
    _add_column_if_missing(cursor, "candidates", "skills TEXT NOT NULL DEFAULT '[]'")
    _add_column_if_missing(cursor, "candidates", "experience REAL NOT NULL DEFAULT 0")
    _add_column_if_missing(cursor, "candidates", "summary TEXT")
    _add_column_if_missing(cursor, "candidates", "uploaded_at TEXT")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            embedding TEXT,
            skills TEXT,
            keywords TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS candidate_matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            candidate_id INTEGER NOT NULL,
            match_score REAL NOT NULL,
            semantic_score REAL NOT NULL,
            skill_score REAL NOT NULL,
            keyword_score REAL NOT NULL,
            matched_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(job_id, candidate_id),
            FOREIGN KEY (job_id) REFERENCES jobs(id),
            FOREIGN KEY (candidate_id) REFERENCES candidates(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interview_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_id INTEGER NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            FOREIGN KEY (job_id) REFERENCES jobs(id)
        )
    """)

    connection.commit()
    connection.close()
