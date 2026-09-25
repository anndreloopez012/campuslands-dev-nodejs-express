class HttpError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.status = status;
        this.extra = extra;
    }
}

async function readJson(req) {
    const contentType = req.headers["content-type"] ?? "";
    if (!contentType.includes("application/json")) {
        throw new HttpError(415, "El body debe enviarse con Content-Type: application/json");
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf-8").trim();

    if (!raw) throw new HttpError(400, "El body no puede estar vacio");

    try {
        return JSON.parse(raw);
    } catch {
        throw new HttpError(400, "El body no es JSON valido");
    }
}

export { readJson, HttpError };
