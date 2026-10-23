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

        const method = req.method === "HEAD" ? "GET" : req.method;
        const allowed = new Set();
        let found = null;

        for (const route of routes) {
            const match = pathname.match(route.regex);
            if (!match) continue;

            allowed.add(route.method);
            if (route.method === "GET") allowed.add("HEAD");

            if (route.method === method && !found) {
                req.params = Object.fromEntries(route.keys.map((key, i) => [key, match[i + 1]]));
                found = route.handler;
            }
        }

        return { handler: found, allowed: [...allowed] };
    }

    const router = { resolve };
    for (const method of ["get", "post", "delete"]) {
        router[method] = (path, handler) => add(method.toUpperCase(), path, handler);
    }

    return router;
}

export { createRouter };
