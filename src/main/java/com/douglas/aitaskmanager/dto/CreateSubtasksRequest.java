package com.douglas.aitaskmanager.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateSubtasksRequest(

        @NotEmpty(message = "É necessário informar pelo menos uma subtarefa")
        @Size(max = 8, message = "É permitido criar no máximo 8 subtarefas por vez")
        List<@Valid CreateSubtaskRequest> subtasks
) {
}