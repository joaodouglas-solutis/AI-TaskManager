package com.douglas.aitaskmanager.dto;

import com.douglas.aitaskmanager.ai.AiProvider;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record AiChatRequest(

        @NotBlank(message = "A mensagem é obrigatória")
        String message,

        List<AiChatMessage> history,

        AiProvider provider
) {
}