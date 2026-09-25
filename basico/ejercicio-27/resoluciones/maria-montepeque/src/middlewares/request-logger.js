import { randomUUID } from "node:crypto";
import { logger } from "../core/logger.js";

function levelFor(status) {
    if (status >= 500) return "error";
    if (status >= 400) return "warn";
    return "info";
}

function requestLogger(req, res) {
    const start = process.hrtime.bigint();
    req.id = req.headers["x-request-id"] ?? randomUUID().slice(0, 8);
    req.log = logger.child({ reqId: req.id });

    res.setHeader("X-Request-Id", req.id);
    req.log.debug("peticion recibida", { method: req.method, url: req.url, ua: req.headers["user-agent"] });

    res.on("finish", () => {
        const ms = Number(process.hrtime.bigint() - start) / 1e6;
        req.log[levelFor(res.statusCode)](`${req.method} ${req.url} -> ${res.statusCode}`, {
            status: res.statusCode,
            ms: Math.round(ms * 100) / 100,
            bytes: Number(res.getHeader("content-length") ?? 0),
        });
    });
}

export { requestLogger };
