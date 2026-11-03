class HttpError extends Error {
    constructor(status, message, type) {
        super(message);
        this.status = status;
        this.type = type;
    }
}

const units = { b: 1, kb: 1024, mb: 1024 * 1024 };

function toBytes(limit) {
    const [, value, unit = "b"] = String(limit).toLowerCase().match(/^(\d+)(b|kb|mb)?$/) ?? [];
    return Number(value) * units[unit];
}

function jsonBody({ limit = "100kb", strict = true } = {}) {
    const maxBytes = toBytes(limit);

    return async (req, res, next) => {
        req.body = {};

        const contentType = req.headers["content-type"] ?? "";
        if (!["POST", "PUT", "PATCH"].includes(req.method) || !contentType.includes("application/json")) {
            return next();
        }

        const declared = Number(req.headers["content-length"] ?? 0);
        if (declared > maxBytes) {
            throw new HttpError(413, `El body supera el limite de ${limit}`, "entity.too.large");
        }

        const chunks = [];
        let received = 0;

        for await (const chunk of req) {
            received += chunk.length;
            if (received > maxBytes) {
                throw new HttpError(413, `El body supera el limite de ${limit}`, "entity.too.large");
            }
            chunks.push(chunk);
        }

        const raw = Buffer.concat(chunks).toString("utf-8").trim();
        if (!raw) return next();

        if (strict && !["{", "["].includes(raw[0])) {
            throw new HttpError(400, "En modo estricto el JSON debe ser un objeto o un arreglo", "entity.parse.failed");
        }

        try {
            req.body = JSON.parse(raw);
        } catch {
            throw new HttpError(400, "JSON malformado en el body", "entity.parse.failed");
        }

        next();
    };
}

export { jsonBody, HttpError };
