package com.douglas.aitaskmanager.dto;

import java.util.List;

public record TaskDecompositionResponse(
        List<SubtaskSuggestion> subtasks
) {

    public record SubtaskSuggestion(
            String title,
            String description
    ) {
    }
}