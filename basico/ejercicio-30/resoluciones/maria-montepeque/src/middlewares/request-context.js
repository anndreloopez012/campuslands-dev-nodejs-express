import { randomUUID } from "node:crypto";

function requestContext(logger) {
    return (req, res) => {
        const start = process.hrtime.bigint();
        req.id = req.headers["x-request-id"] ?? randomUUID().slice(0, 8);
        req.log = logger.child({ reqId: req.id });

        res.on("finish", () => {
            const ms = Number(process.hrtime.bigint() - start) / 1e6;
            const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
            req.log[level](`${req.method} ${req.url} -> ${res.statusCode}`, { ms: Math.round(ms * 100) / 100 });
        });
    };
}

export { requestContext };
