<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=180&section=header&text=CIVORA%20AI&fontSize=52&fontColor=E6F7FF&fontAlignY=38&desc=CITIZEN%20ASSISTANCE%20INTELLIGENCE&descAlignY=62&descSize=13&color=0:0B1220,55:102A43,100:0891B2" width="100%" alt="CIVORA AI — Citizen Assistance Intelligence" />

**Explore assistance options, understand possible scheme relevance, and organize citizen profile information.**

![Next.js](https://img.shields.io/badge/Next.js-0B1220?style=flat-square&logo=nextdotjs&logoColor=67E8F9)
![React](https://img.shields.io/badge/React-0B1220?style=flat-square&logo=react&logoColor=67E8F9)
![TypeScript](https://img.shields.io/badge/TypeScript-0B1220?style=flat-square&logo=typescript&logoColor=67E8F9)
![FastAPI](https://img.shields.io/badge/FastAPI-0B1220?style=flat-square&logo=fastapi&logoColor=67E8F9)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-0B1220?style=flat-square&logo=sqlalchemy&logoColor=67E8F9)

</div>

---

## Overview

**CIVORA AI** is a citizen-assistance web application with a Next.js frontend and a FastAPI backend. Its backend includes authentication, citizen profile APIs, assistance analysis, demand summaries, and verified-source endpoints.

The application is intended to help people explore potentially relevant assistance schemes. A relevance match is **not** an official eligibility decision, government approval, or guarantee of benefits. Always confirm requirements with the official scheme provider.

## Current capabilities in the source

- Account registration and email/password login
- Password hashing and verification using Passlib's bcrypt context
- JWT bearer access tokens with a 60-minute expiry
- Protected citizen profile endpoints
- Role check for the admin demand-summary endpoint
- Situation analysis and scheme matching services
- Verified-source listing and URL checks
- SQLAlchemy database access; SQLite is the fallback when `DATABASE_URL` is not configured

## Architecture

```text
Browser (Next.js / React / TypeScript)
              │
              │ JSON over HTTP
              ▼
FastAPI application (backend/app/main.py)
              │
      ┌───────┼─────────────┐
      ▼       ▼             ▼
  /api/auth /api/profile /api/assistance
      │       │             │
      └───────┴──────┬──────┘
                     ▼
       Security helpers + SQLAlchemy
                     │
                     ▼
          User / Profile / Demand data
```

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend API | Python, FastAPI, Uvicorn |
| Data access | SQLAlchemy |
| Authentication | Passlib bcrypt, python-jose JWT, HTTP Bearer |
| Configuration | python-dotenv |
| Default database | SQLite fallback; configurable with `DATABASE_URL` |

## Run locally

### Backend

Prerequisites: Python 3.x and pip.

```bash
git clone https://github.com/yashwaje712/CIVORA-AI.git
cd CIVORA-AI/backend
python -m venv .venv
```

Activate the virtual environment:

**Windows PowerShell**
```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure the environment before starting the API. Set a strong, unique `CIVORA_SECRET_KEY` and, if needed, `DATABASE_URL` in your local environment. Never commit a real `.env` file or production secrets. Start the API from the backend directory:

```bash
uvicorn app.main:app --reload
```

FastAPI's interactive API documentation is normally available at `/docs` on the local server.

### Frontend

Open a second terminal:

```bash
cd CIVORA-AI/frontend
npm install
npm run dev
```

The current login and registration pages call the configured deployment URL in their source. For local development, review those API base URLs and configure them for your local backend before testing authentication.

## Authentication notes

- Registration accepts a full name, email, and password; the backend stores a bcrypt hash rather than the plaintext password.
- Login validates the password against the stored hash and returns a bearer access token.
- The frontend login page stores the access token in browser `localStorage` under `access_token`.
- Protected API calls should send `Authorization: Bearer <token>`.
- The source defines a 60-minute access-token lifetime.
- The inspected implementation does not expose a refresh-token flow or a server-side logout/revocation endpoint. Clearing the browser token alone does not invalidate a JWT that has already been issued.

For production, review browser token storage, rate limiting, password policy, token revocation, CORS origins, secret management, HTTPS, and automated security tests before handling real citizen data.

## Important security and privacy notes

- Keep `CIVORA_SECRET_KEY` and database credentials out of source control. If any real secret was ever committed, rotate it; deleting a file in a later commit does not remove it from Git history.
- Do not commit databases, personal data, logs, or environment files.
- Use HTTPS in deployed environments.
- Apply least-privilege database access and backups appropriate to the sensitivity of citizen profile information.
- Verify scheme details with official sources; matching logic is informational and not a government determination.

## Repository structure

```text
CIVORA-AI/
├── backend/
│   ├── app/api/          # Authentication, assistance, profile, demand, verification
│   ├── app/core/         # Security and token helpers
│   ├── app/models/       # SQLAlchemy models
│   ├── app/services/     # Matching and assistance services
│   ├── app/db/           # Database configuration and sessions
│   └── requirements.txt
└── frontend/
    ├── src/app/login/
    ├── src/app/register/
    ├── src/app/dashboard/
    └── package.json
```

## Roadmap

- [ ] Move frontend API URLs into environment-based configuration
- [ ] Add tests for registration, login, token expiry, and protected routes
- [ ] Add login throttling and a documented password policy
- [ ] Design a secure refresh-token and logout/revocation strategy if persistent sessions are required
- [ ] Review and tighten production CORS settings
- [ ] Add migration-based database schema management
- [ ] Add deployment and security-check workflows

## Author

**Yash Waje** · [GitHub profile](https://github.com/yashwaje712)

---

<div align="center">

**Accessible assistance information, built with practical software engineering.**

</div>
