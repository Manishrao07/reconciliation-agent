# Agent Safeguards & Safety Mechanisms

The Autonomous Finance Reconciliation Agent implements several robust safeguards to prevent unintended or malicious actions, both by human operators and the AI agent system itself.

## 1. Deterministic Rules vs LLM Explanation
*   **Rules Decide**: Core logic for identifying anomalies and determining the discrepancy type (e.g., OVERPAYMENT, MISSING_DRC) is 100% deterministic, written in standard Python. The system never relies on an LLM to make financial calculations or decisions.
*   **LLM Explains**: The LLM is restricted to an explanation role. It receives the rule's conclusion and raw data, then generates a human-readable explanation.
*   **LLM Fallback**: If the LLM call times out, hallucinates an invalid JSON response, or fails validation (via Pydantic), the system gracefully falls back to a deterministic string explaining the discrepancy, ensuring the pipeline never fails due to LLM instability.

## 2. Maker-Checker Policy & Human Approval
All financial adjustments (corrective actions) are protected by a strict Maker-Checker workflow.
*   **Who is the "Proposer"?**: The proposer of any corrective action is explicitly defined as the **user who started the pipeline run**. When a user triggers the `POST /api/v1/runs` endpoint, their user ID is saved onto the `ReconciliationRun` record.
*   **Human Approval Checks**: When an approval request is made, the system strictly checks that `approver_user.id != run.user_id`. This guarantees an employee can never trigger a run to find an anomaly, and then approve the resulting resolution themselves. 

## 3. Strict Audit Trails
*   All significant actions (login, CSV upload, run start/finish, approvals, rejections) are written to the `audit_logs` table.
*   The audit table enforces append-only logging. It is protected by PostgreSQL triggers that raise hard errors on any `TRUNCATE`, `UPDATE`, or `DELETE` attempt.

## 4. Duplicate vs Overpayment Logic

To avoid double-counting anomalies, the Anomaly Agent employs strict mutually exclusive rules for duplicate payments and overpayments.

**Scenarios on a $1,000 Order:**
*   **$500 + $500 (Different references, 2 days apart)**: These are legitimate partial payments summing to the total order amount. **Result**: No discrepancies flagged.
*   **$1,000 + $1,000 (Different references, 2 days apart)**: The sum exceeds the order amount, and the amounts match exactly within the date window. The first payment fulfills the order, and the second is flagged. **Result**: Exactly 1 `DUPLICATE_PAYMENT`. It does NOT also flag an `OVERPAYMENT` for the order, preventing double-counting.
*   **$600 + $600 (Different references, 2 days apart)**: The sum ($1,200) exceeds the order amount ($1,000) by $200. Because the overpayment amount ($200) is less than the potential duplicate payment amount ($600), the system determines these are two distinct partial payments that resulted in a true overpayment. **Result**: Exactly 1 `OVERPAYMENT` for $200. It does NOT flag `DUPLICATE_PAYMENT` or `UNDERPAYMENT`.
