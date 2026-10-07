package com.douglas.aitaskmanager.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(
                    GlobalExceptionHandler.class
            );

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTaskNotFound(
            TaskNotFoundException exception
    ) {

        Map<String, Object> body =
                Map.of(
                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        HttpStatus.NOT_FOUND.value(),

                        "error",
                        "Tarefa não encontrada",

                        "message",
                        exception.getMessage()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> fields =
                new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(
                        error ->
                                fields.put(
                                        error.getField(),
                                        error.getDefaultMessage()
                                )
                );

        Map<String, Object> body =
                Map.of(
                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        HttpStatus.BAD_REQUEST.value(),

                        "error",
                        "Dados inválidos",

                        "message",
                        "Existem campos inválidos na requisição",

                        "fields",
                        fields
                );

        return ResponseEntity
                .badRequest()
                .body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableMessage(
            HttpMessageNotReadableException exception
    ) {

        log.warn(
                "Requisição não pôde ser lida.",
                exception
        );

        Map<String, Object> body =
                Map.of(
                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        HttpStatus.BAD_REQUEST.value(),

                        "error",
                        "Requisição inválida",

                        "message",
                        "O corpo da requisição possui dados inválidos."
                );

        return ResponseEntity
                .badRequest()
                .body(body);
    }

    @ExceptionHandler(AiResponseValidationException.class)
    public ResponseEntity<Map<String, Object>> handleAiResponseValidation(
            AiResponseValidationException exception
    ) {

        log.warn(
                "Resposta inválida recebida da IA: {}",
                exception.getMessage()
        );

        Map<String, Object> body =
                Map.of(
                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        HttpStatus.BAD_GATEWAY.value(),

                        "error",
                        "Resposta inválida da IA",

                        "message",
                        "A resposta recebida da Inteligência Artificial não pôde ser validada."
                );

        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(body);
    }

    @ExceptionHandler(AiIntegrationException.class)
    public ResponseEntity<Map<String, Object>> handleAiIntegration(
            AiIntegrationException exception
    ) {

        log.error(
                "Erro na integração com o serviço de IA.",
                exception
        );

        Map<String, Object> body =
                Map.of(
                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        HttpStatus.SERVICE_UNAVAILABLE.value(),

                        "error",
                        "Serviço de IA indisponível",

                        "message",
                        "Não foi possível processar a solicitação de Inteligência Artificial no momento."
                );

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(body);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccess(
            DataAccessException exception
    ) {

        log.error(
                "Erro de persistência ou acesso ao banco de dados.",
                exception
        );

        Map<String, Object> body =
                Map.of(
                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),

                        "error",
                        "Erro de persistência",

                        "message",
                        "Não foi possível acessar ou salvar os dados."
                );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(
            Exception exception
    ) {

        log.error(
                "Erro inesperado na aplicação.",
                exception
        );

        Map<String, Object> body =
                Map.of(
                        "timestamp",
                        LocalDateTime.now(),

                        "status",
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),

                        "error",
                        "Erro interno",

                        "message",
                        "Ocorreu um erro inesperado ao processar a solicitação."
                );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body);
    }
}