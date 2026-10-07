package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.WorkspaceAiSummaryResponse;
import com.douglas.aitaskmanager.entity.Task;
import com.douglas.aitaskmanager.exception.AiResponseValidationException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WorkspaceAiSummaryValidator {

    public void validate(
            WorkspaceAiSummaryResponse response,
            List<Task> tasks
    ) {

        if (response == null) {
            throw new AiResponseValidationException(
                    "A IA não retornou um resumo do workspace."
            );
        }

        if (response.summary() == null
                || response.summary().isBlank()) {

            throw new AiResponseValidationException(
                    "O resumo retornado pela IA está vazio."
            );
        }

        if (response.focusReason() == null
                || response.focusReason().isBlank()) {

            throw new AiResponseValidationException(
                    "A justificativa do foco retornada pela IA está vazia."
            );
        }

        if (response.focusTaskId() == null) {
            return;
        }

        boolean taskExists =
                tasks.stream()
                        .anyMatch(
                                task ->
                                        task.getId()
                                                .equals(
                                                        response.focusTaskId()
                                                )
                        );

        if (!taskExists) {
            throw new AiResponseValidationException(
                    "A IA indicou uma tarefa que não existe no workspace."
            );
        }
    }
}