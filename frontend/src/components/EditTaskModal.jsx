import { useEffect, useState } from "react";

import {
    TASK_STATUS,
    TASK_PRIORITY
} from "../types/task";

import taskService from "../services/taskService";

const STATUS_LABELS = {
    [TASK_STATUS.TODO]: "A fazer",
    [TASK_STATUS.IN_PROGRESS]: "Em andamento",
    [TASK_STATUS.DONE]: "Concluída"
};

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

const AI_PROVIDER_LABELS = {
    GEMINI: "Gemini",
    OLLAMA: "Ollama"
};

function EditTaskModal({
                           task,
                           onClose,
                           onSubmit,
                           onSubtasksCreated,
                           provider
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

    const [isLoadingSubtasks, setIsLoadingSubtasks] =
        useState(true);

    const [subtasks, setSubtasks] =
        useState([]);

    const [aiError, setAiError] =
        useState("");

    const [analysis, setAnalysis] =
        useState(null);

    const [decomposition, setDecomposition] =
        useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadSubtasks() {
            try {
                setIsLoadingSubtasks(true);

                const loadedSubtasks =
                    await taskService.getSubtasks(
                        task.id
                    );

                if (isMounted) {
                    setSubtasks(
                        loadedSubtasks
                    );
                }
            } catch {
                if (isMounted) {
                    setSubtasks([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingSubtasks(false);
                }
            }
        }

        loadSubtasks();

        return () => {
            isMounted = false;
        };
    }, [task.id]);

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
                        task.id,
                        provider
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
                        task.id,
                        provider
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
                        task.id,
                        provider
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

                setSubtasks(
                    (currentSubtasks) => [
                        ...currentSubtasks,
                        ...createdTasks
                    ]
                );

                onSubtasksCreated(
                    createdTasks
                );

                setDecomposition(null);
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

    const completedSubtasks =
        subtasks.filter(
            (subtask) =>
                subtask.status ===
                TASK_STATUS.DONE
        ).length;

    const providerLabel =
        AI_PROVIDER_LABELS[provider] ||
        AI_PROVIDER_LABELS.GEMINI;

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

                    <div className="ai-actions">
                        <button
                            type="button"
                            className="ai-button"
                            onClick={
                                handleImproveWithAi
                            }
                            disabled={isBusy}
                        >
                            {isImproving
                                ? `${providerLabel} está pensando...`
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
                                ? `${providerLabel} está analisando...`
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
                                ? `${providerLabel} está decompondo...`
                                : "⊞ Decompor com IA"}
                        </button>
                    </div>

                    {aiError && (
                        <p className="ai-error">
                            {aiError}
                        </p>
                    )}

                    {subtasks.length > 0 && (
                        <div className="subtasks-panel">
                            <div className="subtasks-header">
                                <div>
                                    <span className="eyebrow">
                                        SUBTAREFAS
                                    </span>

                                    <strong>
                                        {completedSubtasks}/
                                        {subtasks.length}{" "}
                                        concluídas
                                    </strong>
                                </div>

                                <span className="subtasks-parent">
                                    TAREFA-PAI
                                </span>
                            </div>

                            <div className="subtasks-list">
                                {subtasks.map(
                                    (subtask) => (
                                        <div
                                            className="subtask-item"
                                            key={
                                                subtask.id
                                            }
                                        >
                                            <div
                                                className={`subtask-status ${
                                                    subtask.status ===
                                                    TASK_STATUS.DONE
                                                        ? "is-done"
                                                        : ""
                                                }`}
                                            >
                                                {subtask.status ===
                                                TASK_STATUS.DONE
                                                    ? "✓"
                                                    : "·"}
                                            </div>

                                            <div className="subtask-content">
                                                <strong>
                                                    {
                                                        subtask.title
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        subtask.description
                                                    }
                                                </span>
                                            </div>

                                            <span
                                                className={`subtask-state ${
                                                    subtask.status ===
                                                    TASK_STATUS.DONE
                                                        ? "is-done"
                                                        : ""
                                                }`}
                                            >
                                                {
                                                    subtask.status ===
                                                    TASK_STATUS.DONE
                                                        ? "Concluída"
                                                        : STATUS_LABELS[
                                                            subtask.status
                                                            ]
                                                }
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {isLoadingSubtasks &&
                        subtasks.length === 0 && (
                            <div className="subtasks-loading">
                                Verificando subtarefas...
                            </div>
                        )}

                    {analysis && (
                        <div className="ai-result-panel">
                            <div>
                                <span className="eyebrow">
                                    ANÁLISE DA IA
                                </span>

                                <strong>
                                    Diagnóstico da tarefa
                                </strong>
                            </div>

                            <div className="ai-analysis-grid">
                                <div className="ai-analysis-item">
                                    <span>
                                        PRIORIDADE
                                    </span>

                                    <strong>
                                        {
                                            PRIORITY_LABELS[
                                                analysis.priority
                                                ] ??
                                            analysis.priority
                                        }
                                    </strong>
                                </div>

                                <div className="ai-analysis-item">
                                    <span>
                                        COMPLEXIDADE
                                    </span>

                                    <strong>
                                        {
                                            COMPLEXITY_LABELS[
                                                analysis.complexity
                                                ] ??
                                            analysis.complexity
                                        }
                                    </strong>
                                </div>

                                <div className="ai-analysis-item">
                                    <span>
                                        ESFORÇO
                                    </span>

                                    <strong>
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

                            <div className="ai-reason">
                                <span>
                                    JUSTIFICATIVA
                                </span>

                                <p>
                                    {
                                        analysis.reason
                                    }
                                </p>
                            </div>

                            {analysis.priority !==
                                priority && (
                                    <button
                                        type="button"
                                        className="modal-submit ai-apply-button"
                                        onClick={
                                            handleApplySuggestedPriority
                                        }
                                    >
                                        Usar prioridade sugerida
                                    </button>
                                )}
                        </div>
                    )}

                    {decomposition && (
                        <div className="ai-result-panel">
                            <div>
                                <span className="eyebrow">
                                    DECOMPOSIÇÃO DA IA
                                </span>

                                <strong>
                                    {
                                        decomposition
                                            .subtasks
                                            .length
                                    }{" "}
                                    subtarefas sugeridas
                                </strong>
                            </div>

                            <div className="decomposition-list">
                                {decomposition.subtasks.map(
                                    (
                                        subtask,
                                        index
                                    ) => (
                                        <div
                                            className="decomposition-item"
                                            key={`${subtask.title}-${index}`}
                                        >
                                            <strong>
                                                {index +
                                                    1}
                                                .{" "}
                                                {
                                                    subtask.title
                                                }
                                            </strong>

                                            <p>
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
                                className="modal-submit ai-apply-button"
                                onClick={
                                    handleCreateSubtasks
                                }
                                disabled={
                                    isCreatingSubtasks
                                }
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