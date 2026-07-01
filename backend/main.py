import os
import re
import uuid
import shutil
import PyPDF2
import requests as http_requests
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

import bcrypt
from jose import JWTError, jwt

from langchain_cohere import ChatCohere
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

from database import init_db, get_db

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
JWT_SECRET     = os.getenv("JWT_SECRET", "changeme-use-a-long-random-string")
JWT_ALGORITHM  = "HS256"
JWT_EXPIRE_DAYS = 7
NEWS_API_KEY   = os.getenv("NEWS_API_KEY", "")

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ─────────────────────────────────────────────
# Auth helpers
# ─────────────────────────────────────────────

def hash_password(plain: str) -> str:
    pwd_bytes = plain.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain: str, hashed: str) -> bool:
    pwd_bytes = plain.encode('utf-8')
    hashed_bytes = hashed.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


def create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": user_id, "email": email, "exp": expire},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def get_current_user(authorization: str = Header(None)):
    """FastAPI dependency — extracts user_id from Bearer token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    return {"user_id": payload["sub"], "email": payload["email"]}


# ─────────────────────────────────────────────
# LLM setup
# ─────────────────────────────────────────────
llm = ChatCohere(cohere_api_key=COHERE_API_KEY)

compliance_prompt = PromptTemplate.from_template(
    """You are an AI Compliance Analyst.

Given the following technical or policy document, perform a full compliance analysis. Output in the following format:

1. ### Audit Report Summary:
- Description of what the document is.
- Any compliance violations or gaps found.

2. ### Compliance Readiness Scores (0-100%):
Provide a readiness score (as a percentage) for:
- SOC 2: [score]%
- GDPR: [score]%
- HIPAA: [score]%
- PCI DSS: [score]%

3. ### Issue Counts:
Provide the number of compliance issues found in the document:
- Critical Issues: [number]
- Moderate Issues: [number]
- Low Issues: [number]

4. ### AI Recommendations:
Give 3 specific, actionable recommendations to improve compliance based on the analysis.

--- DOCUMENT START ---
{input}
--- DOCUMENT END ---
"""
)
compliance_chain: RunnableSequence = compliance_prompt | llm

# ─────────────────────────────────────────────
# FastAPI app
# ─────────────────────────────────────────────
app = FastAPI(title="AICON Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://inspiring-taffy-0b1b22.netlify.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically (optional — for direct URL access)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.on_event("startup")
def startup():
    init_db()


# ─────────────────────────────────────────────
# Pydantic request models
# ─────────────────────────────────────────────
class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class AnalysisRequest(BaseModel):
    filePath: str        # relative path returned by /upload-file
    projectName: str
    industry: str
    user_id: str
    description: str


class ChatRequest(BaseModel):
    message: str
    report_id: str | None = None   # optional — attach a specific report as context


# ─────────────────────────────────────────────
# Auth endpoints
# ─────────────────────────────────────────────
@app.post("/auth/signup")
def signup(req: SignupRequest):
    db = get_db()
    try:
        existing = db.execute(
            "SELECT id FROM users WHERE email = ?", (req.email,)
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        db.execute(
            "INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, req.email, hash_password(req.password), req.full_name, now),
        )
        db.commit()
        token = create_token(user_id, req.email)
        return {
            "token": token,
            "user": {"id": user_id, "email": req.email, "full_name": req.full_name},
        }
    finally:
        db.close()


@app.post("/auth/login")
def login(req: LoginRequest):
    db = get_db()
    try:
        row = db.execute(
            "SELECT id, email, password_hash, full_name FROM users WHERE email = ?",
            (req.email,),
        ).fetchone()
        if not row or not verify_password(req.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token(row["id"], row["email"])
        return {
            "token": token,
            "user": {"id": row["id"], "email": row["email"], "full_name": row["full_name"]},
        }
    finally:
        db.close()


@app.get("/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        row = db.execute(
            "SELECT id, email, full_name, created_at FROM users WHERE id = ?",
            (current_user["user_id"],),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(row)
    finally:
        db.close()


# ─────────────────────────────────────────────
# File upload endpoint
# ─────────────────────────────────────────────
@app.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """Upload a compliance file. Saves to disk and records in DB."""
    user_id = current_user["user_id"]

    # Build a unique safe filename
    ext = os.path.splitext(file.filename or "file")[1].lower()
    stored_name = f"{uuid.uuid4()}{ext}"
    stored_path = os.path.join(UPLOAD_DIR, stored_name)

    try:
        with open(stored_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File save failed: {e}")

    # Record in DB
    file_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    db = get_db()
    try:
        db.execute(
            "INSERT INTO uploaded_files (id, user_id, original_name, stored_path, created_at) VALUES (?, ?, ?, ?, ?)",
            (file_id, user_id, file.filename, stored_path, now),
        )
        db.commit()
    finally:
        db.close()

    return {
        "id": file_id,
        "original_name": file.filename,
        "stored_path": stored_path,   # used as filePath in /analyze-project
    }


@app.delete("/upload-file/{file_id}")
def delete_file(file_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        row = db.execute(
            "SELECT stored_path, user_id FROM uploaded_files WHERE id = ?", (file_id,)
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="File not found")
        if row["user_id"] != current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Not your file")

        # Delete from disk
        if os.path.exists(row["stored_path"]):
            os.remove(row["stored_path"])

        db.execute("DELETE FROM uploaded_files WHERE id = ?", (file_id,))
        db.commit()
        return {"status": "deleted"}
    finally:
        db.close()


# ─────────────────────────────────────────────
# Compliance analysis endpoint
# ─────────────────────────────────────────────
def read_file_content(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
    elif ext in [".txt", ".md", ".tsx", ".js", ".py", ".html", ".ts", ".json", ".yaml", ".yml"]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    raise Exception(f"Unsupported file type: {ext}")


def parse_scores_and_recommendations(text: str) -> dict:
    def extract_score(label):
        match = re.search(fr"{label}.*?(\d+)%", text, re.IGNORECASE)
        return int(match.group(1)) if match else None

    def extract_issue_count(label):
        match = re.search(fr"{label}.*?(\d+)", text, re.IGNORECASE)
        return int(match.group(1)) if match else 0

    def extract_recommendations():
        match = re.search(r"### AI Recommendations:(.*?)(?:###|$)", text, re.DOTALL)
        return match.group(1).strip() if match else "No recommendations found."

    return {
        "soc2_score": extract_score("SOC 2"),
        "gdpr_score": extract_score("GDPR"),
        "hipaa_score": extract_score("HIPAA"),
        "pci_score": extract_score("PCI DSS"),
        "critical_issues": extract_issue_count("Critical Issues"),
        "moderate_issues": extract_issue_count("Moderate Issues"),
        "low_issues": extract_issue_count("Low Issues"),
        "recommendations": extract_recommendations(),
    }


def save_report(user_id, file_name, project_name, industry, description, report, scores):
    db = get_db()
    try:
        db.execute(
            """INSERT INTO compliance_reports
               (id, user_id, file_name, project_name, industry, description,
                report, soc2_score, gdpr_score, hipaa_score, pci_score,
                critical_issues, moderate_issues, low_issues, recommendations, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                str(uuid.uuid4()),
                user_id,
                file_name,
                project_name,
                industry,
                description,
                report,
                scores.get("soc2_score"),
                scores.get("gdpr_score"),
                scores.get("hipaa_score"),
                scores.get("pci_score"),
                scores.get("critical_issues"),
                scores.get("moderate_issues"),
                scores.get("low_issues"),
                scores.get("recommendations"),
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        db.commit()
    finally:
        db.close()


@app.post("/analyze-project")
async def analyze_project(
    req: AnalysisRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        # filePath is the absolute stored_path returned by /upload-file
        if not req.filePath or not os.path.exists(req.filePath):
            raise HTTPException(status_code=400, detail="File not found on server. Please upload first.")

        content = read_file_content(req.filePath)
        if not content.strip():
            raise HTTPException(status_code=400, detail="Could not extract content from file.")

        report = compliance_chain.invoke({"input": content}).content
        scores = parse_scores_and_recommendations(report)

        save_report(
            user_id=current_user["user_id"],
            file_name=os.path.basename(req.filePath),
            project_name=req.projectName,
            industry=req.industry,
            description=req.description,
            report=report,
            scores=scores,
        )

        return {
            "status": "success",
            "message": "Report generated and saved",
            "report_summary": report,
            "scores": scores,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Reports endpoint
# ─────────────────────────────────────────────
@app.get("/reports")
def get_reports(current_user: dict = Depends(get_current_user)):
    """Return compliance reports for the logged-in user, newest first."""
    db = get_db()
    try:
        rows = db.execute(
            """SELECT id, file_name, project_name, industry, description,
                      report, soc2_score, gdpr_score, hipaa_score, pci_score,
                      critical_issues, moderate_issues, low_issues,
                      recommendations, created_at
               FROM compliance_reports
               WHERE user_id = ?
               ORDER BY created_at DESC
               LIMIT 20""",
            (current_user["user_id"],),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        db.close()


# ─────────────────────────────────────────────
# Chat endpoint
# ─────────────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Chat with the AI assistant, optionally grounded in a specific compliance report."""
    try:
        system_context = ""

        if req.report_id:
            db = get_db()
            try:
                row = db.execute(
                    """SELECT project_name, industry, description, report,
                              soc2_score, gdpr_score, hipaa_score, pci_score,
                              critical_issues, moderate_issues, low_issues,
                              recommendations, file_name, created_at
                       FROM compliance_reports
                       WHERE id = ? AND user_id = ?""",
                    (req.report_id, current_user["user_id"]),
                ).fetchone()
            finally:
                db.close()

            if row:
                r = dict(row)
                system_context = f"""You are an AI Compliance Analyst assistant with full access to the user's compliance report.

DOCUMENT CONTEXT:
- Project: {r['project_name']}
- Industry: {r['industry']}
- Analyzed: {r['created_at'][:10]}
- Description: {r['description']}

COMPLIANCE SCORES:
- SOC 2:  {r['soc2_score']}%
- GDPR:   {r['gdpr_score']}%
- HIPAA:  {r['hipaa_score']}%
- PCI DSS:{r['pci_score']}%

ISSUES FOUND:
- Critical: {r['critical_issues']}
- Moderate: {r['moderate_issues']}
- Low:      {r['low_issues']}

FULL AUDIT REPORT:
{r['report']}

AI RECOMMENDATIONS:
{r['recommendations']}

Answer the user's question using this document as your primary source. Be specific, actionable, and reference actual findings from the report. Do NOT mention internal file names or system IDs — refer to the document only by its project name.
---
USER QUESTION: """

        full_message = system_context + req.message if system_context else req.message
        result = llm.invoke(full_message)
        return {"response": result.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Compliance News endpoint (NewsAPI.org)
# ─────────────────────────────────────────────
def _classify_priority(title: str, description: str) -> str:
    """Heuristically classify news priority based on keywords."""
    high_keywords = [
        'breach', 'violation', 'penalty', 'fine', 'enforcement', 'deadline',
        'critical', 'urgent', 'mandatory', 'lawsuit', 'ban', 'warning'
    ]
    medium_keywords = [
        'update', 'amendment', 'guidance', 'new requirement', 'change',
        'proposal', 'draft', 'review', 'revision'
    ]
    text = (title + ' ' + (description or '')).lower()
    if any(k in text for k in high_keywords):
        return 'high'
    if any(k in text for k in medium_keywords):
        return 'medium'
    return 'low'


def _classify_framework(title: str, description: str) -> str:
    """Detect compliance framework mentioned in the article."""
    text = (title + ' ' + (description or '')).lower()
    if 'gdpr' in text:
        return 'GDPR'
    if 'hipaa' in text:
        return 'HIPAA'
    if 'pci dss' in text or 'pci-dss' in text:
        return 'PCI DSS'
    if 'soc 2' in text or 'soc2' in text:
        return 'SOC 2'
    if 'iso 27001' in text or 'iso27001' in text:
        return 'ISO 27001'
    if 'ccpa' in text or 'cpra' in text:
        return 'CCPA/CPRA'
    if 'dpdp' in text or 'personal data protection' in text:
        return 'DPDP'
    return 'Compliance'


def _classify_region(title: str, description: str) -> str:
    """Detect region from article text."""
    text = (title + ' ' + (description or '')).lower()
    if 'european' in text or ' eu ' in text or 'gdpr' in text or 'europe' in text:
        return 'EU'
    if 'india' in text or 'dpdp' in text:
        return 'India'
    if 'california' in text or 'ccpa' in text or 'cpra' in text:
        return 'US'
    if 'uk ' in text or 'united kingdom' in text or 'ico ' in text:
        return 'UK'
    return 'Global'


def _time_ago(published_at: str) -> str:
    """Convert ISO datetime string to relative time."""
    try:
        pub = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        diff = now - pub
        if diff.days >= 7:
            weeks = diff.days // 7
            return f"{weeks} week{'s' if weeks > 1 else ''} ago"
        if diff.days >= 1:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        hours = diff.seconds // 3600
        if hours >= 1:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    except Exception:
        return 'Recently'


@app.get("/compliance-news")
async def get_compliance_news(
    region: str = "All Regions",
    framework: str = "All",
    current_user: dict = Depends(get_current_user)
):
    """Fetch live compliance news from NewsAPI.org and return structured results."""
    if not NEWS_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="News API key not configured. Please add NEWS_API_KEY to the backend .env file."
        )

    # Build a rich compliance search query
    base_query = (
        '(GDPR OR HIPAA OR "SOC 2" OR "PCI DSS" OR "ISO 27001" OR CCPA OR CPRA OR compliance OR '
        '"data protection" OR "data breach" OR "privacy regulation" OR "cybersecurity regulation")'
    )

    # Add region filter to query if specified
    region_map = {
        'United States': ' AND (US OR USA OR "United States" OR California OR federal)',
        'European Union': ' AND (EU OR Europe OR European OR GDPR)',
        'India': ' AND (India OR DPDP OR "Digital Personal Data")',
        'Global': ''
    }
    if region in region_map:
        base_query += region_map[region]

    # Add framework filter
    framework_map = {
        'GDPR': 'GDPR OR "data protection" OR EDPB',
        'HIPAA': 'HIPAA OR "health data" OR PHI',
        'SOC 2': '"SOC 2" OR "SOC2" OR AICPA',
        'PCI DSS': '"PCI DSS" OR "PCI-DSS" OR "payment card"',
        'ISO 27001': '"ISO 27001" OR "information security"'
    }
    if framework in framework_map:
        base_query = framework_map[framework]

    try:
        resp = http_requests.get(
            'https://newsapi.org/v2/everything',
            params={
                'q': base_query,
                'language': 'en',
                'sortBy': 'publishedAt',
                'pageSize': 20,
                'apiKey': NEWS_API_KEY
            },
            timeout=10
        )
        resp.raise_for_status()
        data = resp.json()
    except http_requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="News API request timed out")
    except http_requests.exceptions.RequestException as e:
        raise HTTPException(status_code=502, detail=f"News API error: {str(e)}")

    if data.get('status') != 'ok':
        raise HTTPException(
            status_code=502,
            detail=data.get('message', 'Unknown error from News API')
        )

    articles = data.get('articles', [])
    results = []
    for i, article in enumerate(articles):
        title = article.get('title') or ''
        description = article.get('description') or ''
        source_name = (article.get('source') or {}).get('name', 'Unknown Source')
        published_at = article.get('publishedAt', '')
        url = article.get('url', '')
        url_to_image = article.get('urlToImage', '')

        # Skip articles with removed/empty titles
        if not title or title == '[Removed]':
            continue

        det_framework = _classify_framework(title, description)
        det_region = _classify_region(title, description)
        priority = _classify_priority(title, description)

        results.append({
            'id': i + 1,
            'title': title,
            'description': description,
            'source': source_name,
            'framework': det_framework,
            'region': det_region,
            'priority': priority,
            'time': _time_ago(published_at),
            'publishedAt': published_at,
            'url': url,
            'urlToImage': url_to_image,
            'impact': f"Review your {det_framework} compliance posture in response to this update."
        })

    return {"articles": results, "total": len(results)}
