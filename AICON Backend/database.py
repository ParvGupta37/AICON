import sqlite3
import os

# The database lives right inside the backend directory — fully visible!
DB_PATH = os.path.join(os.path.dirname(__file__), "aicon.db")


def get_db() -> sqlite3.Connection:
    """Return a new SQLite connection with row_factory for dict-like access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")   # safer concurrent access
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Create all tables if they don't already exist."""
    conn = get_db()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id          TEXT PRIMARY KEY,
            email       TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name   TEXT NOT NULL DEFAULT '',
            created_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS uploaded_files (
            id            TEXT PRIMARY KEY,
            user_id       TEXT NOT NULL REFERENCES users(id),
            original_name TEXT NOT NULL,
            stored_path   TEXT NOT NULL,
            created_at    TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS compliance_reports (
            id              TEXT PRIMARY KEY,
            user_id         TEXT NOT NULL REFERENCES users(id),
            file_name       TEXT,
            project_name    TEXT,
            industry        TEXT,
            description     TEXT,
            report          TEXT,
            soc2_score      INTEGER,
            gdpr_score      INTEGER,
            hipaa_score     INTEGER,
            pci_score       INTEGER,
            critical_issues INTEGER,
            moderate_issues INTEGER,
            low_issues      INTEGER,
            recommendations TEXT,
            created_at      TEXT NOT NULL
        );
    """)

    # Ensure any new columns are added if the DB already exists
    for col_name, col_type in [
        ("pci_score", "INTEGER"),
        ("critical_issues", "INTEGER"),
        ("moderate_issues", "INTEGER"),
        ("low_issues", "INTEGER")
    ]:
        try:
            cur.execute(f"ALTER TABLE compliance_reports ADD COLUMN {col_name} {col_type}")
        except sqlite3.OperationalError:
            pass  # Column already exists

    conn.commit()
    conn.close()
    print(f"✅ SQLite DB ready at: {DB_PATH}")
