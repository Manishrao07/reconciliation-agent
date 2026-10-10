# Architecture Tradeoffs & Design Decisions

This document captures the rationale behind key engineering decisions in the Autonomous Finance Reconciliation Agent, including what we optimized for and where we accepted limitations.

## 1. LLM as an Explainer, Not a Decider
*   **Tradeoff**: We could have passed raw reconciliation data to an LLM to let it detect and resolve anomalies. This would have saved initial engineering time.
*   **Decision**: We built a deterministic Python-based rules engine for Matching and Anomaly detection. The LLM is only called at the very end to *explain* the anomaly in human-readable terms.
*   **Why**: Finance requires 100% predictability. An LLM might hallucinate a resolution or fail to flag a missing DRC inconsistently. By isolating the LLM to an explainability role, we maintain strict correctness while still providing a modern, intelligent user experience.

## 2. Synchronous vs Asynchronous Processing
*   **Tradeoff**: Reconciliation over large datasets can be extremely slow.
*   **Decision**: We handle CSV parsing and ingestion synchronously for immediate user feedback on invalid rows, but we execute the actual `ReconciliationRun` in a FastApi `BackgroundTask`.
*   **Why**: Prevents HTTP timeouts for large datasets. Users can poll the UI for run completion. 

## 3. Database Selection (PostgreSQL)
*   **Tradeoff**: We could have used MongoDB for unstructured reconciliation data.
*   **Decision**: We used PostgreSQL with strict schema definitions and Alembic for migrations.
*   **Why**: Financial systems require ACID guarantees, foreign keys, and strict data typing (e.g., using `DECIMAL` instead of floating points). Furthermore, PostgreSQL allowed us to implement hard database triggers to enforce the immutability of our `audit_logs` table.

## 4. Float vs Decimal
*   **Decision**: We exclusively use the Python `Decimal` type and PostgreSQL `NUMERIC` types. Float is never used.
*   **Why**: Floating point arithmetic can lead to rounding errors (e.g., `0.1 + 0.2 = 0.30000000000000004`). In a reconciliation engine checking for an exact `0.00` balance, precision is mandatory.

---

## How This Scales
While the current architecture handles initial scale (up to tens of thousands of rows) robustly, scaling to millions of rows daily requires future architectural changes:

1.  **Distributed Task Queues**: 
    Currently, runs execute via FastAPI `BackgroundTasks` in the same container. At scale, this would block the API web workers. We would transition the reconciliation pipeline to a distributed queue like **Celery** or **ARQ**, using Redis/RabbitMQ.
2.  **Streaming CSV Uploads**:
    Currently, files up to 5MB are loaded into memory and processed using `csv.DictReader`. For GB-scale files, we would shift to streaming the uploads directly to an S3 bucket, then triggering an event-driven worker (e.g., AWS Lambda or a Celery task) to ingest the file in chunks using Pandas or Polars.
3.  **Vectorized Processing**:
    The deterministic rules currently iterate through rows in standard Python `for` loops. At larger scales, we would rewrite the `MatchingAgent` and `AnomalyAgent` logic to use **Pandas** or **Polars** dataframes, or push the heavy joins directly into PostgreSQL using `GROUP BY` and window functions.
4.  **Database Partitioning**:
    The `audit_logs` and `payments` tables will grow infinitely. We would implement Postgres table partitioning by date (e.g., monthly partitions) to ensure queries remain fast.
