package com.douglas.aitaskmanager.controller;

import com.douglas.aitaskmanager.dto.CreateTaskRequest;
import com.douglas.aitaskmanager.dto.TaskResponse;
import com.douglas.aitaskmanager.dto.UpdateTaskRequest;
import com.douglas.aitaskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.douglas.aitaskmanager.dto.CreateSubtasksRequest;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse response = taskService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> findAll() {
        return ResponseEntity.ok(taskService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        return ResponseEntity.ok(taskService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }

    @PostMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskResponse>> createSubtasks(
            @PathVariable Long id,
            @Valid @RequestBody CreateSubtasksRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(taskService.createSubtasks(id, request));
    }

    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskResponse>> findSubtasks(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                taskService.findSubtasks(id)
        );
    }
}