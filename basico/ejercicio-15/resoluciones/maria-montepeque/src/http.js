function sendJson(res, status, payload) {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
}

function readJson(req) {
    return new Promise((resolve, reject) => {
        let raw = "";
        req.setEncoding("utf-8");
        req.on("data", (chunk) => (raw += chunk));
        req.on("end", () => {
            try {
                resolve(raw ? JSON.parse(raw) : {});
            } catch {
                reject(new Error("El body debe ser JSON valido"));
            }
        });
        req.on("error", reject);
    });
}

export { sendJson, readJson };