package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.AiChatMessage;
import com.douglas.aitaskmanager.dto.AiChatResponse;
import com.douglas.aitaskmanager.dto.ImprovedTaskResponse;
import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;
import com.douglas.aitaskmanager.dto.WorkspaceAiSummaryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiProviderRouter implements TaskAiClient {

    private final GeminiTaskAiClient geminiTaskAiClient;
    private final OllamaTaskAiClient ollamaTaskAiClient;
    private final AiProvider defaultProvider;

    public AiProviderRouter(
            GeminiTaskAiClient geminiTaskAiClient,
            OllamaTaskAiClient ollamaTaskAiClient,
            @Value("${app.ai.default-provider:GEMINI}")
            AiProvider defaultProvider
    ) {
        this.geminiTaskAiClient = geminiTaskAiClient;
        this.ollamaTaskAiClient = ollamaTaskAiClient;
        this.defaultProvider = defaultProvider;
    }

    public ImprovedTaskResponse improveTask(
            AiProvider provider,
            String title,
            String description
    ) {

        return clientFor(provider)
                .improveTask(
                        title,
                        description
                );
    }

    public TaskAnalysisResponse analyzeTask(
            AiProvider provider,
            String title,
            String description,
            String status,
            String priority
    ) {

        return clientFor(provider)
                .analyzeTask(
                        title,
                        description,
                        status,
                        priority
                );
    }

    public TaskDecompositionResponse decomposeTask(
            AiProvider provider,
            String title,
            String description
    ) {

        return clientFor(provider)
                .decomposeTask(
                        title,
                        description
                );
    }

    public WorkspaceAiSummaryResponse summarizeWorkspace(
            AiProvider provider,
            List<String> taskContexts
    ) {

        return clientFor(provider)
                .summarizeWorkspace(
                        taskContexts
                );
    }

    public AiChatResponse chat(
            AiProvider provider,
            String message,
            List<AiChatMessage> history,
            List<String> taskContexts
    ) {

        return clientFor(provider)
                .chat(
                        message,
                        history,
                        taskContexts
                );
    }

    @Override
    public ImprovedTaskResponse improveTask(
            String title,
            String description
    ) {

        return clientFor(defaultProvider)
                .improveTask(
                        title,
                        description
                );
    }

    @Override
    public TaskAnalysisResponse analyzeTask(
            String title,
            String description,
            String status,
            String priority
    ) {

        return clientFor(defaultProvider)
                .analyzeTask(
                        title,
                        description,
                        status,
                        priority
                );
    }

    @Override
    public TaskDecompositionResponse decomposeTask(
            String title,
            String description
    ) {

        return clientFor(defaultProvider)
                .decomposeTask(
                        title,
                        description
                );
    }

    @Override
    public WorkspaceAiSummaryResponse summarizeWorkspace(
            List<String> taskContexts
    ) {

        return clientFor(defaultProvider)
                .summarizeWorkspace(
                        taskContexts
                );
    }

    @Override
    public AiChatResponse chat(
            String message,
            List<AiChatMessage> history,
            List<String> taskContexts
    ) {

        return clientFor(defaultProvider)
                .chat(
                        message,
                        history,
                        taskContexts
                );
    }

    private TaskAiClient clientFor(
            AiProvider provider
    ) {

        AiProvider selectedProvider =
                provider == null
                        ? defaultProvider
                        : provider;

        return switch (selectedProvider) {

            case GEMINI ->
                    geminiTaskAiClient;

            case OLLAMA ->
                    ollamaTaskAiClient;
        };
    }
}