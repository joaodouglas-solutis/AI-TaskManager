package com.douglas.aitaskmanager.service;

import com.douglas.aitaskmanager.ai.TaskAiClient;
import com.douglas.aitaskmanager.ai.TaskAiResponseValidator;
import com.douglas.aitaskmanager.ai.TaskDecompositionValidator;
import com.douglas.aitaskmanager.ai.WorkspaceAiSummaryValidator;
import com.douglas.aitaskmanager.dto.AiChatMessage;
import com.douglas.aitaskmanager.dto.AiChatRequest;
import com.douglas.aitaskmanager.dto.AiChatResponse;
import com.douglas.aitaskmanager.dto.ImprovedTaskResponse;
import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;
import com.douglas.aitaskmanager.dto.WorkspaceAiSummaryResponse;
import com.douglas.aitaskmanager.entity.Task;
import com.douglas.aitaskmanager.exception.TaskNotFoundException;
import com.douglas.aitaskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskAiService {

    private static final int MAX_HISTORY_MESSAGES = 6;
    private static final int MAX_HISTORY_MESSAGE_LENGTH = 400;
    private static final int MAX_CHAT_DESCRIPTION_LENGTH = 180;

    private final TaskRepository taskRepository;
    private final TaskAiClient taskAiClient;
    private final TaskAiResponseValidator taskAiResponseValidator;
    private final TaskDecompositionValidator taskDecompositionValidator;
    private final WorkspaceAiSummaryValidator workspaceAiSummaryValidator;

    public TaskAiService(
            TaskRepository taskRepository,
            TaskAiClient taskAiClient,
            TaskAiResponseValidator taskAiResponseValidator,
            TaskDecompositionValidator taskDecompositionValidator,
            WorkspaceAiSummaryValidator workspaceAiSummaryValidator
    ) {
        this.taskRepository =
                taskRepository;

        this.taskAiClient =
                taskAiClient;

        this.taskAiResponseValidator =
                taskAiResponseValidator;

        this.taskDecompositionValidator =
                taskDecompositionValidator;

        this.workspaceAiSummaryValidator =
                workspaceAiSummaryValidator;
    }

    public ImprovedTaskResponse improveTask(
            Long taskId
    ) {

        Task task =
                taskRepository.findById(taskId)
                        .orElseThrow(
                                () ->
                                        new TaskNotFoundException(
                                                taskId
                                        )
                        );

        return taskAiClient.improveTask(
                task.getTitle(),
                task.getDescription()
        );
    }

    public TaskAnalysisResponse analyzeTask(
            Long taskId
    ) {

        Task task =
                taskRepository.findById(taskId)
                        .orElseThrow(
                                () ->
                                        new TaskNotFoundException(
                                                taskId
                                        )
                        );

        TaskAnalysisResponse analysis =
                taskAiClient.analyzeTask(
                        task.getTitle(),
                        task.getDescription(),
                        task.getStatus().name(),
                        task.getPriority().name()
                );

        taskAiResponseValidator.validate(
                analysis
        );

        return analysis;
    }

    public TaskDecompositionResponse decomposeTask(
            Long taskId
    ) {

        Task task =
                taskRepository.findById(taskId)
                        .orElseThrow(
                                () ->
                                        new TaskNotFoundException(
                                                taskId
                                        )
                        );

        TaskDecompositionResponse response =
                taskAiClient.decomposeTask(
                        task.getTitle(),
                        task.getDescription()
                );

        taskDecompositionValidator.validate(
                response
        );

        return response;
    }

    public WorkspaceAiSummaryResponse summarizeWorkspace() {

        List<Task> tasks =
                taskRepository.findAll();

        List<String> taskContexts =
                tasks.stream()
                        .map(this::toAiContext)
                        .toList();

        WorkspaceAiSummaryResponse response =
                taskAiClient.summarizeWorkspace(
                        taskContexts
                );

        workspaceAiSummaryValidator.validate(
                response,
                tasks
        );

        return response;
    }

    public AiChatResponse chat(
            AiChatRequest request
    ) {

        List<Task> tasks =
                taskRepository.findAll();

        List<String> taskContexts =
                tasks.stream()
                        .map(this::toChatContext)
                        .toList();

        List<AiChatMessage> history =
                request.history() == null
                        ? List.of()
                        : request.history();

        history =
                compactHistory(history);

        return taskAiClient.chat(
                request.message().trim(),
                history,
                taskContexts
        );
    }

    private List<AiChatMessage> compactHistory(
            List<AiChatMessage> history
    ) {

        if (history.isEmpty()) {
            return List.of();
        }

        int startIndex =
                Math.max(
                        0,
                        history.size() -
                                MAX_HISTORY_MESSAGES
                );

        return history
                .subList(
                        startIndex,
                        history.size()
                )
                .stream()
                .map(message ->
                        new AiChatMessage(
                                message.role(),
                                truncate(
                                        message.content(),
                                        MAX_HISTORY_MESSAGE_LENGTH
                                )
                        )
                )
                .toList();
    }

    private String toAiContext(
            Task task
    ) {

        return """
                ID: %d
                Título: %s
                Descrição: %s
                Status: %s
                Prioridade: %s
                Prazo: %s
                ID da tarefa-pai: %s
                """.formatted(
                task.getId(),
                task.getTitle(),
                task.getDescription() == null
                        ? ""
                        : task.getDescription(),
                task.getStatus().name(),
                task.getPriority().name(),
                task.getDueDate() == null
                        ? "sem prazo"
                        : task.getDueDate(),
                task.getParentTask() == null
                        ? "nenhuma"
                        : task.getParentTask().getId()
        );
    }

    private String toChatContext(
            Task task
    ) {

        String description =
                task.getDescription() == null
                        ? ""
                        : truncate(
                        task.getDescription(),
                        MAX_CHAT_DESCRIPTION_LENGTH
                );

        return """
                Tarefa:
                título=%s
                status=%s
                prioridade=%s
                prazo=%s
                descrição=%s
                """.formatted(
                task.getTitle(),
                task.getStatus().name(),
                task.getPriority().name(),
                task.getDueDate() == null
                        ? "sem prazo"
                        : task.getDueDate(),
                description
        );
    }

    private String truncate(
            String value,
            int maxLength
    ) {

        if (value == null) {
            return "";
        }

        String normalizedValue =
                value.trim();

        if (normalizedValue.length() <= maxLength) {
            return normalizedValue;
        }

        return normalizedValue.substring(
                0,
                maxLength
        ) + "...";
    }
}