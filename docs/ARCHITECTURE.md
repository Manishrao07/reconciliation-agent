# System Architecture

The Autonomous Finance Reconciliation Agent is designed with clear layer separation to ensure testability, security, and scalability.

## Data Flow & Layers

The system follows a traditional web architecture overlaid with an AI agent pipeline:

1.  **API Layer** (`api/`): FastAPI endpoints handle routing, HTTP validation, authentication, and file uploads. It enforces RBAC (Role-Based Access Control) and the Maker-Checker policy.
2.  **Service Layer** (`services/`): Contains the core business logic, including the `ReconciliationPipeline`.
3.  **Agents Layer** (`services/reconciliation/agents/`): The core intelligence.
    *   **Matching Agent**: Connects Orders, DRCs (Delivery Run Sheets), Payments, and Refunds into discrete, verifiable groups based on exact identifiers.
    *   **Anomaly Agent**: Evaluates the matched groups against strict, deterministic financial rules to detect discrepancies (e.g., OVERPAYMENT, DUPLICATE_PAYMENT, MISSING_DRC).
    *   **Resolution (LLM) Agent**: Takes the output of the Anomaly agent and queries the Gemini LLM to generate a plain-text, human-readable explanation of why the anomaly was flagged.
4.  **Database & Repositories Layer** (`db/`): SQLAlchemy ORM models mapped to a PostgreSQL database. All mutations to the database go through this layer, including audit logging.

## Architectural Diagrams

Detailed visual representations of the system can be found in our [Diagrams Document](DIAGRAMS.md).

*   **[High-Level Architecture](DIAGRAMS.md#5-high-level-architecture-diagram)**: Visualizes the flow from UI -> API -> Agent Pipeline -> LLM/DB.
*   **[Component Diagram](DIAGRAMS.md#7-component-diagram)**: Shows the class structure connecting FastAPI to the Pipeline and individual Agents.
*   **[Entity Relationship Diagram](DIAGRAMS.md#1-entity-relationship-er-diagram)**: Details the PostgreSQL schema, including foreign keys and strict constraints.
*   **[Reconciliation Run Sequence](DIAGRAMS.md#2-sequence-diagram-reconciliation-run)**: Illustrates the step-by-step pipeline execution for a reconciliation run.
*   **[Approval Workflow Sequence](DIAGRAMS.md#3-sequence-diagram-approval-workflow-maker-checker)**: Demonstrates the strict maker-checker logic for discrepancy resolution.
*   **[Detection Flowchart](DIAGRAMS.md#4-detection-flowchart)**: The deterministic decision tree used by the Anomaly Agent to classify discrepancies.
*   **[Deployment Diagram](DIAGRAMS.md#6-deployment-diagram)**: Outlines the Docker Compose setup (UI + API + DB).
