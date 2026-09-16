import { STATUS_CODES } from "node:http";
import { createHash } from "node:crypto";

function send(req, res, status, body, headers = {}) {
    const payload = body === undefined ? "" : JSON.stringify(body);
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(payload),
        "X-Request-Id": req.id,
        ...headers,
    });
    res.end(req.method === "HEAD" ? undefined : payload);
}

const reply = {
    ok: (req, res, data, extra = {}) => send(req, res, 200, { ok: true, ...extra, data }),
    created: (req, res, data, location) => send(req, res, 201, { ok: true, data }, { Location: location }),
    noContent: (req, res) => res.writeHead(204, { "X-Request-Id": req.id }).end(),

    cached(req, res, data, extra = {}) {
        const body = { ok: true, ...extra, data };
        const etag = `"${createHash("sha1").update(JSON.stringify(body)).digest("hex").slice(0, 16)}"`;
        if (req.headers["if-none-match"] === etag) return res.writeHead(304, { ETag: etag, "X-Request-Id": req.id }).end();
        send(req, res, 200, body, { ETag: etag, "Cache-Control": "private, max-age=15" });
    },

    problem(req, res, status, detail, details, headers) {
        const body = { ok: false, status, title: STATUS_CODES[status], detail, instance: req.url, ...(details && { details }) };
        send(req, res, status, body, { "Content-Type": "application/problem+json; charset=utf-8", ...headers });
    },
};

export { reply };
