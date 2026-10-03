package com.douglas.aitaskmanager.service;

import com.douglas.aitaskmanager.ai.TaskAiClient;
import com.douglas.aitaskmanager.ai.TaskAiResponseValidator;
import com.douglas.aitaskmanager.dto.ImprovedTaskResponse;
import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.entity.Task;
import com.douglas.aitaskmanager.exception.TaskNotFoundException;
import com.douglas.aitaskmanager.repository.TaskRepository;
import com.douglas.aitaskmanager.ai.TaskDecompositionValidator;
import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;
import org.springframework.stereotype.Service;

@Service
public class TaskAiService {

    private final TaskRepository taskRepository;
    private final TaskAiClient taskAiClient;
    private final TaskAiResponseValidator taskAiResponseValidator;
    private final TaskDecompositionValidator taskDecompositionValidator;

    public TaskAiService(
            TaskRepository taskRepository,
            TaskAiClient taskAiClient,
            TaskAiResponseValidator taskAiResponseValidator,
            TaskDecompositionValidator taskDecompositionValidator
    ) {
        this.taskRepository = taskRepository;
        this.taskAiClient = taskAiClient;
        this.taskAiResponseValidator = taskAiResponseValidator;
        this.taskDecompositionValidator = taskDecompositionValidator;
    }

    public ImprovedTaskResponse improveTask(Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        return taskAiClient.improveTask(
                task.getTitle(),
                task.getDescription()
        );
    }

    public TaskAnalysisResponse analyzeTask(Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        TaskAnalysisResponse analysis = taskAiClient.analyzeTask(
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name(),
                task.getPriority().name()
        );

        taskAiResponseValidator.validate(analysis);

        return analysis;
    }

    public TaskDecompositionResponse decomposeTask(Long taskId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        TaskDecompositionResponse response =
                taskAiClient.decomposeTask(
                        task.getTitle(),
                        task.getDescription()
                );

        taskDecompositionValidator.validate(response);

        return response;
    }
}