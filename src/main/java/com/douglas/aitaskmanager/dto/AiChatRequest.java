package com.douglas.aitaskmanager.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record AiChatRequest(
        @NotBlank(message = "A mensagem é obrigatória")
        String message,

        List<AiChatMessage> history
) {
}