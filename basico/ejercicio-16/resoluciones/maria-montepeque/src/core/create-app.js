import http from "node:http";

function extendResponse(res) {
    res.statusCode = 200;
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

function createApp() {
    const routes = new Map();
    let notFound = (req, res) => res.status(404).json({ ok: false, message: "Not Found" });

    const app = {
        get(path, handler) {
            routes.set(`GET ${path}`, handler);
            return app;
        },
        use(handler) {
            notFound = handler;
            return app;
        },
        listen(port, callback) {
            return http.createServer((req, res) => {
                const { pathname } = new URL(req.url, `http://${req.headers.host}`);
                const handler = routes.get(`${req.method} ${pathname}`) ?? notFound;
                handler(req, extendResponse(res));
            }).listen(port, callback);
        },
    };

    return app;
}

export { createApp };