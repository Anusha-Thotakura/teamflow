package com.teamflow.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Task extends BaseEntity {   // ✅ now extends BaseEntity for createdAt/updatedAt

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    // ✅ ENHANCED: Priority (LOW / MEDIUM / HIGH)
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;

    // ✅ ENHANCED: Due date for the task
    private LocalDate dueDate;

    // Existing status field (unchanged)
    @Enumerated(EnumType.STRING)
    private TaskStatus status = TaskStatus.TODO;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;
}