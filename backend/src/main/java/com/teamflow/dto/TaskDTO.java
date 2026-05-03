package com.teamflow.dto;

import com.teamflow.entity.Priority;
import com.teamflow.entity.Status;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TaskDTO {
    private String title;
    private Status status;
    private Priority priority;
    private Long projectId;
    private Long userId;
}