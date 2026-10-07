package com.douglas.aitaskmanager.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiClientConfig {

    @Bean
    @Qualifier("geminiChatClient")
    public ChatClient geminiChatClient(
            GoogleGenAiChatModel chatModel
    ) {
        return ChatClient
                .builder(chatModel)
                .build();
    }

    @Bean
    public OllamaChatModel ollamaChatModel(
            @Value("${spring.ai.ollama.base-url:http://localhost:11434}")
            String baseUrl,

            @Value("${spring.ai.ollama.chat.model:qwen2.5:3b}")
            String model
    ) {
        OllamaApi ollamaApi = OllamaApi.builder()
                .baseUrl(baseUrl)
                .build();

        OllamaChatOptions options = OllamaChatOptions.builder()
                .model(model)
                .temperature(0.1)
                .build();

        return OllamaChatModel.builder()
                .ollamaApi(ollamaApi)
                .options(options)
                .build();
    }

    @Bean
    @Qualifier("ollamaChatClient")
    public ChatClient ollamaChatClient(
            OllamaChatModel chatModel
    ) {
        return ChatClient
                .builder(chatModel)
                .build();
    }
}