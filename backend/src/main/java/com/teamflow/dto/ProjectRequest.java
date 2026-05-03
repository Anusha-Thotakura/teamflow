package com.teamflow.dto;

// ✅ Clean DTO for creating a project
// Avoids sending raw entity from frontend
public class ProjectRequest {

    private String name;
    private String description;
    private Double budget;

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
}