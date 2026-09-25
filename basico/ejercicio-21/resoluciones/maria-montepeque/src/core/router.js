function createRouter() {
    const routes = [];
    const children = [];

    function add(method, path, handler) {
        routes.push({ method, path, handler });
    }

    function use(prefix, router) {
        children.push({ prefix, router });
    }

    function flatten(base = "") {
        const own = routes.map((route) => ({ ...route, path: `${base}${route.path}` }));
        const nested = children.flatMap(({ prefix, router }) => router.flatten(`${base}${prefix}`));
        return [...own, ...nested];
    }

    function resolve(req) {
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
        let pathExists = false;

        for (const route of flatten()) {
            const keys = [...route.path.matchAll(/:(\w+)/g)].map((m) => m[1]);
            const regex = new RegExp(`^${route.path.replace(/:\w+/g, "([^/]+)")}/?$`);
            const match = pathname.match(regex);
            if (!match) continue;

            pathExists = true;
            if (route.method !== req.method) continue;

            req.params = Object.fromEntries(keys.map((key, i) => [key, match[i + 1]]));
            req.query = Object.fromEntries(searchParams);
            return { handler: route.handler, pathExists };
        }

        return { handler: null, pathExists };
    }

    return {
        get: (path, handler) => add("GET", path, handler),
        post: (path, handler) => add("POST", path, handler),
        use,
        flatten,
        resolve,
    };
}

export { createRouter };
