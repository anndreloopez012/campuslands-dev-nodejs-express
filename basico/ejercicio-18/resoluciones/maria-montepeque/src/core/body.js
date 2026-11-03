class BodyError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

async function parseJsonBody(req) {
    const contentType = req.headers["content-type"] ?? "";
    if (!contentType.includes("application/json")) {
        throw new BodyError(415, "Content-Type debe ser application/json");
    }

    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf-8").trim();

    if (!raw) throw new BodyError(400, "El body no puede estar vacio");

    try {
        return JSON.parse(raw);
    } catch {
        throw new BodyError(400, "El body no es JSON valido");
    }
}

export { parseJsonBody, BodyError };