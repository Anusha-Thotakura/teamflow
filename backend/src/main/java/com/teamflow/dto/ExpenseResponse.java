package com.teamflow.dto;

import java.time.LocalDate;

// ✅ Clean response DTO for an expense
@lombok.Data
@lombok.AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private String title;
    private Double amount;
    private String category;
    private LocalDate date;
    private Long projectId;
    private String projectName;
}