import {
    TASK_STATUS,
    TASK_PRIORITY
} from "../types/task";

function TaskCard({
                      task,
                      subtaskCount = 0,
                      onAdvanceStatus,
                      onDelete,
                      onEdit,
                      onDragStart,
                      provider
                  }) {
    const priorityLabel = {
        [TASK_PRIORITY.LOW]: "BAIXA",
        [TASK_PRIORITY.MEDIUM]: "MÉDIA",
        [TASK_PRIORITY.HIGH]: "ALTA"
    };

    const priorityClass =
        task.priority === TASK_PRIORITY.MEDIUM
            ? "priority-normal"
            : `priority-${task.priority.toLowerCase()}`;

    const isDone =
        task.status === TASK_STATUS.DONE;

    const isSubtask =
        task.parentTaskId != null;

    return (
        <article
            className={`task-card ${
                isDone
                    ? "task-card-done"
                    : ""
            } ${
                isSubtask
                    ? "task-card-subtask"
                    : ""
            }`}
            draggable
            onDragStart={(event) =>
                onDragStart(
                    event,
                    task.id
                )
            }
        >
            <div className="task-card-top">
                <div className="task-card-labels">
                    <button
                        className={`task-priority ${priorityClass}`}
                        type="button"
                        title="Prioridade da tarefa"
                    >
                        {
                            priorityLabel[
                                task.priority
                                ]
                        }
                    </button>

                    {isSubtask && (
                        <span className="task-type">
                            SUBTAREFA
                        </span>
                    )}

                    {!isSubtask &&
                        subtaskCount > 0 && (
                            <span className="subtask-count">
                                {subtaskCount}{" "}
                                {subtaskCount ===
                                1
                                    ? "subtarefa"
                                    : "subtarefas"}
                            </span>
                        )}
                </div>

                <div className="task-card-actions">
                    <button
                        className="task-menu"
                        type="button"
                        onClick={() =>
                            onEdit(task)
                        }
                        aria-label={`Editar ${task.title}`}
                        title="Editar tarefa"
                    >
                        ✎
                    </button>

                    <button
                        className="task-menu"
                        type="button"
                        onClick={() =>
                            onDelete(task.id)
                        }
                        aria-label={`Excluir ${task.title}`}
                        title="Excluir tarefa"
                    >
                        ×
                    </button>
                </div>
            </div>

            <h3>
                {task.title}
            </h3>

            <div className="task-card-footer">
                <button
                    className="status-action"
                    type="button"
                    onClick={() =>
                        onAdvanceStatus(
                            task.id
                        )
                    }
                    title="Avançar status"
                >
                    {task.status ===
                        TASK_STATUS.TODO &&
                        "A fazer →"}

                    {task.status ===
                        TASK_STATUS.IN_PROGRESS &&
                        "Em andamento →"}

                    {task.status ===
                        TASK_STATUS.DONE &&
                        "Concluída ✓"}
                </button>

                <span className="mini-avatar">
                    D
                </span>
            </div>
        </article>
    );
}

export default TaskCard;