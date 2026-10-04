import { useState } from "react";

import {
    TASK_PRIORITY
} from "../types/task";

function NewTaskModal({
                          onClose,
                          onSubmit
                      }) {
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState(
        TASK_PRIORITY.NORMAL
    );

    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            return;
        }

        onSubmit({
            title: trimmedTitle,
            priority
        });

        setTitle("");
        setPriority(TASK_PRIORITY.NORMAL);
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
                        onClick={onClose}
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
                                setTitle(event.target.value)
                            }
                            placeholder="Ex.: Implementar autenticação"
                            autoFocus
                        />
                    </label>

                    <label>
                        Prioridade

                        <select
                            value={priority}
                            onChange={(event) =>
                                setPriority(event.target.value)
                            }
                        >
                            <option value={TASK_PRIORITY.LOW}>
                                Baixa
                            </option>

                            <option value={TASK_PRIORITY.NORMAL}>
                                Normal
                            </option>

                            <option value={TASK_PRIORITY.HIGH}>
                                Alta
                            </option>
                        </select>
                    </label>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="modal-submit"
                        >
                            Criar tarefa
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default NewTaskModal;