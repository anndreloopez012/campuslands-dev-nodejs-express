class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

function json(res, status, payload, headers = {}) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
    res.end(JSON.stringify(payload));
}

async function readJson(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf-8").trim();

    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch {
        throw new HttpError(400, "El body no es JSON valido");
    }
}

function createRouter() {
    const routes = [];

    function add(method, path, handler) {
        const keys = [...path.matchAll(/:(\w+)/g)].map((m) => m[1]);
        const regex = new RegExp(`^${path.replace(/:\w+/g, "([^/]+)")}$`);
        routes.push({ method, regex, keys, handler });
    }

    function resolve(req) {
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
        req.query = Object.fromEntries(searchParams);
        const allowed = [];

        for (const route of routes) {
            const match = pathname.match(route.regex);
            if (!match) continue;
            allowed.push(route.method);
            if (route.method !== req.method) continue;

            req.params = Object.fromEntries(route.keys.map((key, i) => [key, match[i + 1]]));
            return { handler: route.handler, allowed };
        }

        return { handler: null, allowed };
    }

    return {
        get: (path, handler) => add("GET", path, handler),
        post: (path, handler) => add("POST", path, handler),
        resolve,
    };
}

export { HttpError, json, readJson, createRouter };
