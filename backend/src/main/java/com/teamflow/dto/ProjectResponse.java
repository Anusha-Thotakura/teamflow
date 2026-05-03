package com.teamflow.dto;

import java.util.List;

// ✅ Safe project response - avoids circular JSON (User → Project → User...)
public class ProjectResponse {

    private Long id;
    private String name;
    private String description;
    private Double budget;
    private String ownerEmail;
    private String ownerName;
    private List<String> memberEmails;  // just emails - clean & simple

    // Constructor
    public ProjectResponse(Long id, String name, String description,
                           Double budget, String ownerEmail,
                           String ownerName, List<String> memberEmails) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.budget = budget;
        this.ownerEmail = ownerEmail;
        this.ownerName = ownerName;
        this.memberEmails = memberEmails;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Double getBudget() { return budget; }
    public String getOwnerEmail() { return ownerEmail; }
    public String getOwnerName() { return ownerName; }
    public List<String> getMemberEmails() { return memberEmails; }
}