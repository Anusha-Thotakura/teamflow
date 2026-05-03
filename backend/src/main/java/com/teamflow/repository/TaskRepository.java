package com.teamflow.repository;

import com.teamflow.entity.Task;
import com.teamflow.entity.TaskStatus;
import com.teamflow.entity.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    // ✅ Existing queries (unchanged)
    List<Task> findByProjectId(Long projectId);
    List<Task> findByAssignedToEmail(String email);

    // ✅ NEW: Filter by status within a project
    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);

    // ✅ NEW: Filter by priority within a project
    List<Task> findByProjectIdAndPriority(Long projectId, Priority priority);

    // ✅ NEW: Count tasks by project and status (for AI insights)
    long countByProjectIdAndStatus(Long projectId, TaskStatus status);

    // ✅ NEW: Count total tasks in a project
    long countByProjectId(Long projectId);
}