package com.douglas.aitaskmanager.dto;

public record WorkspaceAiSummaryResponse(
        String summary,
        Long focusTaskId,
        String focusReason
) {
}