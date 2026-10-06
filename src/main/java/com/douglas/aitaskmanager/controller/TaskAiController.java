package com.douglas.aitaskmanager.controller;

import com.douglas.aitaskmanager.dto.AiChatRequest;
import com.douglas.aitaskmanager.dto.AiChatResponse;
import com.douglas.aitaskmanager.dto.ImprovedTaskResponse;
import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;
import com.douglas.aitaskmanager.dto.WorkspaceAiSummaryResponse;
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
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                taskAiService.improveTask(id)
        );
    }

    @PostMapping("/{id}/ai/analyze")
    public ResponseEntity<TaskAnalysisResponse> analyzeTask(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                taskAiService.analyzeTask(id)
        );
    }

    @PostMapping("/{id}/ai/decompose")
    public ResponseEntity<TaskDecompositionResponse> decomposeTask(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                taskAiService.decomposeTask(id)
        );
    }

    @PostMapping("/ai/summary")
    public ResponseEntity<WorkspaceAiSummaryResponse> summarizeWorkspace() {
        return ResponseEntity.ok(
                taskAiService.summarizeWorkspace()
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