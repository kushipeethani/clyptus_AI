# Clyptus AI — Autonomous Talent Intelligence & Recruitment Platform

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.x-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Google_Gemini-Embeddings-4285F4.svg?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Groq_LLM-Llama_3.3_70B-F05032.svg?style=for-the-badge" alt="Groq" />
</p>

---

## 📌 Overview

**Clyptus AI** is an enterprise-grade, AI-driven recruitment and talent intelligence platform. It automates end-to-end resume parsing, semantic vector scoring, candidate matching against job descriptions, and custom AI interview preparation with precise 1-to-2 line questions and bullet-point ideal answers.

---

## ⚡ Core Features

- 🧠 **Neural Semantic Matching Engine**: 
  - 3-tier hybrid scoring: **60% Semantic Vector Similarity** + **30% Skill Alignment** + **10% Keyword Density**.
  - Powered by **Google Gemini** (`gemini-embedding-001`, 3072-dim) with offline fallback to **SentenceTransformers** (`all-MiniLM-L6-v2`).
- 📄 **Multi-Format Resume Parser**: 
  - Automated text, skills, experience, and contact info extraction from PDF, DOCX, and TXT files.
  - Automatic candidate deduplication and update tracking.
- 🎯 **AI Interview Question & Answer Generator**:
  - Generates tailored technical questions based on candidate resume and target job role.
  - Dynamically adjusts difficulty according to years of experience.
  - Formats questions (1–2 lines max) with concise 2–3 point model answers.
- 🏢 **Multi-User Workspace & Role Isolation**:
  - Secure PBKDF2-HMAC-SHA256 password hashing and token-based session auth.
  - Isolated candidate pools, job listings, and match results per recruiter.
- 🐳 **Containerized PostgreSQL Database**:
  - Runs on Docker with persistent volumes.
  - Auto-fallback to local SQLite if Docker is stopped.
- 🎨 **Futuristic Glassmorphism UI**:
  - Dark-mode interface built with React, Vite, TypeScript, and TailwindCSS.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, React Hook Form |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic |
| **Database** | PostgreSQL 16 (Docker) / SQLite (Fallback), `psycopg2-binary` |
| **Embeddings** | Google Gemini (`gemini-embedding-001`) / HuggingFace `all-MiniLM-L6-v2` |
| **LLM Inference** | Groq Cloud (`llama-3.3-70b-versatile`) |
| **Document Processing** | PyPDF, python-docx, pdfplumber, regex |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+ & npm](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Subham999100/AI-Recruitment-Portal.git
cd AI-Recruitment-Portal
```

---

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory:

```env
# Groq AI Key for Question Generation & Summaries
GROQ_API_KEY=your_groq_api_key_here

# Google Gemini API Key for Vector Embeddings
GEMINI_API_KEY=your_gemini_api_key_here

# Docker PostgreSQL Database URL
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/recruitment_db
```

---

### 3. Start Database (Docker)
Start the PostgreSQL container:

```bash
docker compose up -d
```
> **Note**: If Docker is not running, the application will automatically fall back to local `recruitment.db` SQLite storage.

---

### 4. Setup & Run Backend (FastAPI)

```bash
# Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python -m uvicorn Backend.main:app --host 127.0.0.1 --port 8000 --reload
```

- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### 5. Setup & Run Frontend (React + Vite)

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Structure

```text
KushiAI/
├── Backend/
│   ├── main.py            # FastAPI main application & API routing
│   ├── database.py        # PostgreSQL (Docker) & SQLite engine with adapters
│   ├── embeddings.py      # Google Gemini (3072d) & SentenceTransformers (384d)
│   ├── matching.py        # 3-tier neural candidate scoring algorithm
│   ├── resume.py          # Document parsing, metadata extraction & deduplication
│   └── job.py             # Job description parser & embedding generator
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI cards, tables, layouts & headers
│   │   ├── context/       # Auth context & session management
│   │   ├── pages/         # Landing, Login, Register, Dashboard, Candidates, Jobs
│   │   ├── services/      # Axios API services & auth interceptors
│   │   └── App.tsx        # Router and protected layout configurations
│   ├── package.json       # Frontend scripts and dependencies
│   └── vite.config.ts     # Vite configuration
├── docker-compose.yml     # PostgreSQL 16 container definition
├── requirements.txt       # Python backend dependencies
└── README.md              # Project documentation
```

---

## 🔑 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new recruiter account |
| `POST` | `/auth/login` | Recruiter authentication & token generation |
| `GET` | `/candidates` | Retrieve isolated candidate list for authenticated user |
| `POST` | `/resumes/upload` | Upload and auto-parse PDF/DOCX resume |
| `DELETE` | `/candidates/{id}`| Delete candidate details, matches, and uploaded files |
| `POST` | `/jobs` | Create a job description with vector embeddings |
| `GET` | `/matching/{job_id}` | Calculate top matching candidates for a job |
| `POST` | `/generate-questions` | Generate experience & resume-based interview Q&A |

---

## 🛡️ License

This project is licensed under the MIT License.
