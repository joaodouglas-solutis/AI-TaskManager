import {
    TASK_STATUS,
    TASK_PRIORITY
} from "../types/task";

const STORAGE_KEY = "taskflow-tasks";

const initialTasks = [
    {
        id: crypto.randomUUID(),
        title: "Estudar Spring AI",
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.NORMAL
    },
    {
        id: crypto.randomUUID(),
        title: "Criar testes da API",
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.HIGH
    },
    {
        id: crypto.randomUUID(),
        title: "Atualizar README",
        status: TASK_STATUS.TODO,
        priority: TASK_PRIORITY.LOW
    },
    {
        id: crypto.randomUUID(),
        title: "Finalizar API",
        status: TASK_STATUS.IN_PROGRESS,
        priority: TASK_PRIORITY.HIGH
    },
    {
        id: crypto.randomUUID(),
        title: "Revisar arquitetura",
        status: TASK_STATUS.DONE,
        priority: TASK_PRIORITY.NORMAL
    },
    {
        id: crypto.randomUUID(),
        title: "Configurar PostgreSQL",
        status: TASK_STATUS.DONE,
        priority: TASK_PRIORITY.NORMAL
    }
];

/**
 * Camada responsável por ler as tarefas.
 *
 * Futuramente:
 * localStorage → API REST
 */
function getTasks() {
    const storedTasks =
        localStorage.getItem(STORAGE_KEY);

    if (!storedTasks) {
        saveTasks(initialTasks);

        return [...initialTasks];
    }

    try {
        return JSON.parse(storedTasks);
    } catch (error) {
        console.error(
            "Não foi possível carregar as tarefas.",
            error
        );

        saveTasks(initialTasks);

        return [...initialTasks];
    }
}

/**
 * Persiste as tarefas.
 *
 * Futuramente esta responsabilidade poderá
 * ser substituída por uma requisição HTTP.
 */
function saveTasks(tasks) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}

/**
 * Cria uma nova tarefa.
 */
function createTask({
                        title,
                        priority = TASK_PRIORITY.NORMAL
                    }) {
    const tasks = getTasks();

    const newTask = {
        id: crypto.randomUUID(),
        title,
        status: TASK_STATUS.TODO,
        priority
    };

    const updatedTasks = [
        newTask,
        ...tasks
    ];

    saveTasks(updatedTasks);

    return newTask;
}

/**
 * Atualiza uma tarefa existente.
 */
function updateTask(taskId, changes) {
    const tasks = getTasks();

    const taskExists = tasks.some(
        (task) => task.id === taskId
    );

    if (!taskExists) {
        return null;
    }

    const updatedTasks = tasks.map((task) => {
        if (task.id !== taskId) {
            return task;
        }

        return {
            ...task,
            ...changes
        };
    });

    saveTasks(updatedTasks);

    return updatedTasks.find(
        (task) => task.id === taskId
    );
}

/**
 * Remove uma tarefa.
 */
function deleteTask(taskId) {
    const tasks = getTasks();

    const updatedTasks = tasks.filter(
        (task) => task.id !== taskId
    );

    const taskDeleted =
        updatedTasks.length !== tasks.length;

    if (!taskDeleted) {
        return false;
    }

    saveTasks(updatedTasks);

    return true;
}

/**
 * Remove todas as tarefas.
 *
 * Útil para testes durante o desenvolvimento.
 */
function clearTasks() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Interface pública do serviço.
 *
 * O restante da aplicação deve conversar
 * com as tarefas através daqui.
 */
const taskService = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    clearTasks
};

export default taskService;