package com.douglas.aitaskmanager.dto;

import com.douglas.aitaskmanager.enums.TaskComplexity;
import com.douglas.aitaskmanager.enums.TaskPriority;

public record TaskAnalysisResponse(

        TaskPriority priority,

        TaskComplexity complexity,

        Integer estimatedHours,

        String reason
) {
}