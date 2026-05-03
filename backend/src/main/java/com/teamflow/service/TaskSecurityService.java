package com.teamflow.security;

import com.teamflow.entity.Task;
import com.teamflow.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("taskSecurityService")
@RequiredArgsConstructor
public class TaskSecurityService {

    private final TaskRepository taskRepository;

    // ✅ Check if user is assigned to task
    public boolean isAssignee(Long taskId, Authentication auth) {

        String email = auth.getName();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        return task.getAssignedTo() != null &&
                task.getAssignedTo().getEmail().equals(email);
    }
}