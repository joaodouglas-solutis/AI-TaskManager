package com.douglas.aitaskmanager.ai;

import com.douglas.aitaskmanager.dto.ImprovedTaskResponse;
import com.douglas.aitaskmanager.dto.TaskAnalysisResponse;
import com.douglas.aitaskmanager.dto.TaskDecompositionResponse;
import com.douglas.aitaskmanager.dto.WorkspaceAiSummaryResponse;
import com.douglas.aitaskmanager.exception.AiIntegrationException;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OllamaTaskAiClient implements TaskAiClient {

    private final ChatClient chatClient;

    public OllamaTaskAiClient(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
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
                - Torne a descrição mais detalhada e acionável.
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
            return chatClient
                    .prompt()
                    .system("""
                            Você é um assistente especializado em
                            gerenciamento de tarefas de software.

                            Melhore as tarefas sem alterar sua intenção.
                            """)
                    .user(prompt)
                    .call()
                    .entity(
                            ImprovedTaskResponse.class,
                            spec -> spec.validateSchema()
                    );

        } catch (Exception exception) {
            throw new AiIntegrationException(
                    "Não foi possível processar a tarefa com a Inteligência Artificial.",
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
            return chatClient
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
                            spec -> spec.validateSchema()
                    );

        } catch (Exception exception) {
            throw new AiIntegrationException(
                    "Não foi possível analisar a tarefa com a Inteligência Artificial.",
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
            return chatClient
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
                            spec -> spec.validateSchema()
                    );

        } catch (Exception exception) {
            throw new AiIntegrationException(
                    "Não foi possível decompor a tarefa com a Inteligência Artificial.",
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

                O resumo deve:
                - Ter 1 ou 2 frases naturais.
                - Ter entre 120 e 280 caracteres.
                - Explicar brevemente o estado atual do workspace.
                - Dizer qual é o principal ponto de atenção.
                - Explicar por que essa tarefa merece atenção.
                - Não listar várias tarefas.
                - Não explicar subtarefas ou a hierarquia.
                - Não descrever planejamento ou etapas.
                - Não repetir informações desnecessárias.
                - Soar como uma recomendação humana para o usuário.

                IMPORTANTE:
                Não escreva um rótulo ou fragmento como:
                "Análise do Atual Modo Claro em estado TODO, alta prioridade"

                Escreva uma frase completa e natural, como:
                "O workspace está no início e a tarefa \"Melhorar Feature de Modo Claro\" merece foco por ser a principal tarefa de alta prioridade em aberto."

                Quando mencionar uma tarefa específica, use:
                Tarefa "Título da tarefa"

                Nunca mostre IDs internos.

                <workspace>
                %s
                </workspace>
                """.formatted(
                String.join("\n", taskContexts)
        );

        try {
            return chatClient
                    .prompt()
                    .system("""
                            Você é um assistente de produtividade.

                            Sua resposta deve parecer uma observação curta
                            de um assistente humano, e não uma ficha técnica.

                            summary:
                            - 1 ou 2 frases completas.
                            - Entre 120 e 280 caracteres.
                            - Explique o estado do workspace.
                            - Aponte o principal foco.
                            - Diga brevemente por que esse foco é importante.
                            - Não faça listas.
                            - Não use títulos ou rótulos.
                            - Não escreva fragmentos nominais.
                            - Não descreva subtarefas.
                            - Não explique hierarquia.
                            - Não faça uma análise longa.
                            - Não mostre IDs internos.

                            Exemplo de resposta boa:
                            "O workspace está no início e a tarefa
                            \"Melhorar Feature de Modo Claro\" merece foco
                            por ser a principal tarefa de alta prioridade em aberto."

                            Exemplo de resposta ruim:
                            "Análise do Atual Modo Claro em estado TODO, alta prioridade"

                            Ao mencionar uma tarefa específica, use:
                            Tarefa "Título da tarefa"
                            """)
                    .user(prompt)
                    .call()
                    .entity(
                            WorkspaceAiSummaryResponse.class,
                            spec -> spec.validateSchema()
                    );

        } catch (Exception exception) {
            throw new AiIntegrationException(
                    "Não foi possível analisar o workspace com a Inteligência Artificial.",
                    exception
            );
        }
    }
}

