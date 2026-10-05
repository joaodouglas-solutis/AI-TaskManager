package com.douglas.aitaskmanager.service;

import com.douglas.aitaskmanager.dto.CreateSubtasksRequest;
import com.douglas.aitaskmanager.dto.CreateTaskRequest;
import com.douglas.aitaskmanager.dto.TaskResponse;
import com.douglas.aitaskmanager.dto.UpdateTaskRequest;
import com.douglas.aitaskmanager.entity.Task;
import com.douglas.aitaskmanager.enums.TaskStatus;
import com.douglas.aitaskmanager.exception.TaskNotFoundException;
import com.douglas.aitaskmanager.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(
            TaskRepository taskRepository
    ) {
        this.taskRepository = taskRepository;
    }

    public TaskResponse create(
            CreateTaskRequest request
    ) {
        Task task = new Task();

        task.setTitle(
                request.title()
        );

        task.setDescription(
                request.description()
        );

        task.setDueDate(
                request.dueDate()
        );

        task.setStatus(
                TaskStatus.TODO
        );

        task.setPriority(
                request.priority()
        );

        task.setCreatedAt(
                LocalDateTime.now()
        );

        Task savedTask =
                taskRepository.save(task);

        return toResponse(savedTask);
    }

    public TaskResponse update(
            Long id,
            UpdateTaskRequest request
    ) {
        Task task =
                taskRepository.findById(id)
                        .orElseThrow(
                                () ->
                                        new TaskNotFoundException(
                                                id
                                        )
                        );

        task.setTitle(
                request.title()
        );

        task.setDescription(
                request.description()
        );

        task.setStatus(
                request.status()
        );

        task.setPriority(
                request.priority()
        );

        task.setDueDate(
                request.dueDate()
        );

        Task updatedTask =
                taskRepository.save(task);

        return toResponse(updatedTask);
    }

    public List<TaskResponse> findAll() {
        return taskRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskResponse findById(
            Long id
    ) {
        Task task =
                taskRepository.findById(id)
                        .orElseThrow(
                                () ->
                                        new TaskNotFoundException(
                                                id
                                        )
                        );

        return toResponse(task);
    }

    private TaskResponse toResponse(
            Task task
    ) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getParentTask() != null
                        ? task.getParentTask().getId()
                        : null
        );
    }

    public List<TaskResponse> createSubtasks(
            Long parentTaskId,
            CreateSubtasksRequest request
    ) {
        Task parentTask =
                taskRepository.findById(
                                parentTaskId
                        )
                        .orElseThrow(
                                () ->
                                        new TaskNotFoundException(
                                                parentTaskId
                                        )
                        );

        List<Task> subtasks =
                request.subtasks()
                        .stream()
                        .map(
                                subtaskRequest -> {
                                    Task subtask =
                                            new Task();

                                    subtask.setTitle(
                                            subtaskRequest.title()
                                    );

                                    subtask.setDescription(
                                            subtaskRequest.description()
                                    );

                                    subtask.setStatus(
                                            TaskStatus.TODO
                                    );

                                    subtask.setPriority(
                                            com.douglas.aitaskmanager.enums.TaskPriority.MEDIUM
                                    );

                                    subtask.setDueDate(
                                            null
                                    );

                                    subtask.setCreatedAt(
                                            LocalDateTime.now()
                                    );

                                    subtask.setParentTask(
                                            parentTask
                                    );

                                    return subtask;
                                }
                        )
                        .toList();

        List<Task> savedSubtasks =
                taskRepository.saveAll(
                        subtasks
                );

        return savedSubtasks
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TaskResponse> findSubtasks(
            Long parentTaskId
    ) {
        taskRepository.findById(
                        parentTaskId
                )
                .orElseThrow(
                        () ->
                                new TaskNotFoundException(
                                        parentTaskId
                                )
                );

        return taskRepository
                .findAllByParentTaskId(
                        parentTaskId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void delete(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException(id);
        }

        taskRepository.deleteById(id);
    }
}