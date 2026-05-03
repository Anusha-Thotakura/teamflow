package com.teamflow.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// ✅ FIX: Use @Data + @NoArgsConstructor instead of @AllArgsConstructor
//         so AIService can set fields one by one without constructor mismatch
@Data
@NoArgsConstructor
public class AIInsightResponse {

    private Long projectId;
    private String projectName;

    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long inProgressTasks;

    private double totalBudget;
    private double spent;
    private double remaining;
    private double usagePercent;

    private String aiAnalysis;
    private List<String> suggestions;
}