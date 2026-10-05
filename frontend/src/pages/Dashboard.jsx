import { useEffect, useState } from "react";

import Header from "../components/Header";
import AIAssistant from "../components/AIAssistant";
import TaskColumn from "../components/TaskColumn";
import NewTaskModal from "../components/NewTaskModal";
import EditTaskModal from "../components/EditTaskModal";

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
    [TASK_PRIORITY.MEDIUM]: "MÉDIA",
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
    const { theme, toggleTheme } =
        useTheme();

    const [tasks, setTasks] =
        useState([]);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState(null);

    const [activeFilter, setActiveFilter] =
        useState("ALL");

    useEffect(() => {
        let isMounted = true;

        async function loadTasks() {
            try {
                setIsLoading(true);
                setError("");

                const loadedTasks =
                    await taskService.getTasks();

                if (isMounted) {
                    setTasks(loadedTasks);
                }
            } catch (requestError) {
                if (isMounted) {
                    setError(
                        requestError.message ||
                        "Não foi possível carregar as tarefas."
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadTasks();

        return () => {
            isMounted = false;
        };
    }, []);

    const todoTasks = tasks.filter(
        (task) =>
            task.status ===
            TASK_STATUS.TODO
    );

    const inProgressTasks = tasks.filter(
        (task) =>
            task.status ===
            TASK_STATUS.IN_PROGRESS
    );

    const doneTasks = tasks.filter(
        (task) =>
            task.status ===
            TASK_STATUS.DONE
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
            status:
            TASK_STATUS.IN_PROGRESS,
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
                    column.status ===
                    activeFilter
            );

    const handleCreateTask =
        async (taskData) => {
            try {
                setError("");

                const newTask =
                    await taskService.createTask(
                        taskData
                    );

                setTasks(
                    (currentTasks) => [
                        newTask,
                        ...currentTasks
                    ]
                );

                setIsModalOpen(false);

                return true;
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Não foi possível criar a tarefa."
                );

                return false;
            }
        };

    const handleMoveTask =
        async (
            taskId,
            destinationStatus
        ) => {
            const normalizedTaskId =
                Number(taskId);

            if (
                !Number.isFinite(
                    normalizedTaskId
                )
            ) {
                return;
            }

            const task = tasks.find(
                (currentTask) =>
                    currentTask.id ===
                    normalizedTaskId
            );

            if (!task) {
                return;
            }

            if (
                task.status ===
                destinationStatus
            ) {
                return;
            }

            try {
                setError("");

                const updatedTask =
                    await taskService.updateTask({
                        ...task,
                        status:
                        destinationStatus
                    });

                setTasks(
                    (currentTasks) =>
                        currentTasks.map(
                            (currentTask) =>
                                currentTask.id ===
                                normalizedTaskId
                                    ? updatedTask
                                    : currentTask
                        )
                );
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Não foi possível atualizar a tarefa."
                );
            }
        };

    const handleAdvanceStatus =
        async (taskId) => {
            const normalizedTaskId =
                Number(taskId);

            const task = tasks.find(
                (currentTask) =>
                    currentTask.id ===
                    normalizedTaskId
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

            await handleMoveTask(
                normalizedTaskId,
                nextStatus[task.status]
            );
        };

    const handleDeleteTask =
        async (taskId) => {
            const normalizedTaskId =
                Number(taskId);

            if (
                !Number.isFinite(
                    normalizedTaskId
                )
            ) {
                return;
            }

            try {
                setError("");

                await taskService.deleteTask(
                    normalizedTaskId
                );

                setTasks(
                    (currentTasks) =>
                        currentTasks.filter(
                            (task) =>
                                task.id !==
                                normalizedTaskId
                        )
                );
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Não foi possível excluir a tarefa."
                );
            }
        };

    const handleEditTask =
        async (updatedTask) => {
            try {
                setError("");

                const savedTask =
                    await taskService.updateTask(
                        updatedTask
                    );

                setTasks(
                    (currentTasks) =>
                        currentTasks.map(
                            (currentTask) =>
                                currentTask.id ===
                                savedTask.id
                                    ? savedTask
                                    : currentTask
                        )
                );

                return true;
            } catch (requestError) {
                setError(
                    requestError.message ||
                    "Não foi possível atualizar a tarefa."
                );

                return false;
            }
        };

    const handleSubtasksCreated =
        (createdSubtasks) => {
            setTasks(
                (currentTasks) => [
                    ...createdSubtasks,
                    ...currentTasks
                ]
            );
        };

    if (isLoading) {
        return (
            <main className="app">
                <Header
                    theme={theme}
                    toggleTheme={
                        toggleTheme
                    }
                />

                <section className="hero">
                    <div className="hero-copy">
                        <span className="eyebrow">
                            CARREGANDO
                        </span>

                        <h1>
                            Preparando seu workspace.
                        </h1>

                        <p>
                            Buscando suas tarefas...
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (
        error &&
        tasks.length === 0
    ) {
        return (
            <main className="app">
                <Header
                    theme={theme}
                    toggleTheme={
                        toggleTheme
                    }
                />

                <section className="hero">
                    <div className="hero-copy">
                        <span className="eyebrow">
                            ERRO
                        </span>

                        <h1>
                            O backend não respondeu.
                        </h1>

                        <p>
                            {error}
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="app">
            <Header
                theme={theme}
                toggleTheme={
                    toggleTheme
                }
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

            {error && (
                <div className="empty-state">
                    {error}
                </div>
            )}

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
                                            {
                                                task.title
                                            }
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
                        {FILTERS.map(
                            (filter) => (
                                <button
                                    key={
                                        filter.key
                                    }
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
                                    {
                                        filter.label
                                    }
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div
                    className={`task-board ${
                        activeFilter !==
                        "ALL"
                            ? "task-board-filtered"
                            : ""
                    }`}
                >
                    {visibleColumns.map(
                        (column) => (
                            <TaskColumn
                                key={
                                    column.status
                                }
                                title={
                                    column.title
                                }
                                status={
                                    column.status
                                }
                                tasks={
                                    column.tasks
                                }
                                onAdvanceStatus={
                                    handleAdvanceStatus
                                }
                                onDelete={
                                    handleDeleteTask
                                }
                                onEdit={
                                    setEditingTask
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

            {editingTask && (
                <EditTaskModal
                    task={editingTask}
                    onClose={() =>
                        setEditingTask(null)
                    }
                    onSubmit={
                        handleEditTask
                    }
                    onSubtasksCreated={
                        handleSubtasksCreated
                    }
                />
            )}
        </main>
    );
}

export default Dashboard;