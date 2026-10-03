package com.douglas.aitaskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSubtaskRequest(

        @NotBlank(message = "O título da subtarefa é obrigatório")
        @Size(max = 150, message = "O título deve ter no máximo 150 caracteres")
        String title,

        @NotBlank(message = "A descrição da subtarefa é obrigatória")
        @Size(max = 2000, message = "A descrição deve ter no máximo 2000 caracteres")
        String description
) {
}