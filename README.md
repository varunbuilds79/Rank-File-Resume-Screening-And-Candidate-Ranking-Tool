# 🚀 Rank&File — AI Resume Screening & Candidate Ranking System

An AI-powered recruitment automation and ATS optimization platform built with **FastAPI**, **Vanilla JavaScript**, and **Groq (LLaMA 3.3 70B)**. It decomposes candidate evaluation into an explainable 3-layer matching model, generates tailored resumes, and provides an interactive AI assistant for recruitment workflows.

---

## 🌟 Key Features

* **In-Memory PDF Parsing:** Extracts clean text directly from uploaded PDF resumes using `pypdf` without saving temporary files to disk.
* **Explainable 3-Layer Scoring Model:**
  * **50% Hard Skill Match:** Evaluates keyword overlap across a 12-domain technical taxonomy.
  * **30% Semantic Vector Similarity:** Uses TF-IDF cosine distance to measure contextual alignment.
  * **20% ATS Structural Audit:** Checks for standard section headers, contact information regex, and quantified metrics.
* **1-Click Resume Tailoring:** Injects missing target job requirements into the candidate's resume and exports an ATS-compliant `.txt` document.
* **Recruiter Ranking Portal:** Automatically ranks candidate pools in descending order and provides one-click CSV leaderboard exports.
* **Embedded AI Assistant:** Context-aware recruitment assistant powered by Groq's `llama-3.3-70b-versatile` model.

---

## 🏗️ Architecture & Tech Stack

* **Backend:** Python (FastAPI, Uvicorn, PyPDF, HTTPX)
* **Frontend:** Vanilla JavaScript, HTML5, Responsive CSS
* **NLP & Scoring:** Custom 12-Domain Technical Taxonomy, TF-IDF Cosine Similarity
* **LLM Engine:** Groq API (`llama-3.3-70b-versatile`)

---

## 🛠️ How to Run Locally (Localhost)

### 1. Prerequisites
* Python 3.9 or higher installed
* Git installed

### 2. Clone the Repository
```bash
git clone [https://github.com/varunbuilds79/Rank-File-Resume-Screening-And-Candidate-Ranking-Tool.git](https://github.com/varunbuilds79/Rank-File-Resume-Screening-And-Candidate-Ranking-Tool.git)
cd Rank-File-Resume-Screening-And-Candidate-Ranking-Tool
```

### 3. Install Required Dependencies
```bash
pip install fastapi uvicorn pypdf httpx jinja2 python-multipart
```

### 4. Configure Your Groq API Key
* **Windows (PowerShell):**
  ```powershell
  $env:GROQ_API_KEY="your_actual_groq_api_key"
  ```
* **macOS / Linux:**
  ```bash
  export GROQ_API_KEY="your_actual_groq_api_key"
  ```

### 5. Start the Local Server
```bash
python -m uvicorn app:app --reload --port 3000
```

### 6. Open the Application
Navigate to the local URL in your web browser:
```text
http://localhost:3000
```

---

## 📂 Project Presentation
* The project presentation slide deck is available directly in this repository root directory.
