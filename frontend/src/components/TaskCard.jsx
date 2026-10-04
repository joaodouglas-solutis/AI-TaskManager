import {
    TASK_STATUS,
    TASK_PRIORITY
} from "../types/task";

function TaskCard({
                      task,
                      onAdvanceStatus,
                      onDelete,
                      onDragStart
                  }) {
    const priorityLabel = {
        [TASK_PRIORITY.LOW]: "BAIXA",
        [TASK_PRIORITY.NORMAL]: "NORMAL",
        [TASK_PRIORITY.HIGH]: "ALTA"
    };

    const isDone =
        task.status === TASK_STATUS.DONE;

    return (
        <article
            className={`task-card ${
                isDone ? "task-card-done" : ""
            }`}
            draggable
            onDragStart={(event) =>
                onDragStart(event, task.id)
            }
        >
            <div className="task-card-top">
                <button
                    className={`task-priority priority-${task.priority.toLowerCase()}`}
                    type="button"
                    title="Prioridade da tarefa"
                >
                    {priorityLabel[task.priority]}
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

            <h3>
                {task.title}
            </h3>

            <div className="task-card-footer">
                <button
                    className="status-action"
                    type="button"
                    onClick={() =>
                        onAdvanceStatus(task.id)
                    }
                    title="Avançar status"
                >
                    {task.status === TASK_STATUS.TODO &&
                        "A fazer →"}

                    {task.status === TASK_STATUS.IN_PROGRESS &&
                        "Em andamento →"}

                    {task.status === TASK_STATUS.DONE &&
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