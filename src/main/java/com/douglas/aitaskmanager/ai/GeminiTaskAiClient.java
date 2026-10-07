package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.AiChatMessage;
import com.douglas.aitaskmanager.dto.AiChatResponse;
import com.douglas.aitaskmanager.dto.ImprovedTaskResponse;
import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;
import com.douglas.aitaskmanager.dto.WorkspaceAiSummaryResponse;
import com.douglas.aitaskmanager.exception.AiIntegrationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GeminiTaskAiClient implements TaskAiClient {

    private static final Logger log =
            LoggerFactory.getLogger(GeminiTaskAiClient.class);

    private final ChatClient chatClient;

    public GeminiTaskAiClient(
            @Qualifier("geminiChatClient")
            ChatClient chatClient
    ) {
        this.chatClient = chatClient;

        log.info("GeminiTaskAiClient inicializado.");
    }

    @Override
    public ImprovedTaskResponse improveTask(
            String title,
            String description
    ) {
        String prompt = """
                Melhore a tarefa abaixo.

                Regras:
                - Preserve a intenção original.
                - Torne o título claro e objetivo.
                - Torne a descrição detalhada e acionável.
                - Não invente requisitos.
                - Responda em português do Brasil.

                <tarefa>
                <titulo>%s</titulo>
                <descricao>%s</descricao>
                </tarefa>
                """.formatted(
                title,
                description == null ? "" : description
        );

        try {
            log.info("Enviando solicitação de melhoria de tarefa para o Gemini.");

            ImprovedTaskResponse response =
                    chatClient
                            .prompt()
                            .system("""
                                    Você é um assistente especializado
                                    em gerenciamento de tarefas de software.

                                    Melhore tarefas sem alterar sua intenção.
                                    """)
                            .user(prompt)
                            .call()
                            .entity(
                                    ImprovedTaskResponse.class,
                                    spec -> spec.useProviderStructuredOutput()
                            );

            log.info("Gemini respondeu à melhoria da tarefa.");

            return response;
        } catch (Exception exception) {
            log.error(
                    "Erro ao chamar o Gemini durante a melhoria da tarefa.",
                    exception
            );

            throw new AiIntegrationException(
                    "Não foi possível processar a tarefa com o Gemini.",
                    exception
            );
        }
    }

    @Override
    public TaskAnalysisResponse analyzeTask(
            String title,
            String description,
            String status,
            String priority
    ) {
        String prompt = """
                Analise a tarefa abaixo.

                Regras:
                - Sugira a prioridade.
                - Classifique a complexidade como LOW, MEDIUM ou HIGH.
                - Estime o esforço em horas.
                - Explique brevemente o motivo.
                - Não invente informações.
                - Responda em português do Brasil.

                <tarefa>
                <titulo>%s</titulo>
                <descricao>%s</descricao>
                <status>%s</status>
                <prioridadeAtual>%s</prioridadeAtual>
                </tarefa>
                """.formatted(
                title,
                description == null ? "" : description,
                status,
                priority
        );

        try {
            log.info("Enviando análise de tarefa para o Gemini.");

            TaskAnalysisResponse response =
                    chatClient
                            .prompt()
                            .system("""
                                    Você é um analista de tarefas de software.

                                    Seja objetivo ao avaliar prioridade,
                                    complexidade e esforço.
                                    """)
                            .user(prompt)
                            .call()
                            .entity(
                                    TaskAnalysisResponse.class,
                                    spec -> spec.useProviderStructuredOutput()
                            );

            log.info("Gemini respondeu à análise da tarefa.");

            return response;
        } catch (Exception exception) {
            log.error(
                    "Erro ao chamar o Gemini durante a análise da tarefa.",
                    exception
            );

            throw new AiIntegrationException(
                    "Não foi possível analisar a tarefa com o Gemini.",
                    exception
            );
        }
    }

    @Override
    public TaskDecompositionResponse decomposeTask(
            String title,
            String description
    ) {
        String prompt = """
                Divida a tarefa abaixo em subtarefas.

                Regras:
                - Gere entre 2 e 8 subtarefas.
                - Cada subtarefa deve ser concreta e executável.
                - Evite duplicações.
                - Preserve a intenção original.
                - Não invente requisitos.
                - Responda em português do Brasil.

                <tarefa>
                <titulo>%s</titulo>
                <descricao>%s</descricao>
                </tarefa>
                """.formatted(
                title,
                description == null ? "" : description
        );

        try {
            log.info("Enviando decomposição de tarefa para o Gemini.");

            TaskDecompositionResponse response =
                    chatClient
                            .prompt()
                            .system("""
                                    Você é um analista de tarefas de software.

                                    Divida tarefas complexas em etapas pequenas
                                    e executáveis.
                                    """)
                            .user(prompt)
                            .call()
                            .entity(
                                    TaskDecompositionResponse.class,
                                    spec -> spec.useProviderStructuredOutput()
                            );

            log.info("Gemini respondeu à decomposição da tarefa.");

            return response;
        } catch (Exception exception) {
            log.error(
                    "Erro ao chamar o Gemini durante a decomposição da tarefa.",
                    exception
            );

            throw new AiIntegrationException(
                    "Não foi possível decompor a tarefa com o Gemini.",
                    exception
            );
        }
    }

    @Override
    public WorkspaceAiSummaryResponse summarizeWorkspace(
            List<String> taskContexts
    ) {
        String prompt = """
                Analise o workspace abaixo e escreva um resumo curto e útil.

                Regras:
                - Tenha 1 ou 2 frases naturais.
                - Explique brevemente o estado atual.
                - Aponte o principal ponto de atenção.
                - Explique por que esse ponto merece atenção.
                - Não liste várias tarefas.
                - Não explique subtarefas.
                - Não explique hierarquia.
                - Não faça planejamento.
                - Não mostre IDs internos.
                - Responda em português do Brasil.

                Quando mencionar uma tarefa específica, use:
                Tarefa "Título da tarefa"

                <workspace>
                %s
                </workspace>
                """.formatted(
                String.join("\n", taskContexts)
        );

        try {
            log.info("Enviando resumo do workspace para o Gemini.");

            WorkspaceAiSummaryResponse response =
                    chatClient
                            .prompt()
                            .system("""
                                    Você é um assistente de produtividade.

                                    Gere uma observação curta,
                                    clara e natural sobre o workspace.
                                    """)
                            .user(prompt)
                            .call()
                            .entity(
                                    WorkspaceAiSummaryResponse.class,
                                    spec -> spec.useProviderStructuredOutput()
                            );

            log.info("Gemini respondeu ao resumo do workspace.");

            return response;
        } catch (Exception exception) {
            log.error(
                    "Erro ao chamar o Gemini durante o resumo do workspace.",
                    exception
            );

            throw new AiIntegrationException(
                    "Não foi possível analisar o workspace com o Gemini.",
                    exception
            );
        }
    }

    @Override
    public AiChatResponse chat(
            String message,
            List<AiChatMessage> history,
            List<String> taskContexts
    ) {
        try {
            log.info(
                    "Enviando mensagem para o Gemini. " +
                            "Histórico: {} mensagens. Tarefas no contexto: {}.",
                    history == null ? 0 : history.size(),
                    taskContexts == null ? 0 : taskContexts.size()
            );

            StringBuilder prompt = new StringBuilder();

            prompt.append("""
                    Você é o assistente de produtividade do AI TaskManager.

                    Você está integrado ao sistema e recebeu abaixo os dados
                    das tarefas relevantes do usuário.

                    Use esses dados para responder às perguntas do usuário.

                    Regras importantes:
                    - Responda sempre em português do Brasil.
                    - Você pode consultar mentalmente os dados fornecidos
                      no contexto das tarefas.
                    - Não diga que não possui acesso às tarefas quando elas
                      estiverem presentes no contexto.
                    - Não invente tarefas, datas, status ou prioridades.
                    - Se uma informação não estiver disponível no contexto,
                      diga claramente que ela não está disponível.
                    - Para perguntas sobre tarefas atrasadas, considere
                      principalmente a data de vencimento e o status.
                    - Para perguntas sobre prioridade, considere a prioridade
                      informada na tarefa.
                    - Seja objetivo, mas forneça detalhes suficientes para
                      responder corretamente.
                    - Não mencione IDs internos, a menos que isso seja
                      explicitamente solicitado.
                    - Quando mencionar uma tarefa, use o título da tarefa.

                    """);

            if (history != null && !history.isEmpty()) {
                prompt.append("""
                        <historico_conversa>
                        """);

                for (AiChatMessage historyMessage : history) {
                    if (historyMessage == null) {
                        continue;
                    }

                    String role =
                            historyMessage.role() == null
                                    ? "user"
                                    : historyMessage.role();

                    String content =
                            historyMessage.content() == null
                                    ? ""
                                    : historyMessage.content();

                    prompt
                            .append(role)
                            .append(": ")
                            .append(content)
                            .append("\n");
                }

                prompt.append("""
                        </historico_conversa>

                        """);
            }

            if (taskContexts != null && !taskContexts.isEmpty()) {
                prompt.append("""
                        <tarefas_do_sistema>
                        """);

                for (String taskContext : taskContexts) {
                    if (taskContext == null || taskContext.isBlank()) {
                        continue;
                    }

                    prompt
                            .append(taskContext)
                            .append("\n");
                }

                prompt.append("""
                        </tarefas_do_sistema>

                        """);
            } else {
                prompt.append("""
                        <tarefas_do_sistema>
                        Nenhuma tarefa foi encontrada no contexto desta
                        solicitação.
                        </tarefas_do_sistema>

                        """);
            }

            prompt.append("""
                    <mensagem_atual>
                    %s
                    </mensagem_atual>

                    Responda à mensagem atual usando o contexto fornecido.
                    """.formatted(
                    message == null ? "" : message
            ));

            String answer =
                    chatClient
                            .prompt()
                            .system("""
                                    Você é o assistente de produtividade
                                    integrado ao AI TaskManager.

                                    Seu trabalho é ajudar o usuário a entender,
                                    organizar e priorizar suas tarefas usando
                                    exclusivamente as informações disponíveis
                                    no contexto recebido.
                                    """)
                            .user(prompt.toString())
                            .call()
                            .content();

            log.info("Resposta recebida do Gemini com sucesso.");

            if (answer == null || answer.isBlank()) {
                throw new IllegalArgumentException(
                        "O Gemini não retornou uma resposta."
                );
            }

            return new AiChatResponse(answer.trim());

        } catch (Exception exception) {
            log.error(
                    "Erro na comunicação com o Gemini durante o chat.",
                    exception
            );

            throw new AiIntegrationException(
                    "Não foi possível conversar com o Gemini.",
                    exception
            );
        }
    }
}