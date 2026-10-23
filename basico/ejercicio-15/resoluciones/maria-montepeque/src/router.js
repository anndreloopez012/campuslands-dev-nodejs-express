function createRouter() {
    const routes = [];

    function add(method, path, handler) {
        const keys = [];
        const pattern = path.replace(/:(\w+)/g, (_, key) => {
            keys.push(key);
            return "([^/]+)";
        });
        routes.push({ method, regex: new RegExp(`^${pattern}$`), keys, handler });
    }

    function match(method, pathname) {
        let pathMatched = false;

        for (const route of routes) {
            const result = pathname.match(route.regex);
            if (!result) continue;
            pathMatched = true;
            if (route.method !== method) continue;

            const params = Object.fromEntries(route.keys.map((key, i) => [key, result[i + 1]]));
            return { handler: route.handler, params };
        }

        return { handler: null, pathMatched };
    }

    return { add, match };
}

export { createRouter };