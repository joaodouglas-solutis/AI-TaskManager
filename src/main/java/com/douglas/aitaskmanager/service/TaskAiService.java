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
import com.douglas.aitaskmanager.enums.TaskPriority;
import com.douglas.aitaskmanager.enums.TaskStatus;
import com.douglas.aitaskmanager.exception.TaskNotFoundException;
import com.douglas.aitaskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TaskAiService {

    private static final int MAX_HISTORY_MESSAGES = 6;
    private static final int MAX_HISTORY_MESSAGE_LENGTH = 300;
    private static final int MAX_CHAT_MESSAGE_LENGTH = 500;
    private static final int MAX_CHAT_DESCRIPTION_LENGTH = 140;
    private static final int MAX_CHAT_TASKS = 16;

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
        this.taskRepository = taskRepository;
        this.taskAiClient = taskAiClient;
        this.taskAiResponseValidator = taskAiResponseValidator;
        this.taskDecompositionValidator = taskDecompositionValidator;
        this.workspaceAiSummaryValidator = workspaceAiSummaryValidator;
    }

    public ImprovedTaskResponse improveTask(
            Long taskId
    ) {

        Task task =
                taskRepository.findById(taskId)
                        .orElseThrow(
                                () ->
                                        new TaskNotFoundException(taskId)
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
                                        new TaskNotFoundException(taskId)
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
                                        new TaskNotFoundException(taskId)
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

        String message =
                truncate(
                        request.message().trim(),
                        MAX_CHAT_MESSAGE_LENGTH
                );

        List<AiChatMessage> history =
                request.history() == null
                        ? List.of()
                        : compactHistory(
                        request.history()
                );

        List<String> taskContexts =
                buildRelevantChatContexts(
                        tasks,
                        message
                );

        return taskAiClient.chat(
                message,
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
                                normalizeRole(
                                        message.role()
                                ),
                                truncate(
                                        message.content(),
                                        MAX_HISTORY_MESSAGE_LENGTH
                                )
                        )
                )
                .toList();
    }

    private List<String> buildRelevantChatContexts(
            List<Task> tasks,
            String message
    ) {

        if (tasks.isEmpty()) {
            return List.of(
                    buildWorkspaceOverview(tasks)
            );
        }

        String normalizedMessage =
                normalizeSearchText(message);

        Set<String> queryTerms =
                extractQueryTerms(
                        normalizedMessage
                );

        List<Task> relevantTasks =
                tasks.stream()
                        .sorted(
                                Comparator
                                        .comparingInt(
                                                (Task task) ->
                                                        scoreTask(
                                                                task,
                                                                normalizedMessage,
                                                                queryTerms
                                                        )
                                        )
                                        .reversed()
                                        .thenComparing(
                                                this::compareDueDates
                                        )
                        )
                        .limit(MAX_CHAT_TASKS)
                        .toList();

        List<String> contexts =
                new java.util.ArrayList<>();

        contexts.add(
                buildWorkspaceOverview(tasks)
        );

        contexts.add(
                "Tarefas mais relevantes para a pergunta:"
        );

        relevantTasks.forEach(
                task ->
                        contexts.add(
                                toChatContext(task)
                        )
        );

        return List.copyOf(contexts);
    }

    private int scoreTask(
            Task task,
            String normalizedMessage,
            Set<String> queryTerms
    ) {

        int score = 0;

        String title =
                normalizeSearchText(
                        task.getTitle()
                );

        String description =
                normalizeSearchText(
                        task.getDescription()
                );

        String searchableText =
                title + " " + description;

        for (String term : queryTerms) {

            if (title.contains(term)) {
                score += 6;
            }

            if (description.contains(term)) {
                score += 2;
            }
        }

        if (!normalizedMessage.isBlank()
                && title.contains(normalizedMessage)) {

            score += 15;
        }

        if (containsAny(
                normalizedMessage,
                "alta",
                "prioridade alta"
        )) {

            if (task.getPriority() ==
                    TaskPriority.HIGH) {

                score += 12;
            }
        }

        if (containsAny(
                normalizedMessage,
                "media",
                "média"
        )) {

            if (task.getPriority() ==
                    TaskPriority.MEDIUM) {

                score += 12;
            }
        }

        if (containsAny(
                normalizedMessage,
                "baixa",
                "prioridade baixa"
        )) {

            if (task.getPriority() ==
                    TaskPriority.LOW) {

                score += 12;
            }
        }

        if (containsAny(
                normalizedMessage,
                "concluida",
                "concluída",
                "concluidas",
                "concluídas",
                "finalizada",
                "finalizadas"
        )) {

            if (task.getStatus() ==
                    TaskStatus.DONE) {

                score += 12;
            }
        }

        if (containsAny(
                normalizedMessage,
                "em andamento",
                "andamento",
                "fazendo"
        )) {

            if (task.getStatus() ==
                    TaskStatus.IN_PROGRESS) {

                score += 12;
            }
        }

        if (containsAny(
                normalizedMessage,
                "a fazer",
                "pendente",
                "pendentes",
                "aberta",
                "abertas"
        )) {

            if (task.getStatus() ==
                    TaskStatus.TODO) {

                score += 12;
            }
        }

        boolean isOverdue =
                task.getDueDate() != null &&
                        task.getDueDate().isBefore(
                                LocalDate.now()
                        ) &&
                        task.getStatus() !=
                                TaskStatus.DONE;

        if (containsAny(
                normalizedMessage,
                "atrasada",
                "atrasadas",
                "atrasado",
                "atrasados",
                "vencida",
                "vencidas",
                "venceu",
                "prazo"
        )) {

            if (isOverdue) {
                score += 16;
            }
        }

        if (containsAny(
                normalizedMessage,
                "primeiro",
                "primeira",
                "priorizar",
                "prioridade",
                "importante",
                "urgente"
        )) {

            if (task.getStatus() !=
                    TaskStatus.DONE) {

                score += 4;
            }

            if (task.getPriority() ==
                    TaskPriority.HIGH) {

                score += 6;
            }

            if (task.getDueDate() != null) {
                score += 3;
            }
        }

        if (task.getStatus() !=
                TaskStatus.DONE) {

            score += 2;
        }

        if (task.getPriority() ==
                TaskPriority.HIGH) {

            score += 3;
        }

        if (task.getDueDate() != null) {

            if (isOverdue) {
                score += 8;
            } else if (
                    task.getDueDate().isEqual(
                            LocalDate.now()
                    )
            ) {
                score += 7;
            } else if (
                    task.getDueDate().isBefore(
                            LocalDate.now().plusDays(3)
                    )
            ) {
                score += 4;
            }
        }

        if (searchableText.contains(
                normalizedMessage
        )) {
            score += 5;
        }

        return score;
    }

    private String buildWorkspaceOverview(
            List<Task> tasks
    ) {

        int total =
                tasks.size();

        int todo =
                (int) tasks.stream()
                        .filter(
                                task ->
                                        task.getStatus() ==
                                                TaskStatus.TODO
                        )
                        .count();

        int inProgress =
                (int) tasks.stream()
                        .filter(
                                task ->
                                        task.getStatus() ==
                                                TaskStatus.IN_PROGRESS
                        )
                        .count();

        int done =
                (int) tasks.stream()
                        .filter(
                                task ->
                                        task.getStatus() ==
                                                TaskStatus.DONE
                        )
                        .count();

        int highPriority =
                (int) tasks.stream()
                        .filter(
                                task ->
                                        task.getPriority() ==
                                                TaskPriority.HIGH &&
                                                task.getStatus() !=
                                                        TaskStatus.DONE
                        )
                        .count();

        int overdue =
                (int) tasks.stream()
                        .filter(
                                task ->
                                        task.getDueDate() != null &&
                                                task.getDueDate()
                                                        .isBefore(
                                                                LocalDate.now()
                                                        ) &&
                                                task.getStatus() !=
                                                        TaskStatus.DONE
                        )
                        .count();

        return """
                Resumo do workspace:
                total=%d
                a_fazer=%d
                em_andamento=%d
                concluidas=%d
                alta_prioridade_em_aberto=%d
                atrasadas=%d
                """.formatted(
                total,
                todo,
                inProgress,
                done,
                highPriority,
                overdue
        );
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
                - "%s" | status=%s | prioridade=%s | prazo=%s | descrição=%s
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

    private Set<String> extractQueryTerms(
            String message
    ) {

        return new HashSet<>(
                Arrays.stream(
                                message.split("\\s+")
                        )
                        .map(String::trim)
                        .filter(
                                term ->
                                        term.length() >= 3
                        )
                        .filter(
                                term ->
                                        !Set.of(
                                                        "qual",
                                                        "quais",
                                                        "quero",
                                                        "como",
                                                        "posso",
                                                        "para",
                                                        "minhas",
                                                        "minha",
                                                        "tenho",
                                                        "fazer",
                                                        "tarefas",
                                                        "tarefa",
                                                        "isso",
                                                        "essa",
                                                        "esse",
                                                        "uma",
                                                        "umas",
                                                        "que",
                                                        "das",
                                                        "dos",
                                                        "com"
                                                )
                                                .contains(term)
                        )
                        .toList()
        );
    }

    private boolean containsAny(
            String value,
            String... terms
    ) {

        for (String term : terms) {

            if (value.contains(
                    normalizeSearchText(term)
            )) {
                return true;
            }
        }

        return false;
    }

    private int compareDueDates(
            Task first,
            Task second
    ) {

        LocalDate firstDate =
                first.getDueDate();

        LocalDate secondDate =
                second.getDueDate();

        if (firstDate == null &&
                secondDate == null) {

            return 0;
        }

        if (firstDate == null) {
            return 1;
        }

        if (secondDate == null) {
            return -1;
        }

        return firstDate.compareTo(
                secondDate
        );
    }

    private String normalizeRole(
            String role
    ) {

        if ("assistant".equalsIgnoreCase(role)) {
            return "assistant";
        }

        return "user";
    }

    private String normalizeSearchText(
            String value
    ) {

        if (value == null) {
            return "";
        }

        return Normalizer
                .normalize(
                        value,
                        Normalizer.Form.NFD
                )
                .replaceAll(
                        "\\p{M}",
                        ""
                )
                .toLowerCase()
                .trim();
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

