package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;
import com.douglas.aitaskmanager.exception.AiResponseValidationException;
import org.springframework.stereotype.Component;

@Component
public class TaskDecompositionValidator {

    public void validate(
            TaskDecompositionResponse response
    ) {

        if (response == null) {
            throw new AiResponseValidationException(
                    "A IA não retornou uma decomposição."
            );
        }

        if (response.subtasks() == null
                || response.subtasks().isEmpty()) {

            throw new AiResponseValidationException(
                    "A IA não retornou nenhuma subtarefa."
            );
        }

        if (response.subtasks().size() > 8) {
            throw new AiResponseValidationException(
                    "A IA retornou mais subtarefas do que o permitido."
            );
        }

        response.subtasks()
                .forEach(subtask -> {

                    if (subtask.title() == null
                            || subtask.title().isBlank()) {

                        throw new AiResponseValidationException(
                                "Uma subtarefa retornada pela IA não possui título."
                        );
                    }

                    if (subtask.description() == null
                            || subtask.description().isBlank()) {

                        throw new AiResponseValidationException(
                                "Uma subtarefa retornada pela IA não possui descrição."
                        );
                    }
                });
    }
}