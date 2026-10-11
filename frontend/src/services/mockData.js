export const initialMockData = {
  "runs": [
    {
      "id": 18,
      "status": "COMPLETED",
      "user_id": 1,
      "started_at": "2026-10-11T08:36:04.711839",
      "completed_at": "2026-10-11T08:36:33.308189",
      "total_records": 198,
      "match_rate": 73.23
    },
    {
      "id": 17,
      "status": "FAILED",
      "started_at": "2026-10-11T08:30:45.717175",
      "completed_at": "2026-10-11T08:35:56.973263",
      "total_records": 198,
      "match_rate": 73.23
    },
    {
      "id": 16,
      "status": "IN_PROGRESS",
      "started_at": "2026-10-11T08:28:31.972846",
      "completed_at": null,
      "total_records": 198,
      "match_rate": 73.23
    },
    {
      "id": 15,
      "status": "COMPLETED",
      "started_at": "2026-10-10T20:23:45.104626",
      "completed_at": "2026-10-10T20:27:14.677579",
      "total_records": 3,
      "match_rate": 0.0
    },
    {
      "id": 14,
      "status": "COMPLETED",
      "started_at": "2026-10-10T20:20:54.936789",
      "completed_at": "2026-10-10T20:24:23.607196",
      "total_records": 3,
      "match_rate": 0.0
    }
  ],
  "discrepancies": [
    {
      "id": 492,
      "run_id": 18,
      "type": "ORPHAN_PAYMENT",
      "severity": "HIGH",
      "description": "Payment 81.24 has no matching order",
      "status": "OPEN",
      "related_order_id": null,
      "related_payment_id": "PAY0205",
      "action_status": "PENDING",
      "required_role": "ADMIN",
      "suggested_action": "INVESTIGATE_ORPHAN",
      "action": {
        "id": 71,
        "suggested_action": "INVESTIGATE_ORPHAN",
        "llm_explanation": "Autonomous Gateway Audit: Unmatched settlement of $81.24 captured at payment gateway (Ref: PAY0205) has no correlating sales order in the core merchant ledger. Analysis indicates customer completed gateway payment but merchant cart session timed out before order placement. Suggested Action: Hold funds in escrow and initiate merchant dispute or transaction validation.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "ADMIN"
      }
    },
    {
      "id": 491,
      "run_id": 18,
      "type": "ORPHAN_PAYMENT",
      "severity": "HIGH",
      "description": "Payment 175.37 has no matching order",
      "status": "OPEN",
      "related_order_id": null,
      "related_payment_id": "PAY0204",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "INVESTIGATE_ORPHAN",
      "action": {
        "id": 70,
        "suggested_action": "INVESTIGATE_ORPHAN",
        "llm_explanation": "Autonomous Gateway Audit: Unmatched settlement of $175.37 captured at payment gateway (Ref: PAY0204) has no correlating sales order in the core merchant ledger. Analysis indicates customer completed gateway payment but merchant cart session timed out before order placement. Suggested Action: Hold funds in escrow and initiate merchant dispute or transaction validation.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 490,
      "run_id": 18,
      "type": "ORPHAN_PAYMENT",
      "severity": "HIGH",
      "description": "Payment 229.31 has no matching order",
      "status": "OPEN",
      "related_order_id": null,
      "related_payment_id": "PAY0203",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "INVESTIGATE_ORPHAN",
      "action": {
        "id": 69,
        "suggested_action": "INVESTIGATE_ORPHAN",
        "llm_explanation": "Autonomous Gateway Audit: Unmatched settlement of $229.31 captured at payment gateway (Ref: PAY0203) has no correlating sales order in the core merchant ledger. Analysis indicates customer completed gateway payment but merchant cart session timed out before order placement. Suggested Action: Hold funds in escrow and initiate merchant dispute or transaction validation.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 489,
      "run_id": 18,
      "type": "ORPHAN_PAYMENT",
      "severity": "HIGH",
      "description": "Payment 347.01 has no matching order",
      "status": "OPEN",
      "related_order_id": null,
      "related_payment_id": "PAY0202",
      "action_status": "PENDING",
      "required_role": "ADMIN",
      "suggested_action": "INVESTIGATE_ORPHAN",
      "action": {
        "id": 68,
        "suggested_action": "INVESTIGATE_ORPHAN",
        "llm_explanation": "Autonomous Gateway Audit: Unmatched settlement of $347.01 captured at payment gateway (Ref: PAY0202) has no correlating sales order in the core merchant ledger. Analysis indicates customer completed gateway payment but merchant cart session timed out before order placement. Suggested Action: Hold funds in escrow and initiate merchant dispute or transaction validation.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "ADMIN"
      }
    },
    {
      "id": 488,
      "run_id": 18,
      "type": "ORPHAN_PAYMENT",
      "severity": "HIGH",
      "description": "Payment 150.32 has no matching order",
      "status": "OPEN",
      "related_order_id": null,
      "related_payment_id": "PAY0201",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "INVESTIGATE_ORPHAN",
      "action": {
        "id": 67,
        "suggested_action": "INVESTIGATE_ORPHAN",
        "llm_explanation": "Autonomous Gateway Audit: Unmatched settlement of $150.32 captured at payment gateway (Ref: PAY0201) has no correlating sales order in the core merchant ledger. Analysis indicates customer completed gateway payment but merchant cart session timed out before order placement. Suggested Action: Hold funds in escrow and initiate merchant dispute or transaction validation.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 487,
      "run_id": 18,
      "type": "EXCESS_REFUND",
      "severity": "HIGH",
      "description": "Refund 201.90 exceeds payment 101.90",
      "status": "OPEN",
      "related_order_id": "ORD0195",
      "related_payment_id": "PAY0210",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "ESCALATE",
      "action": {
        "id": 66,
        "suggested_action": "ESCALATE",
        "llm_explanation": "Autonomous Fraud Guard: Refund transaction of $201.90 exceeds the original verified payment total of $101.90. This variance indicates duplicate refund issuance or unauthorized credit adjustment. Suggested Action: Place immediate freeze on refund disbursement and escalate to Senior Compliance.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 486,
      "run_id": 18,
      "type": "EXCESS_REFUND",
      "severity": "HIGH",
      "description": "Refund 299.02 exceeds payment 199.02",
      "status": "OPEN",
      "related_order_id": "ORD0194",
      "related_payment_id": "PAY0209",
      "action_status": "PENDING",
      "required_role": "ADMIN",
      "suggested_action": "ESCALATE",
      "action": {
        "id": 65,
        "suggested_action": "ESCALATE",
        "llm_explanation": "Autonomous Fraud Guard: Refund transaction of $299.02 exceeds the original verified payment total of $199.02. This variance indicates duplicate refund issuance or unauthorized credit adjustment. Suggested Action: Place immediate freeze on refund disbursement and escalate to Senior Compliance.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "ADMIN"
      }
    },
    {
      "id": 485,
      "run_id": 18,
      "type": "EXCESS_REFUND",
      "severity": "HIGH",
      "description": "Refund 455.78 exceeds payment 355.78",
      "status": "OPEN",
      "related_order_id": "ORD0193",
      "related_payment_id": "PAY0208",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "ESCALATE",
      "action": {
        "id": 64,
        "suggested_action": "ESCALATE",
        "llm_explanation": "Autonomous Fraud Guard: Refund transaction of $455.78 exceeds the original verified payment total of $355.78. This variance indicates duplicate refund issuance or unauthorized credit adjustment. Suggested Action: Place immediate freeze on refund disbursement and escalate to Senior Compliance.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 484,
      "run_id": 18,
      "type": "EXCESS_REFUND",
      "severity": "HIGH",
      "description": "Refund 438.67 exceeds payment 338.67",
      "status": "OPEN",
      "related_order_id": "ORD0192",
      "related_payment_id": "PAY0207",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "ESCALATE",
      "action": {
        "id": 63,
        "suggested_action": "ESCALATE",
        "llm_explanation": "Autonomous Fraud Guard: Refund transaction of $438.67 exceeds the original verified payment total of $338.67. This variance indicates duplicate refund issuance or unauthorized credit adjustment. Suggested Action: Place immediate freeze on refund disbursement and escalate to Senior Compliance.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 483,
      "run_id": 18,
      "type": "EXCESS_REFUND",
      "severity": "HIGH",
      "description": "Refund 498.00 exceeds payment 398.00",
      "status": "OPEN",
      "related_order_id": "ORD0191",
      "related_payment_id": "PAY0206",
      "action_status": "PENDING",
      "required_role": "ADMIN",
      "suggested_action": "ESCALATE",
      "action": {
        "id": 62,
        "suggested_action": "ESCALATE",
        "llm_explanation": "Autonomous Fraud Guard: Refund transaction of $498.00 exceeds the original verified payment total of $398.00. This variance indicates duplicate refund issuance or unauthorized credit adjustment. Suggested Action: Place immediate freeze on refund disbursement and escalate to Senior Compliance.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "ADMIN"
      }
    },
    {
      "id": 482,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0190",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 61,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0190, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 481,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0189",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 60,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0189, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 480,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0188",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 59,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0188, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 479,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0187",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 58,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0187, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 478,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0186",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 57,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0186, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 477,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0185",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 56,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0185, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 476,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0184",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 55,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0184, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 475,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0183",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 54,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0183, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 474,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0182",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 53,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0182, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 473,
      "run_id": 18,
      "type": "MISSING_DRC",
      "severity": "LOW",
      "description": "Payment received but no DRC found",
      "status": "OPEN",
      "related_order_id": "ORD0181",
      "related_payment_id": null,
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_DOCUMENT",
      "action": {
        "id": 52,
        "suggested_action": "REQUEST_DOCUMENT",
        "llm_explanation": "Autonomous Logistics Verification: Confirmed customer payment exists for order ORD0181, but warehouse Delivery Receipt Confirmation (DRC) is missing past the 72-hour fulfillment SLA. Inventory tracking shows items dispatched without final barcode scan. Suggested Action: Dispatch inquiry to warehouse fulfillment for physical bill of lading proof.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 472,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 470.31, got 420.31",
      "status": "OPEN",
      "related_order_id": "ORD0180",
      "related_payment_id": "PAY0190",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 51,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $420.31 against invoiced order total of $470.31, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 471,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 489.53, got 439.53",
      "status": "OPEN",
      "related_order_id": "ORD0179",
      "related_payment_id": "PAY0189",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 50,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $439.53 against invoiced order total of $489.53, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 470,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 453.65, got 403.65",
      "status": "OPEN",
      "related_order_id": "ORD0178",
      "related_payment_id": "PAY0188",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 49,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $403.65 against invoiced order total of $453.65, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 469,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 241.47, got 191.47",
      "status": "OPEN",
      "related_order_id": "ORD0177",
      "related_payment_id": "PAY0187",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 48,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $191.47 against invoiced order total of $241.47, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 468,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 372.83, got 322.83",
      "status": "OPEN",
      "related_order_id": "ORD0176",
      "related_payment_id": "PAY0186",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 47,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $322.83 against invoiced order total of $372.83, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 467,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 459.57, got 409.57",
      "status": "OPEN",
      "related_order_id": "ORD0175",
      "related_payment_id": "PAY0185",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 46,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $409.57 against invoiced order total of $459.57, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 466,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 223.30, got 173.30",
      "status": "OPEN",
      "related_order_id": "ORD0174",
      "related_payment_id": "PAY0184",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 45,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $173.30 against invoiced order total of $223.30, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 465,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 271.91, got 221.91",
      "status": "OPEN",
      "related_order_id": "ORD0173",
      "related_payment_id": "PAY0183",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 44,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $221.91 against invoiced order total of $271.91, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 464,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 333.00, got 283.00",
      "status": "OPEN",
      "related_order_id": "ORD0172",
      "related_payment_id": "PAY0182",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 43,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $283.00 against invoiced order total of $333.00, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 463,
      "run_id": 18,
      "type": "UNDERPAYMENT",
      "severity": "MEDIUM",
      "description": "Underpayment. Expected 318.24, got 268.24",
      "status": "OPEN",
      "related_order_id": "ORD0171",
      "related_payment_id": "PAY0181",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REQUEST_FUNDS",
      "action": {
        "id": 42,
        "suggested_action": "REQUEST_FUNDS",
        "llm_explanation": "Autonomous Ledger Audit: Customer remitted $268.24 against invoiced order total of $318.24, creating an uncollected shortfall of $50.00. Analysis suggests unexpected bank wire transfer fee deduction or partial remittance. Suggested Action: Trigger automated dunning invoice to customer requesting remainder.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 462,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 83.86, got 133.86",
      "status": "OPEN",
      "related_order_id": "ORD0170",
      "related_payment_id": "PAY0180",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 41,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $133.86 exceeds invoiced order total of $83.86 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 461,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 302.41, got 352.41",
      "status": "OPEN",
      "related_order_id": "ORD0169",
      "related_payment_id": "PAY0179",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 40,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $352.41 exceeds invoiced order total of $302.41 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 460,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 298.26, got 348.26",
      "status": "OPEN",
      "related_order_id": "ORD0168",
      "related_payment_id": "PAY0178",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 39,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $348.26 exceeds invoiced order total of $298.26 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 459,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 122.71, got 172.71",
      "status": "OPEN",
      "related_order_id": "ORD0167",
      "related_payment_id": "PAY0177",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 38,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $172.71 exceeds invoiced order total of $122.71 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 458,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 336.70, got 386.70",
      "status": "OPEN",
      "related_order_id": "ORD0166",
      "related_payment_id": "PAY0176",
      "action_status": "PENDING",
      "required_role": "ADMIN",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 37,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $386.70 exceeds invoiced order total of $336.70 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "ADMIN"
      }
    },
    {
      "id": 457,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 51.60, got 101.60",
      "status": "OPEN",
      "related_order_id": "ORD0165",
      "related_payment_id": "PAY0175",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 36,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $101.60 exceeds invoiced order total of $51.60 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 456,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 423.21, got 473.21",
      "status": "OPEN",
      "related_order_id": "ORD0164",
      "related_payment_id": "PAY0174",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 35,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $473.21 exceeds invoiced order total of $423.21 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 455,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 91.53, got 141.53",
      "status": "OPEN",
      "related_order_id": "ORD0163",
      "related_payment_id": "PAY0173",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 34,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $141.53 exceeds invoiced order total of $91.53 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 454,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 457.40, got 507.40",
      "status": "OPEN",
      "related_order_id": "ORD0162",
      "related_payment_id": "PAY0172",
      "action_status": "PENDING",
      "required_role": "FINANCE_MANAGER",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 33,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $507.40 exceeds invoiced order total of $457.40 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "FINANCE_MANAGER"
      }
    },
    {
      "id": 453,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 277.43, got 327.43",
      "status": "OPEN",
      "related_order_id": "ORD0161",
      "related_payment_id": "PAY0171",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 32,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $327.43 exceeds invoiced order total of $277.43 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 452,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 141.62",
      "status": "OPEN",
      "related_order_id": "ORD0160",
      "related_payment_id": "PAY0170",
      "action_status": "PENDING",
      "required_role": "ADMIN",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 31,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $141.62 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "PENDING",
        "required_role": "ADMIN"
      }
    },
    {
      "id": 451,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 144.78",
      "status": "OPEN",
      "related_order_id": "ORD0159",
      "related_payment_id": "PAY0168",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 30,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $144.78 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 450,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 172.56",
      "status": "OPEN",
      "related_order_id": "ORD0158",
      "related_payment_id": "PAY0166",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 29,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $172.56 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 449,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 384.09",
      "status": "OPEN",
      "related_order_id": "ORD0157",
      "related_payment_id": "PAY0164",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 28,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $384.09 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 448,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 169.01",
      "status": "OPEN",
      "related_order_id": "ORD0156",
      "related_payment_id": "PAY0162",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 27,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $169.01 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 447,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 472.52",
      "status": "OPEN",
      "related_order_id": "ORD0155",
      "related_payment_id": "PAY0160",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 26,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $472.52 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 446,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 184.72",
      "status": "OPEN",
      "related_order_id": "ORD0154",
      "related_payment_id": "PAY0158",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 25,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $184.72 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 445,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 53.52",
      "status": "OPEN",
      "related_order_id": "ORD0153",
      "related_payment_id": "PAY0156",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 24,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $53.52 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 444,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 325.25",
      "status": "OPEN",
      "related_order_id": "ORD0152",
      "related_payment_id": "PAY0154",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 23,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $325.25 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 443,
      "run_id": 18,
      "type": "DUPLICATE_PAYMENT",
      "severity": "HIGH",
      "description": "Duplicate payment detected for amount 425.19",
      "status": "OPEN",
      "related_order_id": "ORD0151",
      "related_payment_id": "PAY0152",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "REVERSE_PAYMENT",
      "action": {
        "id": 22,
        "suggested_action": "REVERSE_PAYMENT",
        "llm_explanation": "Autonomous Velocity Sentry: Multiple identical payment transactions of $425.19 captured within 90 seconds under the same customer cart. Analysis confirms rapid retry during gateway checkout. Suggested Action: Execute gateway reversal on secondary transaction authorization.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 442,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 60000.00, got 65000.00",
      "status": "RESOLVED",
      "related_order_id": "TEST_ADMIN",
      "related_payment_id": "PAY_ADMIN",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 21,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $65000.00 exceeds invoiced order total of $60000.00 by $5000.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 441,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 5000.00, got 5500.00",
      "status": "OPEN",
      "related_order_id": "TEST_MANAGER",
      "related_payment_id": "PAY_MANAGER",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 20,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $5500.00 exceeds invoiced order total of $5000.00 by $500.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    },
    {
      "id": 440,
      "run_id": 18,
      "type": "OVERPAYMENT",
      "severity": "MEDIUM",
      "description": "Overpayment. Expected 500.00, got 550.00",
      "status": "OPEN",
      "related_order_id": "TEST_AUTO",
      "related_payment_id": "PAY_AUTO",
      "action_status": "APPROVED",
      "required_role": "NONE",
      "suggested_action": "ISSUE_REFUND",
      "action": {
        "id": 19,
        "suggested_action": "ISSUE_REFUND",
        "llm_explanation": "Autonomous Balance Check: Received payment of $550.00 exceeds invoiced order total of $500.00 by $50.00. Customer likely paid duplicate invoice charges or miscalculated tax additions. Suggested Action: Issue automated partial gateway refund or allocate credit memo to customer account.",
        "explanation_source": "groq",
        "status": "APPROVED",
        "required_role": "NONE"
      }
    }
  ],
  "auditLogs": [
    {
      "id": 218,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "21",
      "user_id": 1,
      "old_value": null,
      "new_value": {
        "status": "APPROVED",
        "comments": "Approved via React Command Center"
      },
      "timestamp": "2026-10-11T09:04:02.133160"
    },
    {
      "id": 217,
      "action": "LOGIN",
      "entity_type": "User",
      "entity_id": "1",
      "user_id": 1,
      "old_value": null,
      "new_value": null,
      "timestamp": "2026-10-11T09:01:54.529405"
    },
    {
      "id": 216,
      "action": "LOGIN",
      "entity_type": "User",
      "entity_id": "1",
      "user_id": 1,
      "old_value": null,
      "new_value": null,
      "timestamp": "2026-10-11T08:56:28.807806"
    },
    {
      "id": 215,
      "action": "LOGIN",
      "entity_type": "User",
      "entity_id": "3",
      "user_id": 3,
      "old_value": null,
      "new_value": null,
      "timestamp": "2026-10-11T08:55:26.489387"
    },
    {
      "id": 214,
      "action": "LOGIN",
      "entity_type": "User",
      "entity_id": "2",
      "user_id": 2,
      "old_value": null,
      "new_value": null,
      "timestamp": "2026-10-11T08:53:05.870234"
    },
    {
      "id": 213,
      "action": "LOGIN",
      "entity_type": "User",
      "entity_id": "2",
      "user_id": 2,
      "old_value": null,
      "new_value": null,
      "timestamp": "2026-10-11T08:51:55.458914"
    },
    {
      "id": 212,
      "action": "RUN_FINISH",
      "entity_type": "ReconciliationRun",
      "entity_id": "18",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "status": "COMPLETED",
        "discrepancies": 53
      },
      "timestamp": "2026-10-11T08:36:33.313201"
    },
    {
      "id": 211,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "71",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.307214"
    },
    {
      "id": 210,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "71",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "INVESTIGATE_ORPHAN",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.306059"
    },
    {
      "id": 209,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "70",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.304779"
    },
    {
      "id": 208,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "70",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "INVESTIGATE_ORPHAN",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.302897"
    },
    {
      "id": 207,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "69",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.301423"
    },
    {
      "id": 206,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "69",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "INVESTIGATE_ORPHAN",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.300215"
    },
    {
      "id": 205,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "68",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.299045"
    },
    {
      "id": 204,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "68",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "INVESTIGATE_ORPHAN",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.297628"
    },
    {
      "id": 203,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "67",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.296397"
    },
    {
      "id": 202,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "67",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "INVESTIGATE_ORPHAN",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.294788"
    },
    {
      "id": 201,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "66",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.293400"
    },
    {
      "id": 200,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "66",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "ESCALATE",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.289902"
    },
    {
      "id": 199,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "65",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.285122"
    },
    {
      "id": 198,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "65",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "ESCALATE",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.277616"
    },
    {
      "id": 197,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "64",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.274174"
    },
    {
      "id": 196,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "64",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "ESCALATE",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.268559"
    },
    {
      "id": 195,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "63",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.263155"
    },
    {
      "id": 194,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "63",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "ESCALATE",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.259206"
    },
    {
      "id": 193,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "62",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.253526"
    },
    {
      "id": 192,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "62",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "ESCALATE",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.247554"
    },
    {
      "id": 191,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "61",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.244185"
    },
    {
      "id": 190,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "61",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.237849"
    },
    {
      "id": 189,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "60",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.229853"
    },
    {
      "id": 188,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "60",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.221489"
    },
    {
      "id": 187,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "59",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.214193"
    },
    {
      "id": 186,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "59",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.211072"
    },
    {
      "id": 185,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "58",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.207173"
    },
    {
      "id": 184,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "58",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.199646"
    },
    {
      "id": 183,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "57",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.187995"
    },
    {
      "id": 182,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "57",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.181362"
    },
    {
      "id": 181,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "56",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.177943"
    },
    {
      "id": 180,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "56",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.176241"
    },
    {
      "id": 179,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "55",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.173242"
    },
    {
      "id": 178,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "55",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.168932"
    },
    {
      "id": 177,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "54",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.164397"
    },
    {
      "id": 176,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "54",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.161468"
    },
    {
      "id": 175,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "53",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.159904"
    },
    {
      "id": 174,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "53",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.157577"
    },
    {
      "id": 173,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "52",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.154102"
    },
    {
      "id": 172,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "52",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_DOCUMENT",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.152150"
    },
    {
      "id": 171,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "51",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.150771"
    },
    {
      "id": 170,
      "action": "ACTION_PROPOSED",
      "entity_type": "CorrectiveAction",
      "entity_id": "51",
      "user_id": 2,
      "old_value": null,
      "new_value": {
        "suggested_action": "REQUEST_FUNDS",
        "required_role": "NONE"
      },
      "timestamp": "2026-10-11T08:36:33.148707"
    },
    {
      "id": 169,
      "action": "ACTION_APPROVED",
      "entity_type": "CorrectiveAction",
      "entity_id": "50",
      "user_id": null,
      "old_value": null,
      "new_value": {
        "comments": "Auto-approved (< 1,000 threshold)"
      },
      "timestamp": "2026-10-11T08:36:33.146949"
    }
  ],
  "agentDecisions": [
    {
      "id": 46,
      "run_id": 17,
      "agent_name": "ResolutionAgent",
      "input_data": {
        "discrepancies": 1
      },
      "reasoning": {
        "rules": "Policy thresholds and mapping table"
      },
      "output_data": {
        "actions_generated": 1
      },
      "confidence": 100.0,
      "latency_ms": 2123,
      "created_at": "2026-10-11T08:52:18.738066"
    },
    {
      "id": 45,
      "run_id": 16,
      "agent_name": "ResolutionAgent",
      "input_data": {
        "discrepancies": 1
      },
      "reasoning": {
        "rules": "Policy thresholds and mapping table"
      },
      "output_data": {
        "actions_generated": 1
      },
      "confidence": 100.0,
      "latency_ms": 1962,
      "created_at": "2026-10-11T08:51:57.441453"
    },
    {
      "id": 44,
      "run_id": 17,
      "agent_name": "ResolutionAgent",
      "input_data": {
        "discrepancies": 1
      },
      "reasoning": {
        "rules": "Policy thresholds and mapping table"
      },
      "output_data": {
        "actions_generated": 1
      },
      "confidence": 100.0,
      "latency_ms": 2405,
      "created_at": "2026-10-11T08:51:57.424252"
    },
    {
      "id": 43,
      "run_id": 18,
      "agent_name": "ResolutionAgent",
      "input_data": {
        "discrepancies": 53
      },
      "reasoning": {
        "rules": "Policy thresholds and mapping table"
      },
      "output_data": {
        "actions_generated": 53
      },
      "confidence": 100.0,
      "latency_ms": 27805,
      "created_at": "2026-10-11T08:36:32.591599"
    },
    {
      "id": 42,
      "run_id": 18,
      "agent_name": "AnomalyAgent",
      "input_data": {
        "groups": 198,
        "orphans": 5
      },
      "reasoning": {
        "rules": [
          "DUPLICATE_PAYMENT",
          "OVERPAYMENT",
          "UNDERPAYMENT",
          "MISSING_DRC",
          "ORPHAN_PAYMENT",
          "EXCESS_REFUND"
        ]
      },
      "output_data": {
        "discrepancies_found": 53
      },
      "confidence": 100.0,
      "latency_ms": 1,
      "created_at": "2026-10-11T08:36:04.745986"
    },
    {
      "id": 41,
      "run_id": 18,
      "agent_name": "MatchingAgent",
      "input_data": {
        "orders_count": 198,
        "payments_count": 213
      },
      "reasoning": {
        "rule": "Group by order_id or mark as orphan"
      },
      "output_data": {
        "matched_groups": 198,
        "orphans": 5
      },
      "confidence": 100.0,
      "latency_ms": 7,
      "created_at": "2026-10-11T08:36:04.745982"
    },
    {
      "id": 40,
      "run_id": 17,
      "agent_name": "AnomalyAgent",
      "input_data": {
        "groups": 198,
        "orphans": 5
      },
      "reasoning": {
        "rules": [
          "DUPLICATE_PAYMENT",
          "OVERPAYMENT",
          "UNDERPAYMENT",
          "MISSING_DRC",
          "ORPHAN_PAYMENT",
          "EXCESS_REFUND"
        ]
      },
      "output_data": {
        "discrepancies_found": 53
      },
      "confidence": 100.0,
      "latency_ms": 0,
      "created_at": "2026-10-11T08:30:45.729775"
    },
    {
      "id": 39,
      "run_id": 17,
      "agent_name": "MatchingAgent",
      "input_data": {
        "orders_count": 198,
        "payments_count": 213
      },
      "reasoning": {
        "rule": "Group by order_id or mark as orphan"
      },
      "output_data": {
        "matched_groups": 198,
        "orphans": 5
      },
      "confidence": 100.0,
      "latency_ms": 4,
      "created_at": "2026-10-11T08:30:45.729772"
    },
    {
      "id": 38,
      "run_id": 16,
      "agent_name": "AnomalyAgent",
      "input_data": {
        "groups": 198,
        "orphans": 5
      },
      "reasoning": {
        "rules": [
          "DUPLICATE_PAYMENT",
          "OVERPAYMENT",
          "UNDERPAYMENT",
          "MISSING_DRC",
          "ORPHAN_PAYMENT",
          "EXCESS_REFUND"
        ]
      },
      "output_data": {
        "discrepancies_found": 53
      },
      "confidence": 100.0,
      "latency_ms": 1,
      "created_at": "2026-10-11T08:28:32.012973"
    },
    {
      "id": 37,
      "run_id": 16,
      "agent_name": "MatchingAgent",
      "input_data": {
        "orders_count": 198,
        "payments_count": 213
      },
      "reasoning": {
        "rule": "Group by order_id or mark as orphan"
      },
      "output_data": {
        "matched_groups": 198,
        "orphans": 5
      },
      "confidence": 100.0,
      "latency_ms": 7,
      "created_at": "2026-10-11T08:28:32.012968"
    },
    {
      "id": 36,
      "run_id": 15,
      "agent_name": "ResolutionAgent",
      "input_data": {
        "discrepancies": 3
      },
      "reasoning": {
        "rules": "Policy thresholds and mapping table"
      },
      "output_data": {
        "actions_generated": 3
      },
      "confidence": 100.0,
      "latency_ms": 209472,
      "created_at": "2026-10-10T20:27:14.634123"
    },
    {
      "id": 35,
      "run_id": 14,
      "agent_name": "ResolutionAgent",
      "input_data": {
        "discrepancies": 3
      },
      "reasoning": {
        "rules": "Policy thresholds and mapping table"
      },
      "output_data": {
        "actions_generated": 3
      },
      "confidence": 100.0,
      "latency_ms": 208613,
      "created_at": "2026-10-10T20:24:23.576169"
    },
    {
      "id": 34,
      "run_id": 15,
      "agent_name": "AnomalyAgent",
      "input_data": {
        "groups": 3,
        "orphans": 0
      },
      "reasoning": {
        "rules": [
          "DUPLICATE_PAYMENT",
          "OVERPAYMENT",
          "UNDERPAYMENT",
          "MISSING_DRC",
          "ORPHAN_PAYMENT",
          "EXCESS_REFUND"
        ]
      },
      "output_data": {
        "discrepancies_found": 3
      },
      "confidence": 100.0,
      "latency_ms": 0,
      "created_at": "2026-10-10T20:23:45.140526"
    },
    {
      "id": 33,
      "run_id": 15,
      "agent_name": "MatchingAgent",
      "input_data": {
        "orders_count": 3,
        "payments_count": 3
      },
      "reasoning": {
        "rule": "Group by order_id or mark as orphan"
      },
      "output_data": {
        "matched_groups": 3,
        "orphans": 0
      },
      "confidence": 100.0,
      "latency_ms": 3,
      "created_at": "2026-10-10T20:23:45.140521"
    },
    {
      "id": 32,
      "run_id": 14,
      "agent_name": "AnomalyAgent",
      "input_data": {
        "groups": 3,
        "orphans": 0
      },
      "reasoning": {
        "rules": [
          "DUPLICATE_PAYMENT",
          "OVERPAYMENT",
          "UNDERPAYMENT",
          "MISSING_DRC",
          "ORPHAN_PAYMENT",
          "EXCESS_REFUND"
        ]
      },
      "output_data": {
        "discrepancies_found": 3
      },
      "confidence": 100.0,
      "latency_ms": 0,
      "created_at": "2026-10-10T20:20:54.946299"
    },
    {
      "id": 31,
      "run_id": 14,
      "agent_name": "MatchingAgent",
      "input_data": {
        "orders_count": 3,
        "payments_count": 3
      },
      "reasoning": {
        "rule": "Group by order_id or mark as orphan"
      },
      "output_data": {
        "matched_groups": 3,
        "orphans": 0
      },
      "confidence": 100.0,
      "latency_ms": 1,
      "created_at": "2026-10-10T20:20:54.946297"
    }
  ]
};
