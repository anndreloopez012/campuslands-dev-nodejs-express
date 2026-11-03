import { HttpError } from "../core/errors.js";

function jsonBody({ limitKb }) {
    const maxBytes = limitKb * 1024;

    return async (req) => {
        req.body = {};
        if (!["POST", "PUT", "PATCH"].includes(req.method)) return;

        if (!(req.headers["content-type"] ?? "").includes("application/json")) {
            throw new HttpError(415, "Content-Type debe ser application/json");
        }

        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
            size += chunk.length;
            if (size > maxBytes) throw new HttpError(413, `El body supera ${limitKb} KB`);
            chunks.push(chunk);
        }

        const raw = Buffer.concat(chunks).toString("utf-8").trim();
        if (!raw) throw HttpError.badRequest("El body no puede estar vacio");

        try {
            req.body = JSON.parse(raw);
        } catch {
            throw HttpError.badRequest("El body no es JSON valido");
        }
    };
}

export { jsonBody };
