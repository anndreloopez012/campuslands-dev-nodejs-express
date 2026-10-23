import { createHash } from "node:crypto";

const STATUS_TEXT = {
    400: "Bad Request",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    409: "Conflict",
    415: "Unsupported Media Type",
    422: "Unprocessable Content",
    500: "Internal Server Error",
};

function send(req, res, status, body, headers = {}) {
    const payload = body === undefined ? "" : JSON.stringify(body);

    res.writeHead(status, {
        "Content-Length": Buffer.byteLength(payload),
        "X-Request-Id": req.id,
        ...headers,
    });
    res.end(req.method === "HEAD" ? undefined : payload);
}

function ok(req, res, status, data, headers = {}) {
    send(req, res, status, data, { "Content-Type": "application/json; charset=utf-8", ...headers });
}

function created(req, res, data, location) {
    ok(req, res, 201, data, { Location: location });
}

function noContent(req, res) {
    res.writeHead(204, { "X-Request-Id": req.id }).end();
}

function cached(req, res, data) {
    const payload = JSON.stringify(data);
    const etag = `"${createHash("sha1").update(payload).digest("hex").slice(0, 16)}"`;
    const headers = { ETag: etag, "Cache-Control": "private, max-age=30" };

    if (req.headers["if-none-match"] === etag) {
        return res.writeHead(304, { ...headers, "X-Request-Id": req.id }).end();
    }

    ok(req, res, 200, data, headers);
}

function problem(req, res, status, detail, extra = {}, headers = {}) {
    const body = { type: "about:blank", title: STATUS_TEXT[status] ?? "Error", status, detail, instance: req.url, ...extra };
    send(req, res, status, body, { "Content-Type": "application/problem+json; charset=utf-8", ...headers });
}

export { ok, created, noContent, cached, problem };
