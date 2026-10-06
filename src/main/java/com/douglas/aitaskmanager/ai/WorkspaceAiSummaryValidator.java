package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.WorkspaceAiSummaryResponse;
import com.douglas.aitaskmanager.entity.Task;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WorkspaceAiSummaryValidator {

    public void validate(
            WorkspaceAiSummaryResponse response,
            List<Task> tasks
    ) {

        if (response == null) {
            throw new IllegalArgumentException(
                    "A IA não retornou um resumo do workspace."
            );
        }

        if (response.summary() == null
                || response.summary().isBlank()) {

            throw new IllegalArgumentException(
                    "O resumo retornado pela IA está vazio."
            );
        }

        if (response.focusReason() == null
                || response.focusReason().isBlank()) {

            throw new IllegalArgumentException(
                    "A justificativa do foco retornada pela IA está vazia."
            );
        }

        if (response.focusTaskId() == null) {
            return;
        }

        boolean taskExists =
                tasks.stream()
                        .anyMatch(task ->
                                task.getId()
                                        .equals(
                                                response.focusTaskId()
                                        )
                        );

        if (!taskExists) {
            throw new IllegalArgumentException(
                    "A IA indicou uma tarefa que não existe no workspace."
            );
        }
    }
}