package com.teamflow.controller;

import com.teamflow.dto.ProjectRequest;
import com.teamflow.dto.ProjectResponse;
import com.teamflow.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // ✅ ADD
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService service;

    // ✅ Create project (any authenticated user)
    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @RequestBody ProjectRequest request,
            Principal principal) {

        ProjectResponse response = service.create(request, principal.getName());
        return ResponseEntity.ok(response);
    }

    // ✅ User's own projects
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getMyProjects(Principal principal) {
        return ResponseEntity.ok(service.getMyProjects(principal.getName()));
    }

    // 🔒 ADMIN ONLY
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProjectResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // 🔒 Only ADMIN or project MEMBER/OWNER
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurityService.isMember(#id, authentication)")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // 🔒 Only ADMIN or OWNER
    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurityService.isOwner(#id, authentication)")
    public ResponseEntity<ProjectResponse> addMember(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {

        String memberEmail = body.get("email");

        if (memberEmail == null || memberEmail.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        ProjectResponse response = service.addMember(id, memberEmail, principal.getName());
        return ResponseEntity.ok(response);
    }

    // 🔒 Only ADMIN or OWNER
    @DeleteMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurityService.isOwner(#id, authentication)")
    public ResponseEntity<ProjectResponse> removeMember(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Principal principal) {

        String memberEmail = body.get("email");

        if (memberEmail == null || memberEmail.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        ProjectResponse response = service.removeMember(id, memberEmail, principal.getName());
        return ResponseEntity.ok(response);
    }
}