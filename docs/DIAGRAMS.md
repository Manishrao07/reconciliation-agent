# Architecture Diagrams

This document contains Mermaid diagrams illustrating the structure and workflows of the Autonomous Finance Reconciliation Agent.

## 1. Entity Relationship (ER) Diagram

```mermaid
erDiagram
    USERS {
        string id PK
        string email
        string hashed_password
        string role "ADMIN, FINANCE_MANAGER, AUDITOR"
        datetime created_at
    }

    CUSTOMERS {
        string id PK
        string name
        datetime created_at
    }

    ORDERS {
        string id PK
        string customer_id FK
        numeric amount
        string currency
        string status
        datetime date
        datetime created_at
    }

    DRCS {
        string id PK
        string order_id FK
        string status
        datetime date
        datetime created_at
    }

    PAYMENTS {
        string id PK
        string order_id FK
        numeric amount
        string currency
        string reference
        datetime date
        datetime created_at
    }

    REFUNDS {
        string id PK
        string payment_id FK
        numeric amount
        string currency
        string reason
        datetime date
        datetime created_at
    }

    RECONCILIATION_RUNS {
        string id PK
        string user_id FK
        string status "QUEUED, IN_PROGRESS, COMPLETED, FAILED"
        datetime started_at
        datetime completed_at
    }

    DISCREPANCIES {
        string id PK
        string run_id FK
        string order_id FK
        string type
        string severity "LOW, MEDIUM, HIGH, CRITICAL"
        string status "OPEN, RESOLVED_AUTO, RESOLVED_MANUAL, REJECTED"
        string description
        numeric amount_at_risk
        datetime created_at
    }

    AUDIT_LOGS {
        string id PK
        string action "LOGIN, UPLOAD, RUN_START, RUN_FINISH, ACTION_PROPOSED, ACTION_APPROVED, ACTION_REJECTED"
        string entity_type
        string entity_id
        string actor
        json new_value
        datetime timestamp
    }

    CUSTOMERS ||--o{ ORDERS : "places"
    ORDERS ||--o{ PAYMENTS : "receives"
    ORDERS ||--o{ DRCS : "has"
    PAYMENTS ||--o{ REFUNDS : "refunds"
    USERS ||--o{ RECONCILIATION_RUNS : "starts"
    RECONCILIATION_RUNS ||--o{ DISCREPANCIES : "generates"
```

## 2. Sequence Diagram: Reconciliation Run

This sequence diagram illustrates the pipeline of a reconciliation run.

```mermaid
sequenceDiagram
    participant User
    participant FastAPI as API
    participant DB as Database
    participant Pipeline as Reconciliation Pipeline
    participant Rules as Matching/Anomaly Rules
    participant LLM as LLM Explainer

    User->>FastAPI: POST /api/v1/runs
    FastAPI->>DB: Create Run (status=QUEUED)
    FastAPI->>Pipeline: start background task
    FastAPI-->>User: 202 Accepted (Run ID)
    
    activate Pipeline
    Pipeline->>DB: Update Run (status=IN_PROGRESS)
    Pipeline->>DB: Fetch open Orders, Payments, DRCs
    
    Pipeline->>Rules: Execute Matching Agent
    Rules-->>Pipeline: Matched Groups & Orphans
    
    Pipeline->>Rules: Execute Anomaly Agent
    Rules-->>Pipeline: Detected Discrepancies
    
    loop For each discrepancy
        Pipeline->>LLM: Explain discrepancy
        LLM-->>Pipeline: Human-readable explanation
    end
    
    Pipeline->>DB: Insert Discrepancies
    Pipeline->>DB: Update Run (status=COMPLETED)
    Pipeline->>DB: Insert Audit Log (RUN_FINISH)
    deactivate Pipeline
```

## 3. Sequence Diagram: Approval Workflow (Maker-Checker)

This sequence diagram illustrates the maker-checker logic for resolving a discrepancy.

```mermaid
sequenceDiagram
    participant FinanceManager as Proposer (User A)
    participant Admin as Approver (User B)
    participant API as FastAPI
    participant DB as Database

    FinanceManager->>API: POST /api/v1/runs
    API->>DB: Create Run (Proposer=User A)
    Note over API,DB: Run generates Discrepancy > $50,000
    
    FinanceManager->>API: POST /discrepancies/123/approve
    API->>DB: Check Run Proposer & User Role
    API-->>FinanceManager: 403 Forbidden (Maker-Checker violation or insufficient role)
    
    Admin->>API: POST /discrepancies/123/approve
    API->>DB: Check Run Proposer (User A != User B)
    API->>DB: Check User Role (Admin >= required)
    API->>DB: Update Discrepancy (status=RESOLVED_MANUAL)
    API->>DB: Insert Audit Log (ACTION_APPROVED)
    API-->>Admin: 200 OK (Approved)
```

## 4. Detection Flowchart

This flowchart demonstrates how the Anomaly Agent classifies discrepancies.

```mermaid
flowchart TD
    Start[Analyze Matched Order] --> CheckDRC{Is DRC present?}
    
    CheckDRC -- No --> FlagDRC[Flag MISSING_DRC]
    CheckDRC -- Yes --> CheckPayments{Are there Payments?}
    
    FlagDRC --> CheckPayments
    
    CheckPayments -- No --> FlagUnder[Flag UNDERPAYMENT]
    CheckPayments -- Yes --> SumPayments[Sum all non-duplicate Payments]
    
    SumPayments --> Compare{Sum vs Order Amount}
    
    Compare -- Sum < Amount - Tolerance --> FlagUnder2[Flag UNDERPAYMENT]
    Compare -- Sum > Amount + Tolerance --> FlagOver[Flag OVERPAYMENT]
    Compare -- Equal --> CheckRefunds{Are there Refunds?}
    
    CheckRefunds -- Yes --> SumRefunds[Sum Refunds]
    SumRefunds --> CheckExcess{Refund Sum > Payment?}
    CheckExcess -- Yes --> FlagRefund[Flag EXCESS_REFUND]
    CheckExcess -- No --> Done[Reconciled Successfully]
    
    FlagUnder2 --> CheckRefunds
    FlagOver --> CheckRefunds
```

## 5. High-Level Architecture Diagram

```mermaid
flowchart LR
    User([User / Browser])
    UI[Streamlit UI]
    API[FastAPI Backend]
    Agents[Agent Pipeline\n- Matching\n- Anomaly\n- Resolution]
    LLM[Gemini LLM]
    DB[(PostgreSQL)]

    User -->|HTTP| UI
    UI -->|REST API| API
    API -->|Read/Write| DB
    API -->|Trigger| Agents
    Agents -->|Read/Write| DB
    Agents -->|Prompt| LLM
    LLM -->|Explain| Agents
```

## 6. Deployment Diagram

```mermaid
graph TD
    subgraph Docker Compose Environment
        UI[Streamlit UI Container\nPort 8501]
        API[FastAPI Container\nPort 8000]
        DB[(PostgreSQL Container\nPort 5432)]
        
        UI -->|HTTP requests| API
        API -->|SQL / asyncpg| DB
    end
    
    User([End User]) -->|Browser| UI
```

## 7. Component Diagram

```mermaid
classDiagram
    class FastAPIApp {
        +Authentication
        +Upload CSV
        +Start Run
        +Approve/Reject
    }
    
    class ReconciliationPipeline {
        +execute_run()
    }
    
    class MatchingAgent {
        +execute(orders, drcs, payments)
    }
    
    class AnomalyAgent {
        +execute(matched_groups)
    }
    
    class LLMResolutionAgent {
        +explain_discrepancy(discrepancy)
    }
    
    FastAPIApp --> ReconciliationPipeline : triggers (BackgroundTask)
    ReconciliationPipeline --> MatchingAgent : Step 1
    ReconciliationPipeline --> AnomalyAgent : Step 2
    ReconciliationPipeline --> LLMResolutionAgent : Step 3
```
