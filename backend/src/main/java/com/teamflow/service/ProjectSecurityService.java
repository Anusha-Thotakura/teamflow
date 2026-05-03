package com.teamflow.security;

import com.teamflow.entity.Project;
import com.teamflow.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("projectSecurityService")
@RequiredArgsConstructor
public class ProjectSecurityService {

    private final ProjectRepository projectRepository;

    // ✅ Check if user is project OWNER
    public boolean isOwner(Long projectId, Authentication auth) {
        String email = auth.getName();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return project.getOwner().getEmail().equals(email);
    }

    // ✅ Check if user is MEMBER or OWNER
    public boolean isMember(Long projectId, Authentication auth) {
        String email = auth.getName();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        boolean isOwner = project.getOwner().getEmail().equals(email);

        boolean isMember = project.getMembers()
                .stream()
                .anyMatch(user -> user.getEmail().equals(email));

        return isOwner || isMember;
    }
}