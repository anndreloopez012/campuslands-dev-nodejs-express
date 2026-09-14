function createRouter() {
    const routes = [];

    function add(method, path, handler) {
        const keys = [...path.matchAll(/:(\w+)/g)].map((m) => m[1]);
        const regex = new RegExp(`^${path.replace(/:\w+/g, "([^/]+)")}$`);
        routes.push({ method, regex, keys, handler });
    }

    function resolve(req) {
        const { pathname } = new URL(req.url, `http://${req.headers.host}`);
        let pathExists = false;

        for (const route of routes) {
            const match = pathname.match(route.regex);
            if (!match) continue;
            pathExists = true;
            if (route.method !== req.method) continue;

            req.params = Object.fromEntries(route.keys.map((key, i) => [key, match[i + 1]]));
            return { handler: route.handler };
        }

        return { handler: null, pathExists };
    }

    return {
        get: (path, handler) => add("GET", path, handler),
        post: (path, handler) => add("POST", path, handler),
        resolve,
    };
}

export { createRouter };