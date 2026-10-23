function json(res, status, payload) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
}

async function readJson(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString("utf-8").trim();

    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch {
        const error = new Error("El body debe ser JSON valido");
        error.status = 400;
        throw error;
    }
}

export { json, readJson };
