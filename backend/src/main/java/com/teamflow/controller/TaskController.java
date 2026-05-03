package com.teamflow.controller;

import com.teamflow.dto.TaskRequest;
import com.teamflow.dto.TaskResponse;
import com.teamflow.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService service;

    // 🔒 Only ADMIN or project MEMBER
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @projectSecurityService.isMember(#request.projectId, authentication)")
    public ResponseEntity<TaskResponse> create(@RequestBody TaskRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    // 🔒 Only ADMIN or project MEMBER
    @GetMapping("/project/{id}")
    @PreAuthorize("hasRole('ADMIN') or @projectSecurityService.isMember(#id, authentication)")
    public ResponseEntity<List<TaskResponse>> getByProject(@PathVariable Long id) {
        return ResponseEntity.ok(service.getByProject(id));
    }

    // ✅ Logged-in user tasks
    @GetMapping("/me")
    public ResponseEntity<List<TaskResponse>> getMyTasks() {
        return ResponseEntity.ok(service.getMyTasks());
    }

    // 🔒 Only ADMIN or ASSIGNEE
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or @taskSecurityService.isAssignee(#id, authentication)")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {

        return ResponseEntity.ok(
                service.updateStatus(id, status, principal.getName())
        );
    }

    // 🔒 Only ADMIN or ASSIGNEE ✅ FIXED
    @PutMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN') or @taskSecurityService.isAssignee(#id, authentication)")
    public ResponseEntity<TaskResponse> updatePriority(
            @PathVariable Long id,
            @RequestParam String priority,
            Principal principal) {

        return ResponseEntity.ok(
                service.updatePriority(id, priority, principal.getName())
        );
    }

    // 🔒 ADMIN ONLY
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        service.deleteTask(id);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }
}