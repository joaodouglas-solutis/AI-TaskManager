package com.douglas.aitaskmanager.exception;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Long id) {
        super("Tarefa não encontrada com o id: " + id);
    }
}