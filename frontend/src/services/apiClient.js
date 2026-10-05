const DEFAULT_HEADERS = {
    "Content-Type": "application/json"
};

async function request(
    url,
    options = {}
) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...DEFAULT_HEADERS,
            ...options.headers
        }
    });

    if (!response.ok) {
        let errorBody = null;

        try {
            errorBody = await response.json();
        } catch {
            // Resposta sem JSON.
        }

        const message =
            errorBody?.message ||
            errorBody?.error ||
            `Erro na requisição (${response.status}).`;

        const error = new Error(message);

        error.status = response.status;
        error.details = errorBody;

        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function get(url) {
    return request(url, {
        method: "GET"
    });
}

async function post(url, body) {
    return request(url, {
        method: "POST",
        body: JSON.stringify(body)
    });
}

async function put(url, body) {
    return request(url, {
        method: "PUT",
        body: JSON.stringify(body)
    });
}

async function remove(url) {
    return request(url, {
        method: "DELETE"
    });
}

const apiClient = {
    get,
    post,
    put,
    remove
};

export default apiClient;