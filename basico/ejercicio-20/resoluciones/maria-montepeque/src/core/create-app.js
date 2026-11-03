function extendResponse(res) {
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (payload) => {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(payload));
    };
    return res;
}

function toRoute(method, path, handler) {
    const keys = [...path.matchAll(/:(\w+)/g)].map((m) => m[1]);
    const regex = new RegExp(`^${path.replace(/:\w+/g, "([^/]+)")}$`);
    return { method, regex, keys, handler };
}

function createApp() {
    const stack = [];

    const app = {
        use: (handler) => stack.push({ handler }),
        get: (path, handler) => stack.push(toRoute("GET", path, handler)),
        post: (path, handler) => stack.push(toRoute("POST", path, handler)),
        handle,
    };

    async function handle(req, res) {
        extendResponse(res);
        const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
        req.query = Object.fromEntries(searchParams);

        let index = 0;
        let error = null;

        const next = (err) => {
            if (err) error = err;
            return run();
        };

        async function run() {
            while (index < stack.length) {
                const layer = stack[index++];
                const isErrorHandler = layer.handler.length === 4;

                if (error) {
                    if (!isErrorHandler) continue;
                    return layer.handler(error, req, res, next);
                }

                if (isErrorHandler) continue;

                if (layer.regex) {
                    const match = pathname.match(layer.regex);
                    if (!match || layer.method !== req.method) continue;
                    req.params = Object.fromEntries(layer.keys.map((key, i) => [key, match[i + 1]]));
                }

                try {
                    return await layer.handler(req, res, next);
                } catch (err) {
                    return next(err);
                }
            }

            if (!res.writableEnded) {
                res.status(error ? 500 : 404).json({ ok: false, message: error ? error.message : "Ruta no encontrada" });
            }
        }

        return run();
    }

    return app;
}

export { createApp };
