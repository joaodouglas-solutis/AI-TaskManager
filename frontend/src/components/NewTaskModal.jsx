import { useState } from "react";

import {
    TASK_PRIORITY
} from "../types/task";

function NewTaskModal({
                          onClose,
                          onSubmit
                      }) {
    const [title, setTitle] =
        useState("");

    const [priority, setPriority] =
        useState(
            TASK_PRIORITY.MEDIUM
        );

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedTitle =
            title.trim();

        if (!trimmedTitle || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        try {
            const success =
                await onSubmit({
                    title: trimmedTitle,
                    description: "",
                    priority,
                    dueDate: null
                });

            if (success) {
                setTitle("");

                setPriority(
                    TASK_PRIORITY.MEDIUM
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            NOVA TAREFA
                        </span>

                        <h2>
                            O que precisa ser feito?
                        </h2>
                    </div>

                    <button
                        className="modal-close"
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
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
                            placeholder="Ex.: Implementar autenticação"
                            autoFocus
                            disabled={isSubmitting}
                        />
                    </label>

                    <label>
                        Prioridade

                        <select
                            value={priority}
                            onChange={(event) =>
                                setPriority(
                                    event.target.value
                                )
                            }
                            disabled={isSubmitting}
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

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="modal-submit"
                            disabled={
                                isSubmitting ||
                                !title.trim()
                            }
                        >
                            {isSubmitting
                                ? "Criando..."
                                : "Criar tarefa"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewTaskModal;