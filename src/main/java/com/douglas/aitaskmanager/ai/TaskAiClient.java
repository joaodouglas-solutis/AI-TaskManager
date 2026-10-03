package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.ImprovedTaskResponse;
import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;

public interface TaskAiClient {

    ImprovedTaskResponse improveTask(
            String title,
            String description
    );

    TaskAnalysisResponse analyzeTask(
            String title,
            String description,
            String status,
            String priority
    );

    TaskDecompositionResponse decomposeTask(
            String title,
            String description
    );
}