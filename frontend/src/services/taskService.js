import apiClient from "./apiClient";

const TASKS_ENDPOINT = "/api/tasks";

function normalizeTask(task) {
    return {
        ...task,
        description:
            task.description ?? "",
        dueDate:
            task.dueDate ?? null
    };
}

async function getTasks() {
    const tasks =
        await apiClient.get(
            TASKS_ENDPOINT
        );

    return tasks.map(normalizeTask);
}

async function createTask({
                              title,
                              description = "",
                              priority,
                              dueDate = null
                          }) {
    const task =
        await apiClient.post(
            TASKS_ENDPOINT,
            {
                title,
                description,
                priority,
                dueDate
            }
        );

    return normalizeTask(task);
}

async function updateTask(task) {
    const updatedTask =
        await apiClient.put(
            `${TASKS_ENDPOINT}/${task.id}`,
            {
                title: task.title,
                description:
                    task.description ?? "",
                status: task.status,
                priority: task.priority,
                dueDate:
                    task.dueDate ?? null
            }
        );

    return normalizeTask(updatedTask);
}

async function deleteTask(taskId) {
    await apiClient.remove(
        `${TASKS_ENDPOINT}/${taskId}`
    );

    return true;
}

async function improveTask(
    taskId,
    provider = "GEMINI"
) {
    return apiClient.post(
        `${TASKS_ENDPOINT}/${taskId}/ai/improve`,
        {
            provider
        }
    );
}

async function analyzeTask(
    taskId,
    provider = "GEMINI"
) {
    return apiClient.post(
        `${TASKS_ENDPOINT}/${taskId}/ai/analyze`,
        {
            provider
        }
    );
}

async function decomposeTask(
    taskId,
    provider = "GEMINI"
) {
    return apiClient.post(
        `${TASKS_ENDPOINT}/${taskId}/ai/decompose`,
        {
            provider
        }
    );
}

async function createSubtasks(
    parentTaskId,
    subtasks
) {
    const response =
        await apiClient.post(
            `${TASKS_ENDPOINT}/${parentTaskId}/subtasks`,
            {
                subtasks: subtasks.map(
                    (subtask) => ({
                        title:
                        subtask.title,
                        description:
                        subtask.description
                    })
                )
            }
        );

    return response.map(normalizeTask);
}

async function getSubtasks(
    parentTaskId
) {
    const subtasks =
        await apiClient.get(
            `${TASKS_ENDPOINT}/${parentTaskId}/subtasks`
        );

    return subtasks.map(normalizeTask);
}

async function getWorkspaceAiSummary(
    provider = "GEMINI"
) {
    return apiClient.post(
        `${TASKS_ENDPOINT}/ai/summary`,
        {
            provider
        }
    );
}

async function chat(
    message,
    history = [],
    provider = "GEMINI"
) {
    return apiClient.post(
        `${TASKS_ENDPOINT}/ai/chat`,
        {
            message,
            history,
            provider
        }
    );
}

const taskService = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    improveTask,
    analyzeTask,
    decomposeTask,
    createSubtasks,
    getSubtasks,
    getWorkspaceAiSummary,
    chat
};

export default taskService;