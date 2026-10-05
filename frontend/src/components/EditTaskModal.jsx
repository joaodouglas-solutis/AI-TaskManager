import { useState } from "react";

import {
    TASK_STATUS,
    TASK_PRIORITY
} from "../types/task";

import taskService from "../services/taskService";

const PRIORITY_LABELS = {
    [TASK_PRIORITY.LOW]: "BAIXA",
    [TASK_PRIORITY.MEDIUM]: "MÉDIA",
    [TASK_PRIORITY.HIGH]: "ALTA"
};

const COMPLEXITY_LABELS = {
    LOW: "BAIXA",
    MEDIUM: "MÉDIA",
    HIGH: "ALTA"
};

function EditTaskModal({
                           task,
                           onClose,
                           onSubmit,
                           onSubtasksCreated
                       }) {
    const [title, setTitle] =
        useState(task.title ?? "");

    const [description, setDescription] =
        useState(task.description ?? "");

    const [priority, setPriority] =
        useState(
            task.priority ??
            TASK_PRIORITY.MEDIUM
        );

    const [status, setStatus] =
        useState(
            task.status ??
            TASK_STATUS.TODO
        );

    const [dueDate, setDueDate] =
        useState(task.dueDate ?? "");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [isImproving, setIsImproving] =
        useState(false);

    const [isAnalyzing, setIsAnalyzing] =
        useState(false);

    const [isDecomposing, setIsDecomposing] =
        useState(false);

    const [isCreatingSubtasks, setIsCreatingSubtasks] =
        useState(false);

    const [aiError, setAiError] =
        useState("");

    const [analysis, setAnalysis] =
        useState(null);

    const [decomposition, setDecomposition] =
        useState(null);

    const handleImproveWithAi =
        async () => {
            if (
                isImproving ||
                isAnalyzing ||
                isDecomposing ||
                isCreatingSubtasks ||
                isSubmitting
            ) {
                return;
            }

            try {
                setIsImproving(true);
                setAiError("");

                const improvedTask =
                    await taskService.improveTask(
                        task.id
                    );

                setTitle(
                    improvedTask.title ??
                    title
                );

                setDescription(
                    improvedTask.description ??
                    description
                );
            } catch (error) {
                setAiError(
                    error.message ||
                    "Não foi possível melhorar a tarefa com a IA."
                );
            } finally {
                setIsImproving(false);
            }
        };

    const handleAnalyzeWithAi =
        async () => {
            if (
                isImproving ||
                isAnalyzing ||
                isDecomposing ||
                isCreatingSubtasks ||
                isSubmitting
            ) {
                return;
            }

            try {
                setIsAnalyzing(true);
                setAiError("");

                const result =
                    await taskService.analyzeTask(
                        task.id
                    );

                setAnalysis(result);
            } catch (error) {
                setAiError(
                    error.message ||
                    "Não foi possível analisar a tarefa com a IA."
                );
            } finally {
                setIsAnalyzing(false);
            }
        };

    const handleDecomposeWithAi =
        async () => {
            if (
                isImproving ||
                isAnalyzing ||
                isDecomposing ||
                isCreatingSubtasks ||
                isSubmitting
            ) {
                return;
            }

            try {
                setIsDecomposing(true);
                setAiError("");

                const result =
                    await taskService.decomposeTask(
                        task.id
                    );

                setDecomposition(result);
            } catch (error) {
                setAiError(
                    error.message ||
                    "Não foi possível decompor a tarefa com a IA."
                );
            } finally {
                setIsDecomposing(false);
            }
        };

    const handleCreateSubtasks =
        async () => {
            if (
                !decomposition?.subtasks?.length ||
                isCreatingSubtasks
            ) {
                return;
            }

            try {
                setIsCreatingSubtasks(true);
                setAiError("");

                const createdTasks =
                    await taskService.createSubtasks(
                        task.id,
                        decomposition.subtasks
                    );

                onSubtasksCreated(
                    createdTasks
                );

                setDecomposition(null);

                onClose();
            } catch (error) {
                setAiError(
                    error.message ||
                    "Não foi possível criar as subtarefas."
                );
            } finally {
                setIsCreatingSubtasks(false);
            }
        };

    const handleApplySuggestedPriority =
        () => {
            if (!analysis?.priority) {
                return;
            }

            setPriority(
                analysis.priority
            );
        };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedTitle =
            title.trim();

        if (
            !trimmedTitle ||
            isSubmitting ||
            isImproving ||
            isAnalyzing ||
            isDecomposing ||
            isCreatingSubtasks
        ) {
            return;
        }

        setIsSubmitting(true);

        try {
            const success =
                await onSubmit({
                    ...task,
                    title: trimmedTitle,
                    description:
                        description.trim(),
                    priority,
                    status,
                    dueDate:
                        dueDate || null
                });

            if (success) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isBusy =
        isSubmitting ||
        isImproving ||
        isAnalyzing ||
        isDecomposing ||
        isCreatingSubtasks;

    return (
        <div
            className="modal-backdrop"
            onMouseDown={onClose}
        >
            <div
                className="task-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
            >
                <div className="modal-header">
                    <div>
                        <span className="eyebrow">
                            EDITAR TAREFA
                        </span>

                        <h2>
                            Ajuste os detalhes.
                        </h2>
                    </div>

                    <button
                        className="modal-close"
                        type="button"
                        onClick={onClose}
                        disabled={isBusy}
                    >
                        ×
                    </button>
                </div>

                <form
                    className="task-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        Tarefa

                        <input
                            value={title}
                            onChange={(event) =>
                                setTitle(
                                    event.target.value
                                )
                            }
                            autoFocus
                            disabled={isBusy}
                        />
                    </label>

                    <label>
                        Descrição

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                            placeholder="Descreva o que precisa ser feito..."
                            rows="4"
                            disabled={isBusy}
                        />
                    </label>

                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px"
                        }}
                    >
                        <button
                            type="button"
                            className="ai-button"
                            onClick={
                                handleImproveWithAi
                            }
                            disabled={isBusy}
                        >
                            {isImproving
                                ? "A IA está pensando..."
                                : "✨ Melhorar com IA"}
                        </button>

                        <button
                            type="button"
                            className="ai-button"
                            onClick={
                                handleAnalyzeWithAi
                            }
                            disabled={isBusy}
                        >
                            {isAnalyzing
                                ? "Analisando..."
                                : "◈ Analisar com IA"}
                        </button>

                        <button
                            type="button"
                            className="ai-button"
                            onClick={
                                handleDecomposeWithAi
                            }
                            disabled={isBusy}
                        >
                            {isDecomposing
                                ? "Decompondo..."
                                : "⊞ Decompor com IA"}
                        </button>
                    </div>

                    {aiError && (
                        <p
                            style={{
                                marginTop: "-4px",
                                marginBottom: 0,
                                color:
                                    "var(--danger)",
                                fontSize: "12px"
                            }}
                        >
                            {aiError}
                        </p>
                    )}

                    {analysis && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: "12px",
                                padding: "16px",
                                background:
                                    "var(--accent-soft)",
                                border:
                                    "1px solid var(--border)",
                                borderRadius: "12px"
                            }}
                        >
                            <div>
                                <span
                                    className="eyebrow"
                                    style={{
                                        marginBottom:
                                            "5px"
                                    }}
                                >
                                    ANÁLISE DA IA
                                </span>

                                <strong
                                    style={{
                                        fontSize:
                                            "15px"
                                    }}
                                >
                                    Diagnóstico da tarefa
                                </strong>
                            </div>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(3, minmax(0, 1fr))",
                                    gap: "8px"
                                }}
                            >
                                <div
                                    style={{
                                        padding: "10px",
                                        background:
                                            "var(--surface)",
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "9px"
                                    }}
                                >
                                    <span
                                        style={{
                                            display:
                                                "block",
                                            marginBottom:
                                                "4px",
                                            color:
                                                "var(--text-soft)",
                                            fontSize:
                                                "9px",
                                            fontWeight:
                                                "800",
                                            letterSpacing:
                                                "0.08em"
                                        }}
                                    >
                                        PRIORIDADE
                                    </span>

                                    <strong
                                        style={{
                                            fontSize:
                                                "13px"
                                        }}
                                    >
                                        {
                                            PRIORITY_LABELS[
                                                analysis.priority
                                                ] ??
                                            analysis.priority
                                        }
                                    </strong>
                                </div>

                                <div
                                    style={{
                                        padding: "10px",
                                        background:
                                            "var(--surface)",
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "9px"
                                    }}
                                >
                                    <span
                                        style={{
                                            display:
                                                "block",
                                            marginBottom:
                                                "4px",
                                            color:
                                                "var(--text-soft)",
                                            fontSize:
                                                "9px",
                                            fontWeight:
                                                "800",
                                            letterSpacing:
                                                "0.08em"
                                        }}
                                    >
                                        COMPLEXIDADE
                                    </span>

                                    <strong
                                        style={{
                                            fontSize:
                                                "13px"
                                        }}
                                    >
                                        {
                                            COMPLEXITY_LABELS[
                                                analysis.complexity
                                                ] ??
                                            analysis.complexity
                                        }
                                    </strong>
                                </div>

                                <div
                                    style={{
                                        padding: "10px",
                                        background:
                                            "var(--surface)",
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "9px"
                                    }}
                                >
                                    <span
                                        style={{
                                            display:
                                                "block",
                                            marginBottom:
                                                "4px",
                                            color:
                                                "var(--text-soft)",
                                            fontSize:
                                                "9px",
                                            fontWeight:
                                                "800",
                                            letterSpacing:
                                                "0.08em"
                                        }}
                                    >
                                        ESFORÇO
                                    </span>

                                    <strong
                                        style={{
                                            fontSize:
                                                "13px"
                                        }}
                                    >
                                        {
                                            analysis.estimatedHours
                                        }{" "}
                                        {
                                            analysis.estimatedHours ===
                                            1
                                                ? "hora"
                                                : "horas"
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div>
                                <span
                                    style={{
                                        display:
                                            "block",
                                        marginBottom:
                                            "5px",
                                        color:
                                            "var(--text-soft)",
                                        fontSize:
                                            "9px",
                                        fontWeight:
                                            "800",
                                        letterSpacing:
                                            "0.08em"
                                    }}
                                >
                                    JUSTIFICATIVA
                                </span>

                                <p
                                    style={{
                                        margin: 0,
                                        color:
                                            "var(--text)",
                                        fontSize:
                                            "12px",
                                        lineHeight:
                                            "1.5"
                                    }}
                                >
                                    {
                                        analysis.reason
                                    }
                                </p>
                            </div>

                            {analysis.priority !==
                                priority && (
                                    <button
                                        type="button"
                                        className="modal-submit"
                                        onClick={
                                            handleApplySuggestedPriority
                                        }
                                        style={{
                                            alignSelf:
                                                "flex-start",
                                            fontSize:
                                                "12px"
                                        }}
                                    >
                                        Usar prioridade sugerida
                                    </button>
                                )}
                        </div>
                    )}

                    {decomposition && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection:
                                    "column",
                                gap: "12px",
                                padding: "16px",
                                background:
                                    "var(--accent-soft)",
                                border:
                                    "1px solid var(--border)",
                                borderRadius: "12px"
                            }}
                        >
                            <div>
                                <span
                                    className="eyebrow"
                                    style={{
                                        marginBottom:
                                            "5px"
                                    }}
                                >
                                    DECOMPOSIÇÃO DA IA
                                </span>

                                <strong
                                    style={{
                                        fontSize:
                                            "15px"
                                    }}
                                >
                                    {
                                        decomposition
                                            .subtasks
                                            .length
                                    }{" "}
                                    subtarefas sugeridas
                                </strong>
                            </div>

                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap: "8px"
                                }}
                            >
                                {decomposition.subtasks.map(
                                    (
                                        subtask,
                                        index
                                    ) => (
                                        <div
                                            key={`${subtask.title}-${index}`}
                                            style={{
                                                padding:
                                                    "12px",
                                                background:
                                                    "var(--surface)",
                                                border:
                                                    "1px solid var(--border)",
                                                borderRadius:
                                                    "9px"
                                            }}
                                        >
                                            <strong
                                                style={{
                                                    display:
                                                        "block",
                                                    marginBottom:
                                                        "4px",
                                                    fontSize:
                                                        "13px"
                                                }}
                                            >
                                                {index +
                                                    1}
                                                .{" "}
                                                {
                                                    subtask.title
                                                }
                                            </strong>

                                            <p
                                                style={{
                                                    margin: 0,
                                                    color:
                                                        "var(--text-soft)",
                                                    fontSize:
                                                        "11px",
                                                    lineHeight:
                                                        "1.45"
                                                }}
                                            >
                                                {
                                                    subtask.description
                                                }
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                className="modal-submit"
                                onClick={
                                    handleCreateSubtasks
                                }
                                disabled={
                                    isCreatingSubtasks
                                }
                                style={{
                                    alignSelf:
                                        "flex-start",
                                    fontSize:
                                        "12px"
                                }}
                            >
                                {isCreatingSubtasks
                                    ? "Criando subtarefas..."
                                    : "Criar subtarefas"}
                            </button>
                        </div>
                    )}

                    <label>
                        Prioridade

                        <select
                            value={priority}
                            onChange={(event) =>
                                setPriority(
                                    event.target.value
                                )
                            }
                            disabled={isBusy}
                        >
                            <option
                                value={
                                    TASK_PRIORITY.LOW
                                }
                            >
                                Baixa
                            </option>

                            <option
                                value={
                                    TASK_PRIORITY.MEDIUM
                                }
                            >
                                Média
                            </option>

                            <option
                                value={
                                    TASK_PRIORITY.HIGH
                                }
                            >
                                Alta
                            </option>
                        </select>
                    </label>

                    <label>
                        Status

                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value
                                )
                            }
                            disabled={isBusy}
                        >
                            <option
                                value={
                                    TASK_STATUS.TODO
                                }
                            >
                                A fazer
                            </option>

                            <option
                                value={
                                    TASK_STATUS.IN_PROGRESS
                                }
                            >
                                Em andamento
                            </option>

                            <option
                                value={
                                    TASK_STATUS.DONE
                                }
                            >
                                Concluída
                            </option>
                        </select>
                    </label>

                    <label>
                        Prazo

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(event) =>
                                setDueDate(
                                    event.target.value
                                )
                            }
                            disabled={isBusy}
                        />
                    </label>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-cancel"
                            onClick={onClose}
                            disabled={isBusy}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="modal-submit"
                            disabled={
                                isBusy ||
                                !title.trim()
                            }
                        >
                            {isSubmitting
                                ? "Salvando..."
                                : "Salvar alterações"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditTaskModal;