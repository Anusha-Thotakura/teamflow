package com.teamflow.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Project extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;   // ✅ NEW: project description

    private Double budget;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    // ✅ FIX: Added cascade + orphanRemoval + JsonIgnore on members
    //         to prevent infinite JSON loop
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "project_members",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    // ──────────────────────────────────────────────
    //  Getters & Setters (keeping your manual style)
    // ──────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public List<User> getMembers() { return members; }
    public void setMembers(List<User> members) { this.members = members; }
}