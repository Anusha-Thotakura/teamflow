package com.teamflow.dto;

import java.time.LocalDate;

// ✅ Updated TaskResponse with priority + dueDate
@lombok.Data
@lombok.AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;     // ✅ NEW
    private LocalDate dueDate;   // ✅ NEW
    private Long projectId;
    private String projectName;  // ✅ NEW - helpful for frontend dashboard
    private String assignedTo;   // email of assigned user
    private String assignedToName; // ✅ NEW - full name for display
}