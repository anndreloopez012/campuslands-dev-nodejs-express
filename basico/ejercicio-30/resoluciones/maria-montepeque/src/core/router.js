const METHODS = ["get", "post", "put", "patch", "delete"];

function createRouter() {
    const routes = [];
    const children = [];

    function flatten(base = "") {
        const own = routes.map((route) => ({ ...route, path: `${base}${route.path}` }));
        return [...own, ...children.flatMap(({ prefix, router }) => router.flatten(`${base}${prefix}`))];
    }

    function resolve(req) {
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
        req.query = Object.fromEntries(searchParams);

        const method = req.method === "HEAD" ? "GET" : req.method;
        const allowed = new Set();
        let found = null;

        for (const route of flatten()) {
            const keys = [...route.path.matchAll(/:(\w+)/g)].map((m) => m[1]);
            const match = pathname.match(new RegExp(`^${route.path.replace(/:\w+/g, "([^/]+)")}/?$`));
            if (!match) continue;

            allowed.add(route.method);
            if (route.method === method && !found) {
                req.params = Object.fromEntries(keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
                found = route.handler;
            }
        }

        return { handler: found, allowed: [...allowed] };
    }

    const router = { flatten, resolve, use: (prefix, child) => children.push({ prefix, router: child }) };
    for (const method of METHODS) {
        router[method] = (path, handler) => routes.push({ method: method.toUpperCase(), path, handler });
    }
    return router;
}

export { createRouter };
