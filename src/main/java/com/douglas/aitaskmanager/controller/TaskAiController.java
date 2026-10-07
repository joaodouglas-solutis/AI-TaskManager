package com.douglas.aitaskmanager.controller;

import com.douglas.aitaskmanager.ai.AiProvider;
import com.douglas.aitaskmanager.dto.*;
import com.douglas.aitaskmanager.service.TaskAiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskAiController {

    private final TaskAiService taskAiService;

    public TaskAiController(
            TaskAiService taskAiService
    ) {
        this.taskAiService =
                taskAiService;
    }

    @PostMapping("/{id}/ai/improve")
    public ResponseEntity<ImprovedTaskResponse> improveTask(
            @PathVariable Long id,
            @RequestBody(required = false)
            AiProviderRequest request
    ) {

        AiProvider provider =
                request == null
                        ? null
                        : request.provider();

        return ResponseEntity.ok(
                taskAiService.improveTask(
                        id,
                        provider
                )
        );
    }

    @PostMapping("/{id}/ai/analyze")
    public ResponseEntity<TaskAnalysisResponse> analyzeTask(
            @PathVariable Long id,
            @RequestBody(required = false)
            AiProviderRequest request
    ) {

        AiProvider provider =
                request == null
                        ? null
                        : request.provider();

        return ResponseEntity.ok(
                taskAiService.analyzeTask(
                        id,
                        provider
                )
        );
    }

    @PostMapping("/{id}/ai/decompose")
    public ResponseEntity<TaskDecompositionResponse> decomposeTask(
            @PathVariable Long id,
            @RequestBody(required = false)
            AiProviderRequest request
    ) {

        AiProvider provider =
                request == null
                        ? null
                        : request.provider();

        return ResponseEntity.ok(
                taskAiService.decomposeTask(
                        id,
                        provider
                )
        );
    }

    @PostMapping("/ai/summary")
    public ResponseEntity<WorkspaceAiSummaryResponse> summarizeWorkspace(
            @RequestBody(required = false)
            AiProviderRequest request
    ) {

        AiProvider provider =
                request == null
                        ? null
                        : request.provider();

        return ResponseEntity.ok(
                taskAiService.summarizeWorkspace(
                        provider
                )
        );
    }

    @PostMapping("/ai/chat")
    public ResponseEntity<AiChatResponse> chat(
            @Valid @RequestBody AiChatRequest request
    ) {

        return ResponseEntity.ok(
                taskAiService.chat(request)
        );
    }
}