package com.teamflow.service;

import com.teamflow.dto.TaskRequest;
import com.teamflow.dto.TaskResponse;
import com.teamflow.entity.*;
import com.teamflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    // ──────────────────────────────────────────────────────────
    // CREATE TASK
    // ──────────────────────────────────────────────────────────
    public TaskResponse create(TaskRequest request) {

        Project project = projectRepo.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User user = userRepo.findById(request.getAssignedToUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setProject(project);
        task.setAssignedTo(user);
        task.setStatus(TaskStatus.TODO);

        if (request.getPriority() != null) {
            task.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));
        } else {
            task.setPriority(Priority.MEDIUM);
        }

        task.setDueDate(request.getDueDate());

        return mapToDTO(taskRepo.save(task));
    }

    // ──────────────────────────────────────────────────────────
    // GET TASKS BY PROJECT (RBAC handled in controller)
    // ──────────────────────────────────────────────────────────
    public List<TaskResponse> getByProject(Long projectId) {

        List<Task> tasks = taskRepo.findByProjectId(projectId);

        return tasks.stream().map(this::mapToDTO).toList();
    }

    // ──────────────────────────────────────────────────────────
    // GET MY TASKS
    // ──────────────────────────────────────────────────────────
    public List<TaskResponse> getMyTasks() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return taskRepo.findByAssignedToEmail(email)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    // ──────────────────────────────────────────────────────────
    // UPDATE STATUS (ASSIGNEE OR ADMIN)
    // ──────────────────────────────────────────────────────────
    public TaskResponse updateStatus(Long taskId, String status, String userEmail) {

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isAssignee = task.getAssignedTo().getEmail().equals(userEmail);

        boolean isAdmin = SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAssignee && !isAdmin) {
            throw new AccessDeniedException("Not allowed to update this task");
        }

        task.setStatus(TaskStatus.valueOf(status.toUpperCase()));

        return mapToDTO(taskRepo.save(task));
    }

    // ──────────────────────────────────────────────────────────
    // UPDATE PRIORITY (ASSIGNEE OR ADMIN)
    // ──────────────────────────────────────────────────────────
    public TaskResponse updatePriority(Long taskId, String priority, String userEmail) {

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isAssignee = task.getAssignedTo().getEmail().equals(userEmail);

        boolean isAdmin = SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAssignee && !isAdmin) {
            throw new AccessDeniedException("Not allowed to update priority");
        }

        task.setPriority(Priority.valueOf(priority.toUpperCase()));

        return mapToDTO(taskRepo.save(task));
    }

    // ──────────────────────────────────────────────────────────
    // DELETE TASK (ADMIN ONLY)
    // ──────────────────────────────────────────────────────────
    public void deleteTask(Long taskId) {

        Task task = taskRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isAdmin = SecurityContextHolder.getContext()
                .getAuthentication()
                .getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException("Only admin can delete tasks");
        }

        taskRepo.delete(task);
    }

    // ──────────────────────────────────────────────────────────
    // DTO MAPPER
    // ──────────────────────────────────────────────────────────
    private TaskResponse mapToDTO(Task t) {
        return new TaskResponse(
                t.getId(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus().name(),
                t.getPriority() != null ? t.getPriority().name() : "MEDIUM",
                t.getDueDate(),
                t.getProject().getId(),
                t.getProject().getName(),
                t.getAssignedTo().getEmail(),
                t.getAssignedTo().getName()
        );
    }
}