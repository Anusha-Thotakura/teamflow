package com.teamflow.service;

import com.teamflow.dto.ProjectRequest;
import com.teamflow.dto.ProjectResponse;
import com.teamflow.entity.Project;
import com.teamflow.entity.User;
import com.teamflow.repository.ProjectRepository;
import com.teamflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository repo;
    private final UserRepository userRepository;

    // ──────────────────────────────────────────────────────────
    //  CREATE PROJECT
    // ──────────────────────────────────────────────────────────
    public ProjectResponse create(ProjectRequest request, String ownerEmail) {

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + ownerEmail));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setBudget(request.getBudget());
        project.setOwner(owner);

        Project saved = repo.save(project);
        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────────────────
    //  GET MY PROJECTS (USER)
    // ──────────────────────────────────────────────────────────
    public List<ProjectResponse> getMyProjects(String email) {
        return repo.findAllAccessibleByEmail(email)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ──────────────────────────────────────────────────────────
    //  GET ALL PROJECTS (ADMIN)
    // ──────────────────────────────────────────────────────────
    public List<ProjectResponse> getAll() {
        return repo.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ──────────────────────────────────────────────────────────
    //  ADD MEMBER TO PROJECT
    // ──────────────────────────────────────────────────────────
    public ProjectResponse addMember(Long projectId, String memberEmail, String requesterEmail) {

        Project project = repo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // 🔐 GET ROLE FROM SECURITY CONTEXT
        String role = SecurityContextHolder
                .getContext().getAuthentication()
                .getAuthorities().iterator().next().getAuthority();

        // 🔐 OWNER OR ADMIN ONLY
        if (!project.getOwner().getEmail().equals(requesterEmail)
                && !role.equals("ROLE_ADMIN")) {
            throw new RuntimeException("Only project owner or ADMIN can add members");
        }

        User member = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + memberEmail));

        if (member.getEmail().equals(project.getOwner().getEmail())) {
            throw new RuntimeException("Owner is already part of the project");
        }

        boolean alreadyMember = project.getMembers()
                .stream()
                .anyMatch(m -> m.getEmail().equals(memberEmail));

        if (alreadyMember) {
            throw new RuntimeException(memberEmail + " is already a member");
        }

        project.getMembers().add(member);
        Project saved = repo.save(project);

        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────────────────
    //  REMOVE MEMBER FROM PROJECT
    // ──────────────────────────────────────────────────────────
    public ProjectResponse removeMember(Long projectId, String memberEmail, String requesterEmail) {

        Project project = repo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        // 🔐 GET ROLE
        String role = SecurityContextHolder
                .getContext().getAuthentication()
                .getAuthorities().iterator().next().getAuthority();

        // 🔐 OWNER OR ADMIN ONLY
        if (!project.getOwner().getEmail().equals(requesterEmail)
                && !role.equals("ROLE_ADMIN")) {
            throw new RuntimeException("Only project owner or ADMIN can remove members");
        }

        project.getMembers().removeIf(m -> m.getEmail().equals(memberEmail));
        Project saved = repo.save(project);

        return mapToResponse(saved);
    }

    // ──────────────────────────────────────────────────────────
    //  GET PROJECT BY ID
    // ──────────────────────────────────────────────────────────
    public ProjectResponse getById(Long projectId) {
        Project project = repo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));
        return mapToResponse(project);
    }

    // ──────────────────────────────────────────────────────────
    //  MAPPER
    // ──────────────────────────────────────────────────────────
    public ProjectResponse mapToResponse(Project p) {

        List<String> memberEmails = p.getMembers()
                .stream()
                .map(User::getEmail)
                .toList();

        return new ProjectResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getBudget(),
                p.getOwner().getEmail(),
                p.getOwner().getName(),
                memberEmails
        );
    }
}