package com.douglas.aitaskmanager.dto;

import com.douglas.aitaskmanager.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CreateTaskRequest(

        @NotBlank(
                message = "O título é obrigatório"
        )
        @Size(
                max = 150,
                message = "O título deve ter no máximo 150 caracteres"
        )
        String title,

        @Size(
                max = 2000,
                message = "A descrição deve ter no máximo 2000 caracteres"
        )
        String description,

        @NotNull(
                message = "A prioridade é obrigatória"
        )
        TaskPriority priority,

        LocalDate dueDate
) {
}