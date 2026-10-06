import { useState } from "react";

import TaskCard from "./TaskCard";

function TaskColumn({
                        title,
                        status,
                        tasks,
                        subtaskCountByParent,
                        onAdvanceStatus,
                        onDelete,
                        onEdit,
                        onMoveTask
                    }) {
    const [isDragOver, setIsDragOver] =
        useState(false);

    const handleDragOver = (event) => {
        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";

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

        onMoveTask(
            Number(taskId),
            status
        );
    };

    return (
        <div
            className={`task-column ${
                isDragOver
                    ? "is-drag-over"
                    : ""
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
            </div>

            <div className="column-content">
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        subtaskCount={
                            subtaskCountByParent[
                                task.id
                                ] ?? 0
                        }
                        onAdvanceStatus={
                            onAdvanceStatus
                        }
                        onDelete={
                            onDelete
                        }
                        onEdit={onEdit}
                        onDragStart={(
                            event,
                            taskId
                        ) => {
                            event.dataTransfer.setData(
                                "text/plain",
                                String(taskId)
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