import os
import re
import requests as http_requests
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_cohere import ChatCohere
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnableSequence

from database import supabase_admin
from utils.supabase_utils import (
    get_file_bytes_from_storage,
    read_file_content_from_bytes,
    save_report_to_supabase,
)

# ─────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────
load_dotenv()

COHERE_API_KEY = os.getenv("COHERE_API_KEY")
NEWS_API_KEY   = os.getenv("NEWS_API_KEY", "")

# ─────────────────────────────────────────────
# Auth helper — validates Supabase JWT
# ─────────────────────────────────────────────

def get_current_user(authorization: str = Header(None)) -> dict:
    """FastAPI dependency — validates the Supabase JWT from the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid auth token")
    token = authorization.split(" ", 1)[1]
    try:
        user_response = supabase_admin.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "user_id": user.id,
            "email": user.email,
            "full_name": (user.user_metadata or {}).get("full_name", ""),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {exc}")


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
app = FastAPI(title="AICON Backend", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aicon-bay-seven.vercel.app",
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


# ─────────────────────────────────────────────
# Pydantic request models
# ─────────────────────────────────────────────
class AnalysisRequest(BaseModel):
    storagePath: str        # Supabase Storage path returned after frontend upload
    fileName: str           # original filename (for display)
    projectName: str
    industry: str
    description: str = ""


class ChatRequest(BaseModel):
    message: str
    report_id: str | None = None   # optional — attach a specific report as context


# ─────────────────────────────────────────────
# Auth endpoints
# Auth is now handled fully by Supabase on the frontend.
# The backend only exposes /auth/me for convenience.
# ─────────────────────────────────────────────

@app.get("/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    """Return the current user's profile from the Supabase token."""
    return {
        "id": current_user["user_id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
    }


# ─────────────────────────────────────────────
# Compliance analysis endpoint
# ─────────────────────────────────────────────

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


@app.post("/analyze-project")
async def analyze_project(
    req: AnalysisRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Download the file from Supabase Storage, run Cohere LLM analysis,
    then save the report to Supabase Postgres.
    """
    try:
        # 1. Download file bytes from Supabase Storage
        try:
            file_bytes = get_file_bytes_from_storage(supabase_admin, req.storagePath)
        except Exception as exc:
            raise HTTPException(
                status_code=400,
                detail=f"Could not retrieve file from storage: {exc}"
            )

        # 2. Extract text
        ext = os.path.splitext(req.fileName)[1]
        try:
            content = read_file_content_from_bytes(file_bytes, ext)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))

        if not content.strip():
            raise HTTPException(status_code=400, detail="Could not extract content from file.")

        # 3. Run LLM
        report = compliance_chain.invoke({"input": content}).content
        scores = parse_scores_and_recommendations(report)

        # 4. Save to Supabase Postgres
        save_report_to_supabase(
            supabase=supabase_admin,
            user_id=current_user["user_id"],
            file_name=req.fileName,
            storage_path=req.storagePath,
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
# Chat endpoint
# ─────────────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Chat with the AI assistant, optionally grounded in a specific compliance report."""
    try:
        system_context = ""

        if req.report_id:
            result = (
                supabase_admin.table("compliance_reports")
                .select(
                    "project_name,industry,description,report,soc2_score,gdpr_score,"
                    "hipaa_score,pci_score,critical_issues,moderate_issues,low_issues,"
                    "recommendations,file_name,created_at"
                )
                .eq("id", req.report_id)
                .eq("user_id", current_user["user_id"])
                .single()
                .execute()
            )
            r = result.data
            if r:
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

    base_query = (
        '(GDPR OR HIPAA OR "SOC 2" OR "PCI DSS" OR "ISO 27001" OR CCPA OR CPRA OR compliance OR '
        '"data protection" OR "data breach" OR "privacy regulation" OR "cybersecurity regulation")'
    )

    region_map = {
        'United States': ' AND (US OR USA OR "United States" OR California OR federal)',
        'European Union': ' AND (EU OR Europe OR European OR GDPR)',
        'India': ' AND (India OR DPDP OR "Digital Personal Data")',
        'Global': ''
    }
    if region in region_map:
        base_query += region_map[region]

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
