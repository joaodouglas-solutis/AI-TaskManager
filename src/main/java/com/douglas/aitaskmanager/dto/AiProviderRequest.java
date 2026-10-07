package com.douglas.aitaskmanager.dto;

import com.douglas.aitaskmanager.ai.AiProvider;

public record AiProviderRequest(
        AiProvider provider
) {
}