function json(res, status, payload) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
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
        const error = new Error("El body debe ser JSON valido");
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
        let pathExists = false;

        for (const route of routes) {
            const match = pathname.match(route.regex);
            if (!match) continue;
            pathExists = true;
            if (route.method !== req.method) continue;

            req.params = Object.fromEntries(route.keys.map((key, i) => [key, match[i + 1]]));
            return { handler: route.handler, pathExists };
        }

        return { handler: null, pathExists };
    }

    const router = { resolve };
    for (const method of ["get", "post", "patch", "delete"]) {
        router[method] = (path, handler) => add(method.toUpperCase(), path, handler);
    }

    return router;
}

export { json, readJson, createRouter };
