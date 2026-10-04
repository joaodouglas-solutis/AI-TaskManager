import { useState } from "react";

import TaskCard from "./TaskCard";

function TaskColumn({
                        title,
                        status,
                        tasks,
                        onAdvanceStatus,
                        onDelete,
                        onMoveTask
                    }) {
    const [isDragOver, setIsDragOver] =
        useState(false);

    const handleDragOver = (event) => {
        event.preventDefault();

        event.dataTransfer.dropEffect = "move";

        setIsDragOver(true);
    };

    const handleDragLeave = (event) => {
        if (
            event.currentTarget ===
            event.target
        ) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();

        const taskId =
            event.dataTransfer.getData(
                "text/plain"
            );

        setIsDragOver(false);

        if (!taskId) {
            return;
        }

        onMoveTask(taskId, status);
    };

    return (
        <div
            className={`task-column ${
                isDragOver ? "is-drag-over" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="column-header">
                <div>
                    <span className="column-title">
                        {title}
                    </span>

                    <span className="column-count">
                        {tasks.length}
                    </span>
                </div>

                <button
                    className="column-action"
                    type="button"
                    aria-label={`Adicionar tarefa em ${title}`}
                >
                    +
                </button>
            </div>

            <div className="column-content">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onAdvanceStatus={
                            onAdvanceStatus
                        }
                        onDelete={
                            onDelete
                        }
                        onDragStart={(
                            event,
                            taskId
                        ) => {
                            event.dataTransfer.setData(
                                "text/plain",
                                taskId
                            );

                            event.dataTransfer.effectAllowed =
                                "move";
                        }}
                    />
                ))}

                {tasks.length === 0 && (
                    <div className="column-empty">
                        Solte uma tarefa aqui
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskColumn;