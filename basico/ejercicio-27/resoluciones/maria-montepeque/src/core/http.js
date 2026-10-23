function json(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(body) });
    res.end(body);
}

async function readJson(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf-8").trim();

    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch {
        const error = new Error("El body no es JSON valido");
        error.status = 400;
        throw error;
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

        for (const route of routes) {
            const match = pathname.match(route.regex);
            if (!match || route.method !== req.method) continue;

            req.params = Object.fromEntries(route.keys.map((key, i) => [key, match[i + 1]]));
            return route.handler;
        }

        return null;
    }

    return {
        get: (path, handler) => add("GET", path, handler),
        post: (path, handler) => add("POST", path, handler),
        resolve,
    };
}

export { json, readJson, createRouter };
