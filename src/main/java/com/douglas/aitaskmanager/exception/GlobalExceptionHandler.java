package com.douglas.aitaskmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTaskNotFound(
            TaskNotFoundException exception
    ) {
        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now(),
                "status", HttpStatus.NOT_FOUND.value(),
                "error", "Tarefa não encontrada",
                "message", exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> fields = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        fields.put(error.getField(), error.getDefaultMessage())
                );

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Dados inválidos",
                "message", "Existem campos inválidos na requisição",
                "fields", fields
        );

        return ResponseEntity
                .badRequest()
                .body(body);
    }

    @ExceptionHandler(AiIntegrationException.class)
    public ResponseEntity<Map<String, Object>> handleAiIntegration(
            AiIntegrationException exception
    ) {

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now(),
                "status", HttpStatus.SERVICE_UNAVAILABLE.value(),
                "error", "Serviço de IA indisponível",
                "message", exception.getMessage()
        );

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(body);
    }

}