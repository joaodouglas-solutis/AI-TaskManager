package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.exception.AiResponseValidationException;
import org.springframework.stereotype.Component;

@Component
public class TaskAiResponseValidator {

    public void validate(
            TaskAnalysisResponse response
    ) {

        if (response == null) {
            throw new AiResponseValidationException(
                    "A IA retornou uma análise vazia."
            );
        }

        if (response.priority() == null) {
            throw new AiResponseValidationException(
                    "A análise da IA não informou a prioridade."
            );
        }

        if (response.complexity() == null) {
            throw new AiResponseValidationException(
                    "A análise da IA não informou a complexidade."
            );
        }

        if (response.estimatedHours() == null
                || response.estimatedHours() < 0) {

            throw new AiResponseValidationException(
                    "A estimativa de esforço retornada pela IA é inválida."
            );
        }

        if (response.reason() == null
                || response.reason().isBlank()) {

            throw new AiResponseValidationException(
                    "A análise da IA não informou uma justificativa."
            );
        }
    }
}