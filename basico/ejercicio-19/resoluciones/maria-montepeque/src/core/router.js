function createRouter() {
    const routes = [];

    function get(path, handler) {
        const keys = [...path.matchAll(/:(\w+)/g)].map((m) => m[1]);
        const regex = new RegExp(`^${path.replace(/:\w+/g, "([^/]+)")}$`);
        routes.push({ regex, keys, handler });
    }

    function resolve(req) {
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);

        for (const { regex, keys, handler } of routes) {
            const match = pathname.match(regex);
            if (!match) continue;

            req.params = Object.fromEntries(keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
            req.query = Object.fromEntries(searchParams);
            return handler;
        }

        return null;
    }

    return { get, resolve };
}

export { createRouter };
