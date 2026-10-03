package com.douglas.aitaskmanager.dto;

import com.douglas.aitaskmanager.enums.TaskPriority;
import com.douglas.aitaskmanager.enums.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(

        Long id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        Long parentTaskId
) {
}