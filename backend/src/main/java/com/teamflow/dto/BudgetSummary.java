package com.teamflow.dto;

import java.util.Map;

// ✅ Budget summary returned from GET /expenses/{projectId}/summary
@lombok.Data
@lombok.AllArgsConstructor
public class BudgetSummary {

    private Long projectId;
    private String projectName;
    private Double totalBudget;
    private Double totalSpent;
    private Double remaining;
    private Double usagePercent;
    private String budgetStatus;       // "SAFE" | "WARNING" | "CRITICAL"
    private Map<String, Double> spendingByCategory;  // e.g. { "Software": 500, "Travel": 200 }
}