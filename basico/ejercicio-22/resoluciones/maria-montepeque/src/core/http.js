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
        routes.push({ method, path, handler });
    }

    function resolve(req) {
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
        req.query = Object.fromEntries(searchParams);

        return routes.find((route) => route.method === req.method && route.path === pathname)?.handler ?? null;
    }

    return {
        get: (path, handler) => add("GET", path, handler),
        post: (path, handler) => add("POST", path, handler),
        resolve,
    };
}

export { json, readJson, createRouter };
