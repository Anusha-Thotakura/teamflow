package com.teamflow.dto;

import java.time.LocalDate;

// ✅ Clean DTO for adding an expense
public class ExpenseRequest {

    private String title;
    private Double amount;
    private String category;   // e.g. "Software", "Hardware", "Travel"
    private LocalDate date;
    private Long projectId;

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
}