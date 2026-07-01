"""
supabase_utils.py
Helper functions for Supabase Storage and Postgres operations.
Used exclusively by main.py (backend). Never import into frontend.
"""

import io
import PyPDF2
from supabase import Client

STORAGE_BUCKET = "compliance-files"


# ─── Storage ──────────────────────────────────────────────────────────────────

def get_file_bytes_from_storage(supabase: Client, storage_path: str) -> bytes:
    """Download a file from Supabase Storage and return raw bytes."""
    response = supabase.storage.from_(STORAGE_BUCKET).download(storage_path)
    return response  # supabase-py returns bytes directly


def read_file_content_from_bytes(file_bytes: bytes, file_extension: str) -> str:
    """Extract text content from raw file bytes based on extension."""
    ext = file_extension.lower().lstrip(".")

    if ext == "pdf":
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    text_extensions = {"txt", "md", "tsx", "js", "py", "html", "ts", "json", "yaml", "yml"}
    if ext in text_extensions:
        return file_bytes.decode("utf-8", errors="ignore")

    raise ValueError(f"Unsupported file type: .{ext}")


# ─── Database ─────────────────────────────────────────────────────────────────

def save_report_to_supabase(
    supabase: Client,
    user_id: str,
    file_name: str,
    storage_path: str,
    project_name: str,
    industry: str,
    description: str,
    report: str,
    scores: dict,
) -> dict:
    """Insert a compliance report into Supabase Postgres and return the inserted row."""
    payload = {
        "user_id": user_id,
        "file_name": file_name,
        "storage_path": storage_path,
        "project_name": project_name,
        "industry": industry,
        "description": description,
        "report": report,
        "soc2_score": scores.get("soc2_score"),
        "gdpr_score": scores.get("gdpr_score"),
        "hipaa_score": scores.get("hipaa_score"),
        "pci_score": scores.get("pci_score"),
        "critical_issues": scores.get("critical_issues"),
        "moderate_issues": scores.get("moderate_issues"),
        "low_issues": scores.get("low_issues"),
        "recommendations": scores.get("recommendations"),
    }
    result = supabase.table("compliance_reports").insert(payload).execute()
    return result.data[0] if result.data else {}
