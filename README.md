# 🛡️ AICON

> **AI-Powered Compliance Intelligence Platform**
>
> Automate regulatory compliance, monitor security posture, generate audit-ready reports, and stay ahead of evolving regulations using AI.

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-AI-121212?style=for-the-badge)
![Cohere](https://img.shields.io/badge/Cohere-FF6B35?style=for-the-badge)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)

</p>

---

# Overview

AICON is an AI-powered compliance management platform that helps startups and businesses automate compliance workflows, monitor regulatory changes, generate audit-ready reports, and proactively identify compliance risks.

Instead of manually interpreting regulations, organizations can upload project documentation and receive AI-generated compliance assessments across multiple standards, along with actionable recommendations.

---

# Technical Pipeline

AICON follows a modular, API-driven pipeline designed to transform raw compliance documents into structured, audit-ready intelligence.

## 1. Authentication & Session Initialization

* The user authenticates through **Supabase Auth**.
* A secure session token is issued and attached to subsequent frontend requests.
* The backend validates the session before allowing access to document upload, report generation, or historical data.

## 2. Document Upload & Storage

* The user uploads a compliance-related document from the React frontend.
* The file is sent to the **FastAPI backend** through a secure API endpoint.
* Uploaded files are validated for type, size, and integrity before processing.
* Metadata such as filename, user ID, timestamp, and report status is stored in **Supabase**.

## 3. Text Extraction & Preprocessing

* The backend extracts raw text from the uploaded document.
* If the document is large, the content is cleaned and normalized to remove noise such as:

  * extra whitespace
  * formatting artifacts
  * repeated headers/footers
  * irrelevant symbols
* The extracted text is then prepared for downstream AI analysis.

## 4. Chunking & Context Preparation

* The document is split into smaller semantic chunks to fit within model context limits.
* Each chunk is passed through **LangChain**, which helps orchestrate the analysis workflow.
* This ensures the model can process long documents without losing important compliance context.

## 5. Compliance Intelligence Layer

* LangChain coordinates the prompt flow and sends structured inputs to **Cohere**.
* The AI engine evaluates the document against multiple compliance frameworks, including:

  * **SOC 2**
  * **GDPR**
  * **HIPAA**
  * **ISO 27001**
  * **PCI DSS**
* For each framework, the model identifies:

  * control coverage
  * missing safeguards
  * policy gaps
  * implementation risks
  * remediation opportunities

## 6. Scoring & Risk Assessment

* AICON converts the AI output into structured compliance scores.
* Each framework receives a normalized score based on detected evidence and missing controls.
* The backend also classifies findings by severity, helping users understand which issues are critical versus informational.
* This scoring layer powers the dashboard analytics and report summaries.

## 7. Recommendation Generation

* Based on the detected gaps, the system generates actionable remediation guidance.
* Recommendations are tailored to the specific compliance framework and the uploaded document context.
* These suggestions help teams move from assessment to implementation faster.

## 8. Report Generation & Persistence

* The final analysis is assembled into a structured compliance report.
* The report includes:

  * framework-wise scores
  * risk summaries
  * AI-generated recommendations
  * document metadata
  * analysis timestamp
* The report is stored in **Supabase** so users can revisit it later from the report history section.

## 9. Live Compliance News Enrichment

* In parallel with document analysis, AICON fetches live global compliance and cybersecurity news using the **News API**.
* This adds external regulatory context to the platform, helping users stay informed about:

  * new regulations
  * policy updates
  * security incidents
  * compliance trends
* The news feed is surfaced inside the dashboard for continuous awareness.

## 10. Frontend Rendering & User Feedback

* The React + TypeScript frontend consumes the backend response and renders:

  * compliance scores
  * report cards
  * analytics charts
  * recommendations
  * news updates
* Users can view results instantly in the dashboard and access historical reports from their account.

## 11. Data Flow Summary

```text
User Login
   ↓
Document Upload
   ↓
Text Extraction & Cleaning
   ↓
Chunking via LangChain
   ↓
Cohere-Based Compliance Analysis
   ↓
Framework Scoring & Risk Detection
   ↓
Recommendations + Report Generation
   ↓
Store in Supabase
   ↓
Render in Dashboard + News Feed
```

## 12. Why This Pipeline Matters

This architecture keeps AICON:

* **scalable** by separating frontend, backend, and AI orchestration
* **secure** through Supabase authentication and controlled API access
* **extensible** for future integrations like AWS, GitHub, Slack, and Jira
* **audit-friendly** by persisting structured reports and historical analysis

In short, AICON turns unstructured compliance documentation into actionable intelligence through a secure, AI-assisted workflow.

---

# Key Features

* Secure Authentication using Supabase
* Upload compliance documents
* AI-powered compliance analysis
* SOC 2 compliance scoring
* GDPR compliance scoring
* HIPAA compliance scoring
* ISO 27001 compliance scoring
* AI-generated remediation recommendations
* Compliance report history
* Interactive analytics dashboard
* Live global compliance & regulatory news
* Fast report generation
* Cloud deployment
* Responsive UI

---

# Screenshots

<img width="1600" height="951" alt="image" src="https://github.com/user-attachments/assets/e918eb29-63d0-4373-90c4-0ee53e63f19c" />

<img width="1600" height="951" alt="image" src="https://github.com/user-attachments/assets/d839a096-99a0-43ca-9eb9-a2c5e208a59f" />

<img width="1600" height="1269" alt="image" src="https://github.com/user-attachments/assets/30bdec8f-1d5d-4db8-bf16-e47e8c6d12e2" />

<img width="1600" height="953" alt="image" src="https://github.com/user-attachments/assets/3a681f64-ae1b-4fb8-be86-5cb6b8f31cc7" />


---

# Tech Stack

| Layer          | Technology         |
| -------------- | ------------------ |
| Frontend       | React + TypeScript |
| Backend        | Python + FastAPI   |
| AI Framework   | LangChain          |
| LLM            | Cohere             |
| Database       | Supabase           |
| Authentication | Supabase Auth      |
| Hosting        | Vercel + Render    |
| News Service   | News API           |

---

# Project Structure

```text
AICON/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── requirements.txt
│
└── README.md
```

---

# Getting Started

## Clone Repository

```bash
git clone <repository-url>

cd AICON
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

---

# Environment Variables

Create a `.env` file.

```env
COHERE_API_KEY=

SUPABASE_URL=

SUPABASE_SERVICE_ROLE_KEY=

SUPABASE_ANON_KEY=

NEWS_API_KEY=
```

---

# Compliance Standards

Current support includes:

* SOC 2
* GDPR
* HIPAA
* ISO 27001
* PCI DSS

More frameworks will be added in future releases.

---

# Live Compliance News

AICON continuously fetches the latest global compliance and cybersecurity news, helping organizations stay informed about evolving regulations and emerging security risks.

---

# Deployment

| Service        | Platform      |
| -------------- | ------------- |
| Frontend       | Vercel        |
| Backend        | Render        |
| Database       | Supabase      |
| Authentication | Supabase Auth |

---

# Roadmap

### Current

* AI Compliance Reports
* Dashboard
* Compliance Scoring
* Live News
* Authentication

### Upcoming

* AWS, GitHub, Slack, and Jira Integrations
* Continuous Compliance Monitoring
* Email Notifications
* Enterprise Team Workspaces

---

# Contributing

This repository is currently private.

Contributions are limited to authorized collaborators.

---

# Authors

**Parv Gupta**
[LinkedIn](https://www.linkedin.com/in/parv-gupta-978189335/)

**Anna Sian**
[LinkedIn](https://www.linkedin.com/in/anna-sian-414a06327/)

---

# Vision

Our mission is to simplify regulatory compliance through AI—transforming compliance from a reactive obligation into a proactive competitive advantage.

AICON aims to become the intelligent compliance operating system for modern startups and enterprises.
