# Autonomous Finance Reconciliation Agent

![CI](https://github.com/manishyadav/autonomous-finance-reconciliation-agent/actions/workflows/ci.yml/badge.svg)

An enterprise-grade, AI-assisted financial reconciliation system. It ingests Orders, Payments, DRCs, and Refunds, applies deterministic Python rules to detect discrepancies, and uses a Gemini LLM to generate human-readable explanations of the anomalies.

## 🚀 Features
*   **Deterministic Rule Engine**: 100% deterministic Matching and Anomaly detection logic (no LLM hallucinations affecting financial math).
*   **AI Explainability**: Gemini LLM translates raw rule output into easy-to-understand explanations.
*   **Maker-Checker Policy**: Users who propose an action (by starting a run) cannot approve it themselves. Strict thresholds require Finance Manager ($1k-$50k) or Admin (>$50k) approval.
*   **Immutable Audit Log**: PostgreSQL triggers block any `UPDATE`, `DELETE`, or `TRUNCATE` actions on the `audit_logs` table.
*   **Role-Based UI**: Streamlit dashboard that adapts to Admin, Finance Manager, and Auditor roles.

## 📖 Documentation
*   [Architecture Overview](docs/ARCHITECTURE.md)
*   [Diagrams (ER, Sequence, Flowcharts)](docs/DIAGRAMS.md)
*   [Agent Safeguards & Safety](docs/AGENT_SAFEGUARDS.md)
*   [Tradeoffs & Scaling](docs/TRADEOFFS.md)
*   [Security Policy](SECURITY.md)
*   [Demo Video Script](docs/DEMO_SCRIPT.md)

## ⚡ Setup (Docker)

Get the system running locally in 3 commands:

```bash
# 1. Copy the environment variables
cp .env.example .env
# Note: By default, LLM_PROVIDER is set to "mock". To enable the Gemini LLM, 
# set LLM_PROVIDER="gemini" and provide your GEMINI_API_KEY in the .env file.
# Gemini is optional; if the key is missing, it falls back gracefully.

# 2. Start the database, API, and UI in the background
docker compose up -d

# 3. Run database migrations and seed demo data
make reset-demo
```

## 🔐 Demo Logins
Use these accounts to test the Maker-Checker and RBAC rules. The password for all accounts is the value of `SEED_DEMO_PASSWORD` found in your `.env.example` file.
*   **Admin**: `admin@example.com`
*   **Finance Manager**: `manager@example.com`
*   **Auditor**: `auditor@example.com`

## 📊 CSV File Formats
Uploads must be `.csv` files matching these exact column headers:
*   **Orders**: `order_id`, `customer_name`, `amount`, `currency`, `status`, `date`
*   **DRCs**: `drc_id`, `order_id`, `status`, `date`
*   **Payments**: `payment_id`, `order_id`, `amount`, `currency`, `reference`, `date`
*   **Refunds**: `refund_id`, `payment_id`, `amount`, `currency`, `reason`, `date`

## 🔌 API Documentation
Once the Docker containers are running, view the interactive Swagger API documentation at:
*   **http://localhost:8000/docs**
