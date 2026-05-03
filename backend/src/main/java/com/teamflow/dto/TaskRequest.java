package com.teamflow.dto;

import java.time.LocalDate;

// ✅ Clean request DTO for task creation / update
// Used instead of sending raw Task entity from frontend
public class TaskRequest {

    private String title;
    private String description;
    private String priority;    // "LOW" | "MEDIUM" | "HIGH"
    private String status;      // "TODO" | "IN_PROGRESS" | "DONE"
    private LocalDate dueDate;  // e.g. "2025-12-31"
    private Long projectId;
    private Long assignedToUserId;

    // Getters & Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Long getAssignedToUserId() { return assignedToUserId; }
    public void setAssignedToUserId(Long assignedToUserId) { this.assignedToUserId = assignedToUserId; }
}