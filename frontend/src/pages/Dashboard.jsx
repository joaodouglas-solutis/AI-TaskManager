import { useState } from "react";

import Header from "../components/Header";
import AIAssistant from "../components/AIAssistant";
import TaskColumn from "../components/TaskColumn";
import NewTaskModal from "../components/NewTaskModal";

import { useTheme } from "../hooks/useTheme";
import taskService from "../services/taskService";

import {
    TASK_STATUS,
    TASK_PRIORITY
} from "../types/task";

import "./Dashboard.css";

const STATUS_LABELS = {
    [TASK_STATUS.TODO]: "A fazer",
    [TASK_STATUS.IN_PROGRESS]: "Em andamento",
    [TASK_STATUS.DONE]: "Concluída"
};

const PRIORITY_LABELS = {
    [TASK_PRIORITY.HIGH]: "ALTA",
    [TASK_PRIORITY.NORMAL]: "NORMAL",
    [TASK_PRIORITY.LOW]: "BAIXA"
};

const FILTERS = [
    {
        key: "ALL",
        label: "Todas"
    },
    {
        key: TASK_STATUS.TODO,
        label: "A fazer"
    },
    {
        key: TASK_STATUS.IN_PROGRESS,
        label: "Em andamento"
    },
    {
        key: TASK_STATUS.DONE,
        label: "Concluídas"
    }
];

function formatCurrentDate() {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "short"
    })
        .format(new Date())
        .replace(".", "")
        .toUpperCase();
}

function Dashboard() {
    const { theme, toggleTheme } = useTheme();

    const [tasks, setTasks] = useState(
        () => taskService.getTasks()
    );

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [activeFilter, setActiveFilter] =
        useState("ALL");

    const todoTasks = tasks.filter(
        (task) =>
            task.status === TASK_STATUS.TODO
    );

    const inProgressTasks = tasks.filter(
        (task) =>
            task.status === TASK_STATUS.IN_PROGRESS
    );

    const doneTasks = tasks.filter(
        (task) =>
            task.status === TASK_STATUS.DONE
    );

    const openTasks =
        todoTasks.length +
        inProgressTasks.length;

    const boardColumns = [
        {
            status: TASK_STATUS.TODO,
            title: "A fazer",
            tasks: todoTasks
        },
        {
            status: TASK_STATUS.IN_PROGRESS,
            title: "Em andamento",
            tasks: inProgressTasks
        },
        {
            status: TASK_STATUS.DONE,
            title: "Concluídas",
            tasks: doneTasks
        }
    ];

    const visibleColumns =
        activeFilter === "ALL"
            ? boardColumns
            : boardColumns.filter(
                (column) =>
                    column.status === activeFilter
            );

    const handleCreateTask = (taskData) => {
        const newTask =
            taskService.createTask(taskData);

        setTasks((currentTasks) => [
            newTask,
            ...currentTasks
        ]);

        setIsModalOpen(false);
    };

    const handleMoveTask = (
        taskId,
        destinationStatus
    ) => {
        const task = tasks.find(
            (currentTask) =>
                currentTask.id === taskId
        );

        if (!task) {
            return;
        }

        if (task.status === destinationStatus) {
            return;
        }

        const updatedTask =
            taskService.updateTask(
                taskId,
                {
                    status: destinationStatus
                }
            );

        if (!updatedTask) {
            return;
        }

        setTasks((currentTasks) =>
            currentTasks.map((currentTask) =>
                currentTask.id === taskId
                    ? updatedTask
                    : currentTask
            )
        );
    };

    const handleAdvanceStatus = (taskId) => {
        const task = tasks.find(
            (currentTask) =>
                currentTask.id === taskId
        );

        if (!task) {
            return;
        }

        const nextStatus = {
            [TASK_STATUS.TODO]:
            TASK_STATUS.IN_PROGRESS,

            [TASK_STATUS.IN_PROGRESS]:
            TASK_STATUS.DONE,

            [TASK_STATUS.DONE]:
            TASK_STATUS.TODO
        };

        handleMoveTask(
            taskId,
            nextStatus[task.status]
        );
    };

    const handleDeleteTask = (taskId) => {
        const wasDeleted =
            taskService.deleteTask(taskId);

        if (!wasDeleted) {
            return;
        }

        setTasks((currentTasks) =>
            currentTasks.filter(
                (task) =>
                    task.id !== taskId
            )
        );
    };

    return (
        <main className="app">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <section className="hero">
                <div className="hero-copy">
                    <span className="eyebrow">
                        {formatCurrentDate()}
                    </span>

                    <h1>
                        Bom dia, Douglas.
                    </h1>

                    <p>
                        Vamos organizar o que importa.
                    </p>
                </div>

                <div className="hero-action">
                    <div className="hero-summary">
                        <strong>
                            {openTasks}
                        </strong>

                        <span>
                            tarefas abertas
                        </span>
                    </div>

                    <button
                        className="new-task"
                        type="button"
                        onClick={() =>
                            setIsModalOpen(true)
                        }
                    >
                        <span>+</span>
                        Nova tarefa
                    </button>
                </div>
            </section>

            <section className="focus-layout">
                <div className="focus-section">
                    <div className="section-heading">
                        <div>
                            <span className="eyebrow">
                                FOCO
                            </span>

                            <h2>
                                Seu dia
                            </h2>
                        </div>

                        <span className="section-meta">
                            {tasks.length} no total
                        </span>
                    </div>

                    <div className="focus-list">
                        {tasks
                            .slice(0, 5)
                            .map((task) => (
                                <div
                                    className={`focus-item ${
                                        task.status ===
                                        TASK_STATUS.DONE
                                            ? "is-complete"
                                            : ""
                                    }`}
                                    key={task.id}
                                >
                                    <button
                                        className={`focus-check ${
                                            task.status ===
                                            TASK_STATUS.DONE
                                                ? "checked"
                                                : ""
                                        }`}
                                        type="button"
                                        onClick={() =>
                                            handleAdvanceStatus(
                                                task.id
                                            )
                                        }
                                        aria-label="Alterar status"
                                    >
                                        {task.status ===
                                        TASK_STATUS.DONE
                                            ? "✓"
                                            : ""}
                                    </button>

                                    <div className="focus-content">
                                        <span className="focus-title">
                                            {task.title}
                                        </span>

                                        <span className="focus-status">
                                            {
                                                STATUS_LABELS[
                                                    task.status
                                                    ]
                                            }
                                        </span>
                                    </div>

                                    <span
                                        className={`focus-priority priority-${task.priority.toLowerCase()}`}
                                    >
                                        {
                                            PRIORITY_LABELS[
                                                task.priority
                                                ]
                                        }
                                    </span>
                                </div>
                            ))}

                        {tasks.length === 0 && (
                            <div className="empty-state">
                                Nenhuma tarefa por enquanto.
                            </div>
                        )}
                    </div>
                </div>

                <AIAssistant />
            </section>

            <section className="tasks-section">
                <div className="section-heading">
                    <div>
                        <span className="eyebrow">
                            WORKSPACE
                        </span>

                        <h2>
                            Todas as tarefas
                        </h2>
                    </div>

                    <div className="task-filters">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                className={
                                    activeFilter ===
                                    filter.key
                                        ? "filter-active"
                                        : ""
                                }
                                onClick={() =>
                                    setActiveFilter(
                                        filter.key
                                    )
                                }
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    className={`task-board ${
                        activeFilter !== "ALL"
                            ? "task-board-filtered"
                            : ""
                    }`}
                >
                    {visibleColumns.map(
                        (column) => (
                            <TaskColumn
                                key={column.status}
                                title={column.title}
                                status={column.status}
                                tasks={column.tasks}
                                onAdvanceStatus={
                                    handleAdvanceStatus
                                }
                                onDelete={
                                    handleDeleteTask
                                }
                                onMoveTask={
                                    handleMoveTask
                                }
                            />
                        )
                    )}
                </div>
            </section>

            {isModalOpen && (
                <NewTaskModal
                    onClose={() =>
                        setIsModalOpen(false)
                    }
                    onSubmit={
                        handleCreateTask
                    }
                />
            )}
        </main>
    );
}

export default Dashboard;