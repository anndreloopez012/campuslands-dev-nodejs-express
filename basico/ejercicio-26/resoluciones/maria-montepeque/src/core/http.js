import { STATUS_CODES } from "node:http";

class HttpError extends Error {
    constructor(status, message, headers = {}) {
        super(message ?? STATUS_CODES[status]);
        this.status = status;
        this.headers = headers;
    }
}

function json(res, status, payload, headers = {}) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
    res.end(JSON.stringify({ status, reason: STATUS_CODES[status], ...payload }));
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

    const router = { resolve };
    for (const method of ["get", "post", "delete"]) {
        router[method] = (path, handler) => add(method.toUpperCase(), path, handler);
    }

    return router;
}

export { HttpError, json, readJson, createRouter };
