# Security Policy

## Supported Versions
Only the latest version is supported with security updates.

## Reporting a Vulnerability
If you discover a security vulnerability in this project, please report it directly to the security team at security@example.com instead of opening a public issue.

## Key Safeguards Implemented
This project handles financial reconciliation and enforces strict security and integrity controls:

### 1. Maker-Checker Approval Policy
*   **Principle**: The user proposing an action (starting a reconciliation run) cannot approve it themselves.
*   **Thresholds**: 
    *   Actions < $1,000 are auto-approved by the system.
    *   Actions $1,000 to $50,000 require a `FINANCE_MANAGER` or `ADMIN`.
    *   Actions > $50,000 require an `ADMIN`.

### 2. Immutable Audit Log
*   All significant actions (login, CSV upload, run start/finish, approvals, rejections) are written to the `audit_logs` table.
*   **Database Triggers**: The `audit_logs` table is protected at the PostgreSQL level via trigger functions that raise a hard error on any `UPDATE`, `DELETE`, or `TRUNCATE` operations, ensuring strict append-only compliance.

### 3. CSV Injection Protection
*   All user-uploaded CSVs are untrusted. To prevent CSV injection attacks in downstream exports, any cell beginning with `=`, `+`, `-`, or `@` will be sanitized or stripped upon export. 

### 4. Deterministic AI
*   The LLM agent does not execute database queries or decide what happens.
*   The LLM acts purely in an **explainability** capacity. The rules engine deterministically identifies anomalies, and the LLM merely translates the flagged evidence into a natural language description. Output is strictly validated with Pydantic schemas.

### 5. Authentication & Authorization
*   JWT-based authentication is required for all API endpoints.
*   Endpoints enforce role-based access control (RBAC). For example, `AUDITOR` roles only have read access to logs and discrepancies and cannot approve resolutions.

## Dependencies
This project uses automated tools (e.g., Dependabot or similar) to monitor vulnerabilities in third-party Python dependencies (FastAPI, SQLAlchemy, Pandas, etc.).
